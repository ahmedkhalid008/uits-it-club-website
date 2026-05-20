const express = require('express');
const Event = require('../models/Event');
const User = require('../models/User');
const Message = require('../models/Message');
const Roadmap = require('../models/Roadmap');
const { auth, adminOnly } = require('../middleware/auth');
const router = express.Router();

// Events
router.get('/events', async (req, res) => {
    try {
        const events = await Event.find().sort({ date: 1 });
        res.send(events);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.post('/events', auth, adminOnly, async (req, res) => {
    try {
        const event = new Event({
            ...req.body,
            createdBy: req.user.id
        });
        await event.save();
        res.status(201).send(event);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.delete('/events/:id', auth, adminOnly, async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) return res.status(404).send();
        res.send(event);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Members
router.get('/members', auth, adminOnly, async (req, res) => {
    try {
        const members = await User.find({ role: 'General Member' }).select('-password');
        res.send(members);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.delete('/members/:id', auth, adminOnly, async (req, res) => {
    try {
        const member = await User.findByIdAndDelete(req.params.id);
        if (!member) return res.status(404).send();
        res.send(member);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Roadmaps
router.get('/roadmaps/admin', auth, adminOnly, async (req, res) => {
    try {
        const roadmaps = await Roadmap.find().sort({ createdAt: -1 }).populate('submittedBy', 'name email');
        res.send(roadmaps);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.patch('/roadmaps/:id/status', auth, adminOnly, async (req, res) => {
    try {
        const roadmap = await Roadmap.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
        if (!roadmap) return res.status(404).send();
        res.send(roadmap);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.get('/roadmaps/:category', async (req, res) => {
    try {
        // Only return approved roadmaps for public viewing
        const roadmaps = await Roadmap.find({ 
            category: req.params.category,
            status: 'approved'
        }).sort({ createdAt: -1 }).populate('submittedBy', 'name');
        res.send(roadmaps);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.post('/roadmaps', auth, async (req, res) => {
    try {
        const roadmap = new Roadmap({
            ...req.body,
            submittedBy: req.user.id
        });
        await roadmap.save();
        res.status(201).send(roadmap);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Contact Form
router.get('/contact/messages', auth, adminOnly, async (req, res) => {
    try {
        const messages = await Message.find().sort({ createdAt: -1 });
        res.send(messages);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.post('/contact', async (req, res) => {
    try {
        const message = new Message(req.body);
        await message.save();
        res.status(201).send({ message: 'Message sent successfully' });
    } catch (error) {
        res.status(400).send(error);
    }
});

module.exports = router;
