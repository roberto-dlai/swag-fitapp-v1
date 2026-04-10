const reviewModel = require('../models/review.model');
const { isValidRating } = require('../utils/validators');

async function getReviews(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));

    const reviews = await reviewModel.findAll({ page, limit });
    res.json({ reviews, page, limit });
  } catch (err) {
    next(err);
  }
}

async function createReview(req, res, next) {
  try {
    const { rating, title, body, tags, tips } = req.body;

    const errors = [];

    if (rating === undefined || !isValidRating(rating)) {
      errors.push('rating must be an integer between 1 and 5');
    }
    if (!body || typeof body !== 'string' || body.trim().length === 0) {
      errors.push('body is required');
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const review = await reviewModel.create({
      userId: req.userId,
      userName: req.userPrefs.name,
      rating,
      title: title || '',
      body: body.trim(),
      tags: tags || [],
      tips: tips || [],
    });

    res.status(201).json({ review });
  } catch (err) {
    next(err);
  }
}

module.exports = { getReviews, createReview };
