const express = require('express');
const { check } = require('express-validator');
const planController = require('../controllers/planController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validation');

const router = express.Router();

router.post(
    '/setup',
    [
        auth,
        check('initialDailyAverage', 'Initial daily average is required').isNumeric(),
        check('targetQuitDate', 'Target quit date is required').isISO8601(),
        validate
    ],
    planController.setupPlan
);

router.put('/update', auth, planController.updatePlan);
router.get('/current', auth, planController.getCurrentPlan);
router.get('/targets', auth, planController.getTargets);

module.exports = router;
