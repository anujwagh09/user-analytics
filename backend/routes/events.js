const express = require('express');
const Event = require('../models/Event');
const router = express.Router();

// POST /api/events  → save one event
router.post('/events', async (req, res) => {
  try {
    const e = req.body;

    // 1. Validate
    if (!e.session_id || !['page_view', 'click'].includes(e.type) || !e.page_url) {
      return res.status(400).json({ error: 'session_id, type and page_url are required' });
    }

    const time = new Date(e.timestamp);
    if (isNaN(time)) {
      return res.status(400).json({ error: 'invalid timestamp' });
    }

    // 2. Save to the database
    const event = await Event.create({
      session_id: e.session_id,
      type: e.type,
      page_url: e.page_url,
      timestamp: time,
      x: e.x,
      y: e.y,
      page_width: e.page_width,
      page_height: e.page_height,
    });

    // 3. Reply
    res.status(201).json({ saved: true, id: event._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// GET /api/sessions → every session with its event count
router.get('/sessions', async (req, res) => {
  try {
    const rows = await Event.aggregate([
      {
        $group: {
          _id: '$session_id',
          total_events: { $sum: 1 },
          clicks: { $sum: { $cond: [{ $eq: ['$type', 'click'] }, 1, 0] } },
          first_seen: { $min: '$timestamp' },
          last_seen: { $max: '$timestamp' },
        },
      },
      { $sort: { last_seen: -1 } },
    ]);

    res.json(
      rows.map((r) => ({
        session_id: r._id,
        total_events: r.total_events,
        clicks: r.clicks,
        first_seen: r.first_seen,
        last_seen: r.last_seen,
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// GET /api/sessions/:id/events → one visitor's journey, in order
router.get('/sessions/:id/events', async (req, res) => {
  try {
    const events = await Event.find({ session_id: req.params.id })
      .sort({ timestamp: 1 })
      .lean();
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// GET /api/pages → list of tracked page URLs (for the heatmap dropdown)
router.get('/pages', async (req, res) => {
  try {
    const pages = await Event.distinct('page_url');
    res.json(pages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// GET /api/heatmap?url=... → click positions for one page
router.get('/heatmap', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ error: 'url query param is required' });
    }
    const clicks = await Event.find({ type: 'click', page_url: url })
      .select('x y page_width page_height -_id')
      .lean();
    res.json(clicks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});
module.exports = router;