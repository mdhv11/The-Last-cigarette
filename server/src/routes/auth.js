const express = require('express');
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validation');

const router = express.Router();

router.post(
    '/signup',
    [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
        check('name', 'Name is required').not().isEmpty(),
        validate
    ],
    authController.signup
);

router.post(
    '/login',
    [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password is required').exists(),
        validate
    ],
    authController.login
);

router.post('/google', authController.googleLogin);

router.get('/me', auth, authController.getMe);

module.exports = router;
