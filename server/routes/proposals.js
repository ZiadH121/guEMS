// routes/proposals.js
const express = require('express');
const Proposal = require('../models/Proposal');
const Booking = require('../models/Booking');
const verifyToken = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const router = express.Router();
const Venue = require('../models/Venue');

router.post('/', verifyToken, async (req, res) => {
  try {
    const {
      title,
      description,
      capacity,
      venue,
      date,
      sldNeeds,
      slotType,
      slot,
      startTime,
      endTime
    } = req.body;

    const venueDoc = await Venue.findById(venue);
    if (!venueDoc) {
      return res.status(400).json({ error: res.__('proposal.invalidVenue') });
    }

    if (slotType === 'preset') {
      if (!slot) {
        return res.status(400).json({ error: res.__('proposal.missingSlot') });
      }
    } else if (slotType === 'custom') {
      if (!startTime || !endTime) {
        return res.status(400).json({ error: res.__('proposal.missingCustomTime') });
      }

      if (startTime >= endTime) {
        return res.status(400).json({ error: res.__('proposal.invalidTimeOrder') });
      }

      if (startTime < '10:00' || endTime > '22:00') {
        return res.status(400).json({ error: res.__('proposal.outOfHours') });
      }
    }

    if (req.body.price && req.body.price < 0) {
      return res.status(400).json({ error: res.__('proposal.invalidPrice') });
    }


    const newProposal = new Proposal({
      title,
      description,
      capacity,
      venue,
      date,
      sldNeeds,
      slotType,
      slot,
      startTime,
      endTime,
      proposer: req.user.id
    });

    await newProposal.save();
    res.json({ message: res.__('proposal.submitted'), proposal: newProposal });
  } catch (err) {
    console.error('Proposal submission error:', err);
    res.status(500).json({ error: res.__('proposal.submitError') });
  }
});

router.get('/', verifyToken, requireRole('staff'), async (req, res) => {
  try {
    const proposals = await Proposal.find().populate('proposer', 'name email').populate('venue', 'name');
    res.json(proposals);
  } catch (err) {
    res.status(500).json({ error: res.__('proposal.fetchError') });
  }
});


router.patch('/:id/approve', verifyToken, requireRole('staff'), async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id).populate('venue', 'name');
    if (!proposal) return res.status(404).json({ error: res.__('proposal.notFound') });

    proposal.status = 'approved';
    await proposal.save();

    const booking = new Booking({
      type: 'event',
      itemId: proposal.venue._id,
      details: {
        event: proposal.title,
        description: proposal.description,
        venue: proposal.venue.name,
        date: proposal.date,
        capacity: proposal.capacity
      },
      status: 'confirmed',
      user: proposal.proposer
    });
    await booking.save();

    res.json({ message: res.__('proposal.approved'), proposal });
  } catch (err) {
    console.error('Proposal approval error:', err);
    res.status(500).json({ error: res.__('proposal.approveError') });
  }
});

router.patch('/:id/reject', verifyToken, requireRole('staff'), async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) return res.status(404).json({ error: res.__('proposal.notFound') });

    proposal.status = 'rejected';
    await proposal.save();

    res.json({ message: res.__('proposal.rejected'), proposal });
  } catch (err) {
    res.status(500).json({ error: res.__('proposal.rejectError') });
  }
});

router.delete('/:id', verifyToken, requireRole('staff'), async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) return res.status(404).json({ error: res.__('proposal.notFound') });

    const Booking = require('../models/Booking');
    await Booking.deleteMany({ 'details.event': proposal.title });

    await proposal.deleteOne();

    res.json({ message: res.__('proposal.deleted') });
  } catch (err) {
    console.error('Proposal delete error:', err);
    res.status(500).json({ error: res.__('proposal.deleteError') });
  }
});

module.exports = router;
