const { Router } = require('express');
const { getReviews, createReview } = require('../controllers/review.controller');

const router = Router();

router.get('/', getReviews);
router.post('/', createReview);

module.exports = router;
