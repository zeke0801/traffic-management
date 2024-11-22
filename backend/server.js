require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Startup logging
console.log('Starting server...');
console.log('Environment:', process.env.NODE_ENV);
console.log('Port:', PORT);
console.log('MongoDB URI exists:', !!process.env.MONGODB_URI);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

// Middleware
app.use(cors());
app.use(express.json());

// Basic root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Traffic Management API is running',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
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

// Start server function
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('Connected to MongoDB');
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check available at: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Server startup error:', error);
    // Start server even if MongoDB fails
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT} (without MongoDB)`);
    });
  }
};

// Handle process errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});

// Start the server
startServer();
