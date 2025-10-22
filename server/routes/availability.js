// availability.js - Real-time availability logic

const express = require('express');
const Booking = require('../models/Booking');
const Venue = require('../models/Venue');
const router = express.Router();

router.get('/availability/event/:id', async (req, res) => {
  try {
    const eventId = req.params.id;

    const eventInfo = await Booking.findOne({
      $or: [{ _id: eventId }, { itemId: eventId }],
      type: 'event'
    });

    if (!eventInfo) {
      console.warn(`[AVAILABILITY] Event not found for id: ${eventId}`);
      return res.status(404).json({ error: res.__('availability.eventNotFound') });
    }

    const eventName = eventInfo.details.event;
    const eventDate = eventInfo.details.date;
    const eventCapacity = parseInt(eventInfo.details.capacity || 0);

    const eventBookings = await Booking.find({
      type: 'event',
      'details.event': eventName,
      'details.date': eventDate,
      status: { $in: ['pending', 'confirmed'] }
    });

    const takenSeats = new Set(eventBookings.map(b => b.details?.seat));

    const seats = Array.from({ length: eventCapacity }).map((_, i) => {
      const seatId = (i + 1).toString();
      return {
        id: seatId,
        status: takenSeats.has(seatId) ? 'booked' : 'available'
      };
    });

    res.json({ seats });
  } catch (err) {
    console.error('Event seat availability error:', err);
    res.status(500).json({ error: res.__('availability.seatLoadFail') });
  }
});

router.get('/availability/event/:id', async (req, res) => {
  try {
    const eventId = decodeURIComponent(req.params.id);
    const [name, date, time] = eventId.split('__');
    const confirmedBookings = await Booking.find({
      itemId: eventId,
      type: 'event',
      status: 'confirmed'
    });

    const takenSeats = new Set(confirmedBookings.map(b => b.details?.seat));
    let capacity = parseInt(confirmedBookings[0]?.details?.capacity || 0);

    if (!capacity) {
      const venue = await Venue.findOne({ name: new RegExp(`^${name}$`, 'i'), date });
      capacity = parseInt(venue?.capacity || 24);
    }

    const seats = Array.from({ length: capacity }).map((_, i) => {
      const seatId = (i + 1).toString();
      return {
        id: seatId,
        status: takenSeats.has(seatId) ? 'booked' : 'available'
      };
    });

    res.json({ seats });
  } catch (err) {
    console.error('Event seat availability error:', err);
    res.status(500).json({ error: res.__('availability.seatLoadFail') });
  }
});

module.exports = router;
