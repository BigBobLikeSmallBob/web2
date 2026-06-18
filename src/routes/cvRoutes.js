const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const cvController = require('../controllers/cvController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Sử dụng bộ nhớ tạm để lưu file buffer
const storage = multer.memoryStorage();

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