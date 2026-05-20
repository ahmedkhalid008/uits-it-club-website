const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('../db');
const User = require('../models/User');
const router = express.Router();

// Middleware to check database connection
router.use((req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ 
            error: 'Database not connected. Please check your MongoDB URI and Atlas Network Access (Whitelist IP).' 
        });
    }
    next();
});

router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const role = email === '04324205191008@uits.edu.bd' ? 'Admin' : 'General Member';
        const user = new User({ name, email, password, role });
        await user.save();
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
        res.status(201).send({ user, token });
    } catch (error) {
        res.status(400).send(error);
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).send({ error: 'Invalid login credentials' });
        }
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
        res.send({ user, token });
    } catch (error) {
        res.status(400).send(error);
    }
});

module.exports = router;
