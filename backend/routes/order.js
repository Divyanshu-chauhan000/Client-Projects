const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/authMiddleware');
const {
  addOrderItems,
  getOrders,
  verifyPayment,
} = require('../controllers/orderController');

router.route('/')
  .post(protect, addOrderItems)
  .get(protect, isAdmin, getOrders);

router.route('/:id/verify')
  .put(protect, isAdmin, verifyPayment);

module.exports = router;
