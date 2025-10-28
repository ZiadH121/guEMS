// bookings.js - Handles event/venue booking and cancellation

const express = require('express');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const Venue = require('../models/Venue');
const verifyToken = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

router.patch('/bookings/:id', verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user.id });
    if (!booking) return res.status(404).json({ error: res.__('bookings.notFound') });

    if (req.body.status === 'confirmed') {
      booking.status = 'confirmed';
      booking.expiresAt = null;
      await booking.save();
      return res.json({ message: res.__('bookings.bookingConfirm'), booking });
    }

    return res.status(400).json({ error: res.__('bookings.invalidUpdate') });
  } catch (err) {
    console.error('Booking update error:', err);
    res.status(500).json({ error: res.__('bookings.failedUpdateBooking') });
  }
});

router.post('/bookings', verifyToken, async (req, res) => {
  const { type, itemId, details } = req.body;

  if (!type || !itemId || !details) {
    return res.status(400).json({ error: res.__('bookings.missingDetails') });
  }

  if (type === 'venue' && req.user.role !== 'organizer' && req.user.role !== 'staff') {
    return res.status(403).json({ error: res.__('bookings.missingPerms') });
  }

  try {
    const cutoff = new Date(Date.now() - 15 * 60 * 1000);

    if (req.user.role === 'staff' && type === 'event') {
      const booking = new Booking({
        user: req.user.id,
        type,
        itemId,
        details,
        status: 'confirmed'
      });

      await booking.save();
      return res
        .status(201)
        .json({ message: res.__('bookings.successfulBooking'), booking });
    }

    if (type === 'venue' && Array.isArray(details.slots)) {
      const bookings = [];

      for (const slotTime of details.slots) {
        const composedItemId = `${details.name}__${details.date}`;

        const existing = await Booking.findOne({
          user: req.user.id,
          itemId: composedItemId,
          status: { $ne: 'cancelled' },
          createdAt: { $gte: cutoff },
          'details.time': slotTime
        });

        if (existing) {
          console.warn(
            `[Duplicate Blocked] User ${req.user.id} already has booking for ${slotTime}`
          );
          continue;
        }

        const booking = new Booking({
          user: req.user.id,
          type,
          itemId: composedItemId,
          venueRef: req.body.venueId,
          details: {
            ...details,
            time: slotTime
          },
          status: 'pending',
          expiresAt: new Date(Date.now() + 15 * 60 * 1000)
        });

        await booking.save();
        bookings.push(booking);
      }

      return res
        .status(201)
        .json({ message: res.__('bookings.successfulBooking'), bookings });
    }

    const existing = await Booking.findOne({
      user: req.user.id,
      itemId,
      status: { $ne: 'cancelled' },
      createdAt: { $gte: cutoff },
      ...(type === 'event'
        ? { 'details.seat': details.seat }
        : { 'details.time': details.time })
    });

    if (existing) {
      console.warn(`[Duplicate Blocked] User: ${req.user.id} already reserved ${itemId}`);
      return res.status(409).json({ error: res.__('bookings.alreadyReserved') });
    }

    const booking = new Booking({
      user: req.user.id,
      type,
      itemId,
      venueRef: type === 'venue' ? req.body.venueId : undefined,
      details,
      status: 'pending',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000)
    });

    await booking.save();
    res.status(201).json({ message: res.__('bookings.pendingSaved'), booking });
  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({ error: res.__('bookings.serverError') });
  }
});

router.get('/bookings', verifyToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('venueRef', '_id')
      .sort({ createdAt: -1 });

    const filtered = bookings.filter((b) => {
      if (b.type !== 'venue') return true;
      return b.venueRef !== null;
    });

    res.json(filtered);
  } catch (err) {
    console.error('Booking fetch error:', err);
    res.status(500).json({ error: res.__('bookings.failedLoadBookings') });
  }
});

router.get('/events/public', async (req, res) => {
  try {
    const bookings = await Booking.find({
      type: { $in: ['venue', 'event'] },
      status: 'confirmed',
      'details.event': { $exists: true }
    }).sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    console.error('Public event fetch error:', err);
    res.status(500).json({ error: res.__('bookings.failedLoadEvents') });
  }
});

