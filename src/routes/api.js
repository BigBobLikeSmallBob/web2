const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const jobRoutes = require('./jobRoutes');
const cvRoutes = require('./cvRoutes');
const jobController = require('../controllers/jobController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use('/auth', authRoutes);
router.use('/jobs', jobRoutes);
router.use('/applications', cvRoutes);

router.get('/company', jobController.getCompanyInfo);
router.put('/company', protect, authorize('admin'), jobController.updateCompanyInfo);

/**
 * Đã có module.exports = router; ở cuối file theo context hiện tại.
 * Hãy đảm bảo không có lỗi chính tả khi gọi require('./authRoutes').
 */
module.exports = router;