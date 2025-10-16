// models/Proposal.js
const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  capacity: Number,
  venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue' },
  date: String,
  slot: String,
  sldNeeds: String,
  proposer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Proposal', proposalSchema);
