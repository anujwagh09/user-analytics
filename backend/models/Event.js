const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  session_id: { type: String, required: true },
  type: { type: String, enum: ['page_view', 'click'], required: true },
  page_url: { type: String, required: true },
  timestamp: { type: Date, required: true },

  // only filled for click events
  x: Number,
  y: Number,
  page_width: Number,
  page_height: Number,
});

// Indexes = filing labels, so searches stay fast
eventSchema.index({ session_id: 1, timestamp: 1 });
eventSchema.index({ type: 1, page_url: 1 });

module.exports = mongoose.model('Event', eventSchema);