const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const authController = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

// Sử dụng bộ nhớ tạm để lưu file buffer trước khi đẩy vào MongoDB
const storage = multer.memoryStorage();

const upload = multer({ 
  storage,
});

router.post('/login', authController.login);
router.get('/me', protect, authController.getMe);
router.post('/register', upload.single('logo'), authController.register);

module.exports = router;