router.delete('/bookings/:id', verifyToken, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'staff' || req.user.role === 'admin';

    const booking = await Booking.findOne(
      isAdmin
        ? { _id: req.params.id }
        : { _id: req.params.id, user: req.user.id }
    );

    if (!booking) {
      return res.status(404).json({ error: res.__('bookings.notFound') });
    }

    booking.status = 'cancelled';
    await booking.save();

    if (booking.type === 'venue') {
      const activeBookings = await Booking.find({
        itemId: booking.itemId,
        status: 'confirmed',
        type: 'venue'
      });

      if (activeBookings.length === 0) {
        await Venue.findOneAndUpdate(
          { name: booking.details.name, date: booking.details.date },
          { status: 'Available' }
        );
      }

      const notifMatch = {
        itemId: booking.itemId,
        type: 'venue',
        status: 'pending',
        'details.time': booking.details.time
      };

      const foundNotif = await Notification.findOne(notifMatch);
      if (foundNotif) {
        foundNotif.status = 'sent';
        await foundNotif.save();
      }
    } else {
      const matchFields = {
        itemId: booking.itemId,
        type: booking.type,
        status: 'pending'
      };

      if (booking.details?.seat) {
        matchFields['details.seat'] = booking.details.seat;
      }

      if (booking.details?.time) {
        matchFields['details.time'] = booking.details.time;
      }

      const matchingNotifications = await Notification.find(matchFields);

      for (const n of matchingNotifications) {
        n.status = 'sent';
        await n.save();
      }
    }

    res.json({ message: res.__('bookings.cancelledNotifications'), booking });
  } catch (err) {
    console.error('Cancel error:', err);
    res.status(500).json({ error: res.__('bookings.cancelFail') });
  }
});

router.get('/admin/bookings', verifyToken, requireRole('staff'), async (req, res) => {
  try {
    const { type, status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (type && type !== 'all') query.type = type;
    if (status && status !== 'all') query.status = status;

    if (search && search.trim()) {
      query.$or = [
        { 'details.event': { $regex: search, $options: 'i' } },
        { 'details.venue': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Booking.countDocuments(query);

    const bookings = await Booking.find(query)
      .populate('user', 'name email')
      .populate('venueRef', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      bookings,
      pagination: {
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('Admin booking fetch error:', err);
    res.status(500).json({ error: res.__('bookings.failedLoadBookings') });
  }
});

router.get('/bookings/export/:eventName', verifyToken, requireRole('staff'), async (req, res) => {
  try {
    const eventName = decodeURIComponent(req.params.eventName).trim();

    const bookings = await Booking.find({
      type: 'event',
      status: 'confirmed',
      $or: [
        { 'details.event': { $regex: `^${eventName}$`, $options: 'i' } },
        { itemId: { $regex: `^${eventName}(__|$)`, $options: 'i' } }
      ]
    })
      .populate('user', 'name email role')
      .sort({ createdAt: 1 });

    if (!bookings.length) {
      return res.status(404).json({ error: res.__('bookings.noAttendees') });
    }

    const filtered = bookings.filter(b =>
      !['staff', 'admin', 'organizer'].includes(b.user?.role)
    );

    const rows = filtered.map(b => ({
      Name: b.user?.name || '—',
      Email: b.user?.email || '—',
      Seat: b.details?.seat || '—',
      Date: new Date(b.details?.date).toLocaleDateString(),
      Venue: b.details?.venue || '—'
    }));

    let csv = '\uFEFFName,Email,Seat,Date,Venue\n';
    csv += rows.map(r => `${r.Name},${r.Email},${r.Seat},${r.Date},${r.Venue}`).join('\n');

    res.header('Content-Type', 'text/csv; charset=utf-8');
    res.attachment(`attendees_${eventName}.csv`);
    res.send(csv);
  } catch (err) {
    console.error('CSV export error:', err);
    res.status(500).json({ error: res.__('bookings.exportFail') });
  }
});

router.get('/bookings/export-events', verifyToken, requireRole('staff'), async (req, res) => {
  try {
    const bookings = await Booking.find({
      type: 'event',
      'details.event': { $exists: true }
    })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    if (bookings.length === 0) {
      return res.status(404).json({ error: res.__('bookings.noEventsFound') });
    }

    const grouped = {};
    for (const b of bookings) {
      const name = b.details?.event || 'Unnamed Event';
      if (!grouped[name]) {
        grouped[name] = {
          name,
          venue: b.details?.venue || '—',
          date: b.details?.date || '—',
          capacity: b.details?.capacity || 0,
          creator: b.details?.creator || b.user,
          confirmed: 0
        };
      }
      if (b.status === 'confirmed') grouped[name].confirmed += 1;
    }

    const rows = Object.values(grouped).map(g => ({
      Event: g.name,
      Venue: g.venue,
      Date: new Date(g.date).toLocaleDateString(),
      Capacity: g.capacity,
      Confirmed: g.confirmed,
      Creator: g.creator?.name || '—',
      Email: g.creator?.email || '—'
    }));


    let csv = 'Name,Email,Seat,Date,Venue\n';
      csv += rows.map(r => `${r.Name},${r.Email},${r.Seat},${r.Date},${r.Venue}`).join('\n');

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename*=UTF-8''${encodeURIComponent(`attendees_${eventName}.csv`)}`
      );
      res.send('\uFEFF' + csv);

  } catch (err) {
    console.error('Events CSV export error:', err);
    res.status(500).json({ error: res.__('bookings.exportFail') });
  }
});

module.exports = router;
