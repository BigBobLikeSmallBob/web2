const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/', jobController.getJobList);

// Chỉ Recruiter hoặc Admin mới được đăng tin
router.post('/', protect, authorize('recruiter', 'admin'), jobController.createJob);

module.exports = router;