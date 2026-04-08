const { Router } = require('express');
const { getProfile, updatePreferences } = require('../controllers/user.controller');

const router = Router();

router.get('/me', getProfile);
router.patch('/me', updatePreferences);

module.exports = router;
