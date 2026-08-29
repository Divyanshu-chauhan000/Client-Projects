const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');

// Multer Config
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    const filetypes = /jpg|jpeg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Images only!'));
    }
  },
});

router.route('/')
  .get(getProducts)
  .post(upload.array('images', 5), createProduct);

router.route('/:id')
  .get(getProductById)
  .put(upload.array('images', 5), updateProduct)
  .delete(deleteProduct);

module.exports = router;
