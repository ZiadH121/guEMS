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
    const { title, description, capacity, venue, date } = req.body;
    const venueDoc = await Venue.findById(venue);
    if (!venueDoc) {
      return res.status(400).json({ error: res.__('proposal.invalidVenue') });
    }
    const newProposal = new Proposal({
      title,
      description,
      capacity,
      venue,
      date,
      proposer: req.user.id
    });
    await newProposal.save();
    res.json({ message: res.__('proposal.submitted'), proposal: newProposal });
  } catch (err) {
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
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) return res.status(404).json({ error: res.__('proposal.notFound') });

    proposal.status = 'approved';
    await proposal.save();

    const booking = new Booking({
      type: 'event',
      itemId: proposal.venue,
      details: {
        event: proposal.title,
        date: proposal.date,
        capacity: proposal.capacity
      },
      status: 'confirmed',
      user: proposal.proposer
    });
    await booking.save();

    res.json({ message: res.__('proposal.approved'), proposal });
  } catch (err) {
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

module.exports = router;
