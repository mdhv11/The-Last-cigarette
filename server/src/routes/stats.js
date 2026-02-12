const express = require('express');
const statsController = require('../controllers/statsController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/dashboard', auth, statsController.getDashboardStats);
router.get('/progress', auth, statsController.getProgressStats);
router.get('/savings', auth, statsController.getSavingsStats);
router.get('/achievements', auth, statsController.getAchievements);

module.exports = router;
