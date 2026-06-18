const cloudinary = require('cloudinary').v2;

// Cấu hình Cloudinary bằng các biến môi trường đã có trong file .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Luôn dùng https
});

module.exports = cloudinary;