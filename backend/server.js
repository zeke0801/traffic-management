require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Schema
const incidentSchema = new mongoose.Schema({
  type: String,
  coordinates: [[Number]], // Array of [lat, lng] pairs
  description: String,
  expiryTime: Date,
  createdAt: { type: Date, default: Date.now }
});

const Incident = mongoose.model('Incident', incidentSchema);

// Routes
app.get('/api/incidents', async (req, res) => {
  try {
    const currentTime = new Date();
    const incidents = await Incident.find({
      expiryTime: { $gt: currentTime }
    });
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching incidents' });
  }
});

app.post('/api/incidents', async (req, res) => {
  try {
    const incident = new Incident(req.body);
    await incident.save();
    res.status(201).json(incident);
  } catch (error) {
    res.status(400).json({ error: 'Error creating incident' });
  }
});

app.delete('/api/incidents/:id', async (req, res) => {
  try {
    await Incident.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Incident deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting incident' });
  }
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });
