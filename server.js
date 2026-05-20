// Formspree Integration: https://formspree.io/f/xlgaoabv (Target Email: 04324205191008@uits.edu.bd)
require('dotenv').config();
const express = require('express');
const mongoose = require('./server/db');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');

const authRoutes = require('./server/routes/auth');
const apiRoutes = require('./server/routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet({
    contentSecurityPolicy: false, // Allow external assets like fonts/images more easily
}));
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

// Serve frontend for any other route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'local');

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Access the website at: http://localhost:${PORT}`);
});
