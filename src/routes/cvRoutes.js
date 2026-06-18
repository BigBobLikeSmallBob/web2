const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cvController = require('../controllers/cvController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'cv_uploads',
    resource_type: 'auto', // Tự động nhận diện định dạng (pdf, docx...)
    allowed_formats: ['pdf', 'doc', 'docx']
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.pdf' && ext !== '.doc' && ext !== '.docx') {
      return cb(new Error('Chỉ chấp nhận file PDF, DOC hoặc DOCX'));
    }
    cb(null, true);
  }
});

// Endpoint cho Ứng viên
router.post('/', upload.single('cv'), cvController.submitApplication);

// Endpoints cho Nhà tuyển dụng
router.get('/', protect, authorize('recruiter', 'admin'), cvController.getApplications);
router.patch('/:id/status', protect, authorize('recruiter', 'admin'), cvController.updateStatus);

module.exports = router;