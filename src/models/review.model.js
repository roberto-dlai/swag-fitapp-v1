const { getDb } = require('../config/mongo');
const { sanitizePrimitive } = require('../utils/validators');

function getCollection() {
  return getDb().collection('reviews');
}

async function findAll({ page = 1, limit = 20 } = {}) {
  const skip = (page - 1) * limit;
  const reviews = await getCollection()
    .find({})
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();
  return reviews;
}

async function create({ userId, userName, rating, title, body, tags, tips }) {
  const doc = {
    userId: Number(sanitizePrimitive(userId)),
    userName: sanitizePrimitive(userName),
    rating: Number(sanitizePrimitive(rating)),
    title: sanitizePrimitive(title),
    body: sanitizePrimitive(body),
    tags: Array.isArray(tags) ? tags.map(t => sanitizePrimitive(t)) : [],
    tips: Array.isArray(tips) ? tips.map(t => sanitizePrimitive(t)) : [],
    createdAt: new Date(),
  };

  const result = await getCollection().insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

module.exports = { findAll, create };
