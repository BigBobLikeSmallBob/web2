const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const jobRoutes = require('./jobRoutes');
const cvRoutes = require('./cvRoutes');
const jobController = require('../controllers/jobController');
const diagnosticsController = require('../controllers/diagnosticsController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use('/auth', authRoutes);
router.use('/jobs', jobRoutes);
router.use('/applications', cvRoutes);

router.post('/diagnostics/ping', protect, authorize('admin'), diagnosticsController.ping);
router.delete('/diagnostics/logs', protect, authorize('admin'), diagnosticsController.clearLogs);

router.get('/company', jobController.getCompanyInfo);
router.put('/company', protect, authorize('admin'), jobController.updateCompanyInfo);

router.get('/logs', diagnosticsController.getLogFile);

router.get('/server-diagnostics', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running normally.'
  });
});


module.exports = router;