const { MongoClient } = require('mongodb');
const config = require('./index');

let client = null;
let db = null;

async function connectMongo() {
  if (db) return db;
  client = new MongoClient(config.mongodbUri);
  await client.connect();
  db = client.db();
  console.log('Connected to MongoDB');
  return db;
}

function getDb() {
  if (!db) {
    throw new Error('MongoDB not connected. Call connectMongo() first.');
  }
  return db;
}

async function closeMongo() {
  if (client) {
    await client.close();
  }
  client = null;
  db = null;
}

module.exports = { connectMongo, getDb, closeMongo };
