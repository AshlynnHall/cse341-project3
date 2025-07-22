const request = require('supertest');
const express = require('express');
const { ObjectId } = require('mongodb');
const { setupTestDb, cleanupTestDb, getTestDb } = require('./setup');
const exerciseController = require('../controllers/exercises');

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  req.app.locals.db = getTestDb();
  next();
});

app.get('/exercises', exerciseController.getAllExercises);
app.get('/exercises/:id', exerciseController.getExerciseById);
app.post('/exercises', exerciseController.createExercise);
app.put('/exercises/:id', exerciseController.updateExercise);
app.delete('/exercises/:id', exerciseController.deleteExercise);

describe('Exercise Controller Tests', () => {
  beforeAll(async () => {
    await setupTestDb();
  });

  afterAll(async () => {
    await cleanupTestDb();
  });

  beforeEach(async () => {
    const db = getTestDb();
    await db.collection('exercises').deleteMany({});
  });

  describe('POST /exercises', () => {
    test('should create a new exercise with valid data', async () => {
      const exerciseData = {
        name: 'Push-ups',
        muscleGroup: 'chest',
        equipment: 'none',
        difficulty: 'intermediate',
        description: 'Standard push-up exercise',
        userId: new ObjectId().toString(),
        date: '2025-01-15'
      };

      const response = await request(app)
        .post('/exercises')
        .send(exerciseData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.name).toBe(exerciseData.name);
      expect(response.body.muscleGroup).toBe(exerciseData.muscleGroup);
    });

    test('should return 400 if required fields are missing', async () => {
      const incompleteExercise = {
        name: 'Push-ups',
        muscleGroup: 'chest'
        // Missing one
      };

      const response = await request(app)
        .post('/exercises')
        .send(incompleteExercise)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('All fields are required.');
    });
  });

  describe('GET /exercises', () => {
    test('should return all exercises', async () => {
      const exerciseData = {
        name: 'Push-ups',
        muscleGroup: 'chest',
        equipment: 'none',
        difficulty: 'intermediate',
        description: 'Standard push-up exercise',
        userId: new ObjectId().toString(),
        date: '2025-01-15'
      };

      await request(app)
        .post('/exercises')
        .send(exerciseData);

      const response = await request(app)
        .get('/exercises')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /exercises/:id', () => {
    test('should return an exercise by valid ID', async () => {
      const exerciseData = {
        name: 'Push-ups',
        muscleGroup: 'chest',
        equipment: 'none',
        difficulty: 'intermediate',
        description: 'Standard push-up exercise',
        userId: new ObjectId().toString(),
        date: '2025-01-15'
      };

      const createResponse = await request(app)
        .post('/exercises')
        .send(exerciseData);

      const exerciseId = createResponse.body._id;

      const response = await request(app)
        .get(`/exercises/${exerciseId}`)
        .expect(200);

      expect(response.body._id).toBe(exerciseId);
      expect(response.body.name).toBe(exerciseData.name);
    });

    test('should return 404 for non-existent exercise', async () => {
      const fakeId = new ObjectId().toString();

      const response = await request(app)
        .get(`/exercises/${fakeId}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Exercise not found.');
    });
  });

  describe('PUT /exercises/:id', () => {
    test('should update an existing exercise', async () => {
      const exerciseData = {
        name: 'Push-ups',
        muscleGroup: 'chest',
        equipment: 'none',
        difficulty: 'intermediate',
        description: 'Standard push-up exercise',
        userId: new ObjectId().toString(),
        date: '2025-01-15'
      };

      const createResponse = await request(app)
        .post('/exercises')
        .send(exerciseData);

      const exerciseId = createResponse.body._id;

      const updatedData = {
        name: 'Modified Push-ups',
        muscleGroup: 'chest',
        equipment: 'none',
        difficulty: 'advanced',
        description: 'Advanced push-up variation',
        userId: exerciseData.userId,
        date: '2025-01-16'
      };

      await request(app)
        .put(`/exercises/${exerciseId}`)
        .send(updatedData)
        .expect(204);

      await new Promise(resolve => setTimeout(resolve, 100));

      const getResponse = await request(app)
        .get(`/exercises/${exerciseId}`)
        .expect(200);

      expect(getResponse.body.name).toBe(updatedData.name);
      expect(getResponse.body.difficulty).toBe(updatedData.difficulty);
    });
  });

  describe('DELETE /exercises/:id', () => {
    test('should delete an existing exercise', async () => {
      const exerciseData = {
        name: 'Push-ups',
        muscleGroup: 'chest',
        equipment: 'none',
        difficulty: 'intermediate',
        description: 'Standard push-up exercise',
        userId: new ObjectId().toString(),
        date: '2025-01-15'
      };

      const createResponse = await request(app)
        .post('/exercises')
        .send(exerciseData);

      const exerciseId = createResponse.body._id;

      await request(app)
        .delete(`/exercises/${exerciseId}`)
        .expect(204);

      await request(app)
        .get(`/exercises/${exerciseId}`)
        .expect(404);
    });
  });
});
