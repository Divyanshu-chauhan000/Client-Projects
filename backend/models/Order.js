const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  orderItems: [
    {
      name: { type: String, required: true },
      qty: { type: Number, required: true },
      image: { type: String, required: true },
      price: { type: Number, required: true },
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
    }
  ],
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0,
  },
  paymentStatus: {
    type: String,
    required: true,
    default: 'Pending Verification',
  },
  paymentReference: {
    type: String,
    required: false, // In case user enters transaction ID later
  },
  paymentScreenshot: {
    type: String,
    required: false,
  }
}, {
  timestamps: true,
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
