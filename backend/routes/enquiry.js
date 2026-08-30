const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/authMiddleware');
const {
  createEnquiry,
  getMyEnquiries,
  getEnquiries,
  updateEnquiryStatus,
} = require('../controllers/enquiryController');

router.route('/')
  .post(createEnquiry)
  .get(getEnquiries);

router.route('/myenquiries').get(protect, getMyEnquiries);

router.route('/:id/status').patch(protect, isAdmin, updateEnquiryStatus);

module.exports = router;
