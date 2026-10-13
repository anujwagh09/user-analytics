require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const eventsRouter = require('./routes/events');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', eventsRouter);

// Serve the tracker script and demo pages
app.get('/tracker.js', (req, res) => {
  res.sendFile(path.join(__dirname, '../tracker/tracker.js'));
});
app.use('/demo', express.static(path.join(__dirname, '../demo')));

app.get('/', (req, res) => {
  res.send('Analytics server is alive');
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
  });