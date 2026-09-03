const Video = require('../models/Video');
const cloudinary = require('cloudinary').v2;

// @desc    Get all videos
// @route   GET /api/videos
// @access  Public
const getVideos = async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    res.json(videos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Upload a video
// @route   POST /api/videos
// @access  Private/Admin
const uploadVideo = async (req, res) => {
  try {
    const { title } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'No video file uploaded' });
    }

    const video = new Video({
      title: title || 'Untitled Video',
      videoUrl: req.file.path,
      public_id: req.file.filename // Cloudinary public_id is stored in filename by multer-storage-cloudinary
    });

    const createdVideo = await video.save();
    res.status(201).json(createdVideo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a video
// @route   DELETE /api/videos/:id
// @access  Private/Admin
const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(video.public_id, { resource_type: 'video' });

    await video.deleteOne();
    res.json({ message: 'Video removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getVideos,
  uploadVideo,
  deleteVideo
};
