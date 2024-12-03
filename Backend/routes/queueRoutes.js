const express = require('express');
const { auth, isAdmin } = require('../middleware/authMiddleware');
const Queue = require('../models/Queue');
const User = require('../models/User');
const router = express.Router();

let io;

// Socket.IO initialization function
const initializeSocket = (server) => {
  io = require('socket.io')(server, {
    cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] },
  });

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
};

// Get queue status
router.get('/status/:barId', auth, async (req, res) => {
  try {
    const queue = await Queue.findOne({ barId: req.params.barId });
    if (!queue) return res.status(404).json({ msg: 'Queue not found' });

    res.json({
      isQueueOpen: queue.isOpen,
      queueLength: queue.users.length,
      queue: queue.users,
      
    });
  } catch (err) {
    console.error('Error getting queue status:', err.message);
    res.status(500).send('Server error');
  }
});

// Open queue
router.post('/open/:barId', auth, isAdmin, async (req, res) => {
  const { maxQueueLength = 250 } = req.body;
  try {
    let queue = await Queue.findOne({ barId: req.params.barId });
    if (!queue) {
      queue = new Queue({ barId: req.params.barId, isOpen: true, users: [], maxQueueLength });
    } else {
      queue.isOpen = true;
      queue.users = [];
      queue.maxQueueLength = maxQueueLength;
    }
    await queue.save();

    io.emit('queue-status', { barId: req.params.barId, isOpen: true, maxQueueLength });
    res.json({ msg: 'Queue opened', queueLength: queue.users.length });
  } catch (err) {
    console.error('Error opening queue:', err.message);
    res.status(500).send('Server error');
  }
});

// Close queue
router.post('/close/:barId', auth, isAdmin, async (req, res) => {
  try {
    const queue = await Queue.findOne({ barId: req.params.barId });
    if (!queue) return res.status(404).json({ msg: 'Queue not found' });

    queue.isOpen = false;
    await queue.save();

    io.emit('queue-status', { barId: req.params.barId, isOpen: false });
    res.json({ msg: 'Queue closed' });
  } catch (err) {
    console.error('Error closing queue:', err.message);
    res.status(500).send('Server error');
  }
});

// Join queue
router.post('/:barId/join', auth, async (req, res) => {
  try {
    const queue = await Queue.findOne({ barId: req.params.barId });
    if (!queue || !queue.isOpen) return res.status(400).json({ msg: 'Queue is not open' });

    if (queue.users.find((user) => user.userId.toString() === req.user.id.toString())) {
      return res.status(400).json({ msg: 'User already in queue' });
    }

    if (queue.users.length >= queue.maxQueueLength) {
      return res.status(400).json({ msg: 'Queue is full' });
    }

    const user = await User.findById(req.user.id).select('username');
    queue.users.push({ userId: user._id, name: user.username });
    await queue.save();

    io.emit('queue-updated', { barId: req.params.barId, queue: queue.users, queueLength: queue.users.length });
    res.json({ msg: 'Joined queue', queueLength: queue.users.length });
  } catch (err) {
    console.error('Error joining queue:', err.message);
    res.status(500).send('Server error');
  }
});

// Leave queue
router.post('/:barId/leave', auth, async (req, res) => {
  try {
    const queue = await Queue.findOne({ barId: req.params.barId });
    if (!queue || !queue.isOpen) return res.status(400).json({ msg: 'Queue is not open' });

    const userIndex = queue.users.findIndex((user) => user.userId.toString() === req.user.id.toString());
    if (userIndex === -1) {
      return res.status(400).json({ msg: 'User not in queue' });
    }

    queue.users.splice(userIndex, 1); // Remove user from queue
    await queue.save();

    io.emit('queue-updated', { barId: req.params.barId, queue: queue.users, queueLength: queue.users.length });
    res.json({ msg: 'Left queue', queueLength: queue.users.length });
  } catch (err) {
    console.error('Error leaving queue:', err.message);
    res.status(500).send('Server error');
  }
});

module.exports = { router, initializeSocket };
