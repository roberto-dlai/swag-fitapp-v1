const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { JWT_EXPIRY } = require('../utils/constants');

const SALT_ROUNDS = 10;

async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function createToken(userId) {
  return jwt.sign({ userId }, config.jwtSecret, { expiresIn: JWT_EXPIRY });
}

function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret);
}

module.exports = {
  hashPassword,
  comparePassword,
  createToken,
  verifyToken,
};
