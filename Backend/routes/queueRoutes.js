const express = require('express');
const { auth, isAdmin } = require('../middleware/authMiddleware');
const Queue = require('../models/Queue');
const User = require('../models/User');
const router = express.Router();

router.get('/status/:barId', auth, async (req, res) => {
  try {
    console.log(`Request to get queue status for bar ID: ${req.params.barId}`);
    const queue = await Queue.findOne({ barId: req.params.barId });
    if (!queue) {
      console.log(`Queue not found for bar ID: ${req.params.barId}`);
      return res.status(404).json({ msg: 'Queue not found' });
    }
    console.log(`Queue status for bar ID: ${req.params.barId}`, queue);
    res.json({ isQueueOpen: queue.isOpen, queueLength: queue.users.length, queue: queue.users });
  } catch (err) {
    console.error('Error getting queue status:', err.message);
    res.status(500).send('Server error');
  }
});

router.post('/open/:barId', auth, isAdmin, async (req, res) => {
  try {
    console.log(`Opening queue for bar ID: ${req.params.barId}`);
    console.log('User:', req.user);

    let queue = await Queue.findOne({ barId: req.params.barId });
    if (!queue) {
      console.log(`No existing queue found for bar ID: ${req.params.barId}, creating new queue.`);
      queue = new Queue({ barId: req.params.barId, isOpen: true, users: [] });
    } else {
      console.log(`Existing queue found for bar ID: ${req.params.barId}, opening queue.`);
      queue.isOpen = true;
      queue.users = [];
    }
    await queue.save();
    console.log(`Queue opened for bar ID: ${req.params.barId}`);
    res.json({ msg: 'Queue opened', queueLength: queue.users.length });
  } catch (err) {
    console.error('Error opening queue:', err.message);
    res.status(500).send('Server error');
  }
});

router.post('/close/:barId', auth, isAdmin, async (req, res) => {
  try {
    console.log(`Closing queue for bar ID: ${req.params.barId}`);
    console.log('User:', req.user);

    const queue = await Queue.findOne({ barId: req.params.barId });
    if (!queue) {
      console.log(`Queue not found for bar ID: ${req.params.barId}`);
      return res.status(404).json({ msg: 'Queue not found' });
    }
    queue.isOpen = false;
    await queue.save();
    console.log(`Queue closed for bar ID: ${req.params.barId}`);
    res.json({ msg: 'Queue closed' });
  } catch (err) {
    console.error('Error closing queue:', err.message);
    res.status(500).send('Server error');
  }
});

router.post('/:barId/join', auth, async (req, res) => {
  try {
    console.log(`User attempting to join queue for bar ID: ${req.params.barId}`);
    console.log('User:', req.user);

    const queue = await Queue.findOne({ barId: req.params.barId });
    if (!queue || !queue.isOpen) {
      console.log(`Queue not open or not found for bar ID: ${req.params.barId}`);
      return res.status(400).json({ msg: 'Queue is not open' });
    }
    if (queue.users.find((user) => user.userId.toString() === req.user.id.toString())) {
      console.log(`User already in queue for bar ID: ${req.params.barId}`);
      return res.status(400).json({ msg: 'User already in queue' });
    }
    const user = await User.findById(req.user.id).select('username');
    queue.users.push({ userId: user._id, name: user.username });
    await queue.save();
    console.log(`User joined queue for bar ID: ${req.params.barId}`);
    res.json({ msg: 'Joined queue', queueLength: queue.users.length });
  } catch (err) {
    console.error('Error joining queue:', err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
