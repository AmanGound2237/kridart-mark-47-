const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');

// Route files
const assets = require('./routes/assets');
const games = require('./routes/games');
const users = require('./routes/users');
const ai = require('./routes/ai');

// Create express app
const app = express();

// Connect to database
connectDB();

// Enable CORS
app.use(cors());

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Mount routers
app.use('/api/assets', assets);
app.use('/api/games', games);
app.use('/api/users', users);
app.use('/api/ai', ai);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client', 'build', 'index.html'));
  });
}

module.exports = app;