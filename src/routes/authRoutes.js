const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const authController = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

// Tái sử dụng cấu hình lưu trữ
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads/'),
  filename: (req, file, cb) => cb(null, `logo-${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) return cb(null, true);
    cb(new Error('Chỉ chấp nhận file ảnh .jpg hoặc .png'));
  }
});

router.post('/login', authController.login);
router.get('/me', protect, authController.getMe);
router.post('/register', upload.single('logo'), authController.register);

module.exports = router;