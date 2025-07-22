const { MongoClient } = require('mongodb');
require('dotenv').config();

let db;
let client;

const setupTestDb = async () => {
  try {
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    db = client.db('fitness_test'); 
    return db;
  } catch (error) {
    console.error('Failed to connect to test database:', error);
    throw error;
  }
};

const cleanupTestDb = async () => {
  try {
    if (db) {
      await db.collection('users').deleteMany({});
      await db.collection('workouts').deleteMany({});
      await db.collection('exercises').deleteMany({});
      await db.collection('goals').deleteMany({});
    }
    if (client) {
      await client.close();
    }
  } catch (error) {
    console.error('Error cleaning up test database:', error);
  }
};

module.exports = {
  setupTestDb,
  cleanupTestDb,
  getTestDb: () => db
};
