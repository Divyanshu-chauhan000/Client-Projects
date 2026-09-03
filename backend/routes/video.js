const express = require('express');
const router = express.Router();
const { getVideos, uploadVideo, deleteVideo } = require('../controllers/videoController');
const { protect } = require('../middleware/authMiddleware');
const videoUpload = require('../middleware/videoUploadMiddleware');

router.route('/')
  .get(getVideos)
  .post(protect, videoUpload.single('video'), uploadVideo);

router.route('/:id')
  .delete(protect, deleteVideo);

module.exports = router;
