const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/db');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Allow all origins in local testing, or configure for specific domains
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

// Status check
app.get('/status', (req, res) => {
  res.json({ status: 'API is online and running successfully!' });
});

// Start database and server
async function startServer() {
  try {
    // Try to initialize database
    await db.initDB();
    
    // Start listening
    app.listen(PORT, () => {
      console.log(`Backend Server is running on port ${PORT}`);
      console.log(`Test endpoint: http://localhost:${PORT}/status`);
    });
  } catch (err) {
    console.error('Database connection failed on server startup:', err.message);
    console.log('Ensure XAMPP MySQL is running on port 3306 and accepting root user logins.');
    process.exit(1);
  }
}

startServer();
