const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const path = require('path');
const cvController = require('../controllers/cvController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'cvs', 
    allowed_formats: ['pdf', 'doc', 'docx'],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB

});

// Endpoint cho Ứng viên
router.post('/', upload.single('cv'), cvController.submitApplication);

// Endpoints cho Nhà tuyển dụng
router.get('/', protect, authorize('recruiter', 'admin'), cvController.getApplications);
router.patch('/:id/status', protect, authorize('recruiter', 'admin'), cvController.updateStatus);

module.exports = router;