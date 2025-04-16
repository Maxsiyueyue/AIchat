const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema({
  socketId: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  ip: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['connect', 'disconnect'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  deviceInfo: {
    browser: String,
    os: String,
    device: String
  }
});

module.exports = mongoose.model('Connection', connectionSchema);