const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const routes = require('./routes/index');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../public')));
}

// Routes
app.use('/api', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Catch-all handler: send back React's index.html file in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler for API routes only in development
if (process.env.NODE_ENV !== 'production') {
  app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });
}

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});