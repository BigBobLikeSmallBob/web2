const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/', jobController.getJobList);

router.post('/', protect, authorize('recruiter', 'admin'), jobController.createJob);

module.exports = router;