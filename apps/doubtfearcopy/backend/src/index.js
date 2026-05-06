const express = require('express');
const cors = require('cors');
const config = require('./config');
const paymentRoutes = require('./routes/payment');
const onboardingRoutes = require('./routes/onboarding');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');

const app = express();

// Middleware
// Configure CORS with specalloweific options
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'https://toriate.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization',
    'Cache-Control',
    'X-Requested-With',
    'Accept',
  'pragma'
  ]
}));

// Add explicit OPTIONS handler for preflight requests
app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', paymentRoutes);
app.use('/api', onboardingRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Tori Ate API is running');
});

// For Vercel, we export the Express app instead of starting the server directly
if (process.env.NODE_ENV === 'production') {
  // Export app for Vercel serverless function
  module.exports = app;
} else {
  // Start server for local development
  app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
  });
}