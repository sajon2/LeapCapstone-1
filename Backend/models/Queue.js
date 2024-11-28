const mongoose = require('mongoose');

const QueueSchema = new mongoose.Schema({
  barId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bar',
    required: true,
  },
  isOpen: {
    type: Boolean,
    default: false,
  },
  users: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
    },
  ],
});

module.exports = mongoose.model('Queue', QueueSchema);
