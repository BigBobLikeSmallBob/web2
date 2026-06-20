const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const authController = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'logos', 
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
  },
});

const upload = multer({ 
  storage,
});

router.post('/login', authController.login);
router.get('/me', protect, authController.getMe);
router.post('/register', upload.single('logo'), authController.register);

module.exports = router;