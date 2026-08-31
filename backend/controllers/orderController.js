const Order = require('../models/Order');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res, next) => {
  try {
    let { orderItems, totalPrice } = req.body;
    
    // If orderItems comes as a string (from FormData), parse it
    if (typeof orderItems === 'string') {
      try {
        orderItems = JSON.parse(orderItems);
      } catch (err) {
        return res.status(400).json({ message: 'Invalid orderItems format' });
      }
    }

    if (!orderItems || orderItems.length === 0) {
      res.status(400);
      throw new Error('No order items');
    } else {
      const order = new Order({
        user: req.user._id, // Assuming protect middleware adds user to req
        orderItems,
        totalPrice,
        paymentStatus: 'Pending Verification',
        paymentScreenshot: req.file ? req.file.path : undefined,
      });

      const createdOrder = await order.save();
      res.status(201).json(createdOrder);
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({}).populate('user', 'id name email');
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Update order payment status to verified
// @route   PUT /api/orders/:id/verify
// @access  Private/Admin
const verifyPayment = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (order) {
      order.paymentStatus = 'Verified';
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404);
      throw new Error('Order not found');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addOrderItems,
  getOrders,
  verifyPayment,
};
