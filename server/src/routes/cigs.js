const express = require('express');
const cigController = require('../controllers/cigController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/log', auth, cigController.logCigarette);
router.get('/today', auth, cigController.getTodayCount);
router.get('/history', auth, cigController.getHistory);

module.exports = router;
