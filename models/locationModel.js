const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  address: {
    type: String,
    required: [true, 'Location must have a address.']
  },
  description: {
    type: String,
    required: [true, 'Location must have a description.']
  },
  coordinates: [Number],
  createdAt: {
    type: Date,
    default: Date.now()
  },
  day: {
    type: Number,
    required: [true, 'Location must have a day.']
  }
});

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;
