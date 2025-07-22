const request = require('supertest');
const express = require('express');
const { ObjectId } = require('mongodb');
const { setupTestDb, cleanupTestDb, getTestDb } = require('./setup');
const userController = require('../controllers/users');

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  req.app.locals.db = getTestDb();
  next();
});

app.get('/users', userController.getAllUsers);
app.get('/users/:id', userController.getUserById);
app.post('/users', userController.createUser);
app.put('/users/:id', userController.updateUser);
app.delete('/users/:id', userController.deleteUser);

describe('User Controller Tests', () => {
  let testUserId;

  beforeAll(async () => {
    await setupTestDb();
  });

  afterAll(async () => {
    await cleanupTestDb();
  });

  beforeEach(async () => {
    const db = getTestDb();
    await db.collection('users').deleteMany({});
  });

  describe('POST /users', () => {
    test('should create a new user with valid data', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        age: 25,
        gender: 'male',
        height: 175.5,
        weight: 70.2,
        joinedDate: '2025-01-15'
      };

      const response = await request(app)
        .post('/users')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.name).toBe(userData.name);
      expect(response.body.email).toBe(userData.email);
      testUserId = response.body._id;
    });

    test('should return 400 if required fields are missing', async () => {
      const incompleteUser = {
        name: 'Test User',
        email: 'test@example.com'
        // Missing one
      };

      const response = await request(app)
        .post('/users')
        .send(incompleteUser)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('All fields are required.');
    });
  });

  describe('GET /users', () => {
    test('should return all users', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        age: 25,
        gender: 'male',
        height: 175.5,
        weight: 70.2,
        joinedDate: '2025-01-15'
      };

      await request(app)
        .post('/users')
        .send(userData);

      const response = await request(app)
        .get('/users')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /users/:id', () => {
    test('should return a user by valid ID', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        age: 25,
        gender: 'male',
        height: 175.5,
        weight: 70.2,
        joinedDate: '2025-01-15'
      };

      const createResponse = await request(app)
        .post('/users')
        .send(userData);

      const userId = createResponse.body._id;

      const response = await request(app)
        .get(`/users/${userId}`)
        .expect(200);

      expect(response.body._id).toBe(userId);
      expect(response.body.name).toBe(userData.name);
    });

    test('should return 404 for non-existent user', async () => {
      const fakeId = new ObjectId().toString();

      const response = await request(app)
        .get(`/users/${fakeId}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('User not found.');
    });

    test('should return 400 for invalid ID format', async () => {
      const response = await request(app)
        .get('/users/invalid-id')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Invalid ID.');
    });
  });

  describe('PUT /users/:id', () => {
    test('should update an existing user', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        age: 25,
        gender: 'male',
        height: 175.5,
        weight: 70.2,
        joinedDate: '2025-01-15'
      };

      const createResponse = await request(app)
        .post('/users')
        .send(userData);

      const userId = createResponse.body._id;

      const updatedData = {
        name: 'Updated User',
        email: 'updated@example.com',
        age: 30,
        gender: 'female',
        height: 165.0,
        weight: 60.0,
        joinedDate: '2025-01-16'
      };

      await request(app)
        .put(`/users/${userId}`)
        .send(updatedData)
        .expect(204);

      const getResponse = await request(app)
        .get(`/users/${userId}`)
        .expect(200);

      expect(getResponse.body.name).toBe(updatedData.name);
      expect(getResponse.body.email).toBe(updatedData.email);
    });

    test('should return 404 when updating non-existent user', async () => {
      const fakeId = new ObjectId().toString();
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        age: 25,
        gender: 'male',
        height: 175.5,
        weight: 70.2,
        joinedDate: '2025-01-15'
      };

      const response = await request(app)
        .put(`/users/${fakeId}`)
        .send(userData)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('User not found.');
    });
  });

  describe('DELETE /users/:id', () => {
    test('should delete an existing user', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        age: 25,
        gender: 'male',
        height: 175.5,
        weight: 70.2,
        joinedDate: '2025-01-15'
      };

      const createResponse = await request(app)
        .post('/users')
        .send(userData);

      const userId = createResponse.body._id;

      await request(app)
        .delete(`/users/${userId}`)
        .expect(204);

      await request(app)
        .get(`/users/${userId}`)
        .expect(404);
    });

    test('should return 404 when deleting non-existent user', async () => {
      const fakeId = new ObjectId().toString();

      const response = await request(app)
        .delete(`/users/${fakeId}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('User not found.');
    });
  });
});
