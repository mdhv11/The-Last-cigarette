const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/plan', require('./routes/plan'));
app.use('/api/cigs', require('./routes/cigs'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/journal', require('./routes/journal'));

// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to TheLastCigarette API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, error: 'Server Error' });
});

module.exports = app;
