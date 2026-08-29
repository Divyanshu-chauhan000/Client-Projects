const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: 'User',
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Product',
  },
  message: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
  contactNumber: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Responded', 'Closed'],
    default: 'Pending',
  },
  adminNote: {
    type: String,
  },
}, {
  timestamps: true,
});

const Enquiry = mongoose.model('Enquiry', enquirySchema);
module.exports = Enquiry;
