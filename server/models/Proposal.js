// models/Proposal.js
const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  capacity: Number,
  venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue' },
  date: String,

  slotType: { type: String, default: 'preset' },
  slot: { type: String, default: '' },
  startTime: { type: String, default: '' },
  endTime: { type: String, default: '' },

  price: { type: Number, default: 0 },
  image: { type: String, default: '' },

  sldNeeds: String,
  proposer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Proposal', proposalSchema);
