// availability.js - Real-time availability logic

const express = require('express');
const Booking = require('../models/Booking');
const Venue = require('../models/Venue');
const router = express.Router();

router.get('/availability/event/:id', async (req, res) => {
  try {
    const eventId = decodeURIComponent(req.params.id);
    const [name, date, time] = eventId.split('__');

    const eventBookings = await Booking.find({
      itemId: eventId,
      type: 'event',
      status: { $in: ['pending', 'confirmed'] }
    });

    const takenSeats = new Set(eventBookings.map(b => b.details?.seat));
    let capacity = parseInt(eventBookings[0]?.details?.capacity || 0);

    if (!capacity) {
      const eventInfo = await Booking.findOne({
        type: 'event',
        'details.event': name,
        'details.date': date
      });
      capacity = parseInt(eventInfo?.details?.capacity || 0);
    }

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
