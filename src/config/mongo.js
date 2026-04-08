const { MongoClient } = require('mongodb');
const config = require('./index');

const client = new MongoClient(config.mongodbUri);

let db;

async function connectMongo() {
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
  await client.close();
}

module.exports = { connectMongo, getDb, closeMongo };
