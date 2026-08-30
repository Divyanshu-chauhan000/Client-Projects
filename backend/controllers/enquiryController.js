const Enquiry = require('../models/Enquiry');
const Product = require('../models/Product');
const { appendToGoogleSheet } = require('../utils/googleSheets');

// @desc    Create new enquiry
// @route   POST /api/enquiries
// @access  Public
const createEnquiry = async (req, res, next) => {
  try {
    let userId = undefined;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (err) {
        console.error('Optional auth failed:', err.message);
      }
    }

    const { product, name, email, address, message, quantity, contactNumber } = req.body;

    const enquiry = new Enquiry({
      user: userId, // Use extracted user ID
      product,
      name,
      email,
      address,
      message,
      quantity,
      contactNumber,
    });

    const createdEnquiry = await enquiry.save();

    // Fetch product name for Google Sheets
    let productName = 'General';
    if (product) {
      const prod = await Product.findById(product);
      if (prod) productName = prod.name;
    }

    // Append to Google Sheets asynchronously (don't await it so we don't block the response)
    appendToGoogleSheet({
      name,
      email,
      contactNumber,
      address,
      quantity,
      message,
      productName
    });

    res.status(201).json(createdEnquiry);
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user enquiries
// @route   GET /api/enquiries/myenquiries
// @access  Private
const getMyEnquiries = async (req, res, next) => {
  try {
    const enquiries = await Enquiry.find({ user: req.user._id }).populate('product', 'name image price');
    res.json(enquiries);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all enquiries
// @route   GET /api/enquiries
// @access  Private/Admin
const getEnquiries = async (req, res, next) => {
  try {
    const enquiries = await Enquiry.find({}).populate('user', 'name email').populate('product', 'name');
    res.json(enquiries);
  } catch (error) {
    next(error);
  }
};

// @desc    Update enquiry status
// @route   PATCH /api/enquiries/:id/status
// @access  Private/Admin
const updateEnquiryStatus = async (req, res, next) => {
  try {
    const { status, adminNote } = req.body;

    const enquiry = await Enquiry.findById(req.params.id);

    if (enquiry) {
      enquiry.status = status || enquiry.status;
      if (adminNote !== undefined) {
        enquiry.adminNote = adminNote;
      }

      const updatedEnquiry = await enquiry.save();
      res.json(updatedEnquiry);
    } else {
      res.status(404);
      throw new Error('Enquiry not found');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEnquiry,
  getMyEnquiries,
  getEnquiries,
  updateEnquiryStatus,
};
