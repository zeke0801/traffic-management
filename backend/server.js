require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

console.log('Starting server...');
console.log('Environment:', process.env.NODE_ENV);
console.log('MongoDB URI exists:', !!process.env.MONGODB_URI);

// Middleware
app.use(cors());
app.use(express.json());

// Basic root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Traffic Management API is running' });
});

// Health Check endpoint
app.get('/health', (req, res) => {
  console.log('Health check requested');
  const healthcheck = {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: Date.now(),
    mongoConnection: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  };
  res.status(200).json(healthcheck);
});

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
    }).sort({ createdAt: -1 });
    res.json(incidents);
  } catch (error) {
    console.error('Error fetching incidents:', error);
    res.status(500).json({ error: 'Error fetching incidents' });
  }
});

app.post('/api/incidents', async (req, res) => {
  try {
    console.log('Received incident data:', req.body);
    const incident = new Incident(req.body);
    await incident.save();
    res.status(201).json(incident);
  } catch (error) {
    console.error('Error creating incident:', error);
    res.status(400).json({ error: 'Error creating incident', details: error.message });
  }
});

app.delete('/api/incidents/:id', async (req, res) => {
  try {
    await Incident.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Incident deleted successfully' });
  } catch (error) {
    console.error('Error deleting incident:', error);
    res.status(500).json({ error: 'Error deleting incident' });
  }
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check available at: http://localhost:${PORT}/health`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    // Don't exit the process, just log the error
    console.log('Server starting without MongoDB connection...');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (without MongoDB)`);
    });
  });
