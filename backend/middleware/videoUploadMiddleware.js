const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Re-using the config from your env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'client_projects_videos',
    resource_type: 'video', // Important for video uploads
    allowed_formats: ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'],
  },
});

const videoUpload = multer({ storage });

module.exports = videoUpload;
