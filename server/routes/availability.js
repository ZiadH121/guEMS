// availability.js - Safe and flexible seat availability logic
const express = require('express');
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Venue = require('../models/Venue');
const router = express.Router();

router.get('/availability/event/:id', async (req, res) => {
  try {
    const eventId = decodeURIComponent(req.params.id);

    let eventInfo = null;

    if (mongoose.Types.ObjectId.isValid(eventId)) {
      eventInfo = await Booking.findOne({ _id: eventId, type: 'event' });
    }

    if (!eventInfo) {
      eventInfo =
        (await Booking.findOne({ itemId: eventId, type: 'event' })) ||
        (await Booking.findOne({
          type: 'event',
          $or: [
            { itemId: { $regex: `^${eventId.split('__')[0]}(__|$)`, $options: 'i' } },
            { 'details.event': { $regex: `^${eventId.split('__')[0]}`, $options: 'i' } }
          ]
        }));
    }

    if (!eventInfo) {
      console.warn(`[AVAILABILITY] No event found for id: ${eventId}`);
      return res.status(404).json({ error: res.__('availability.eventNotFound') });
    }

    const eventName = eventInfo.details?.event;
    const eventDate = eventInfo.details?.date;

    let capacity = parseInt(eventInfo.details?.capacity || 0);
    if (!capacity || isNaN(capacity)) {
      const venue = await Venue.findOne({ name: eventInfo.details?.venue, date: eventDate });
      capacity = parseInt(venue?.capacity || 0);
    }

    const confirmedBookings = await Booking.find({
      type: 'event',
      'details.event': eventName,
      'details.date': eventDate,
      status: 'confirmed'
    });

    const takenSeats = new Set(confirmedBookings.map(b => b.details?.seat));

    const seats = Array.from({ length: capacity }).map((_, i) => {
      const seatId = (i + 1).toString();
      return {
        id: seatId,
        status: takenSeats.has(seatId) ? 'booked' : 'available'
      };
    });

    res.json({
      seats,
      capacity,
      taken: takenSeats.size,
      available: capacity - takenSeats.size
    });
  } catch (err) {
    console.error('Event seat availability error:', err);
    res.status(500).json({ error: res.__('availability.seatLoadFail') });
  }
});

module.exports = router;
