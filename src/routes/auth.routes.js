const { Router } = require('express');
const { signup, login } = require('../controllers/auth.controller');
const { authRateLimiter } = require('../middleware/rateLimiter');

const router = Router();

router.post('/signup', authRateLimiter, signup);
router.post('/login', authRateLimiter, login);

module.exports = router;
