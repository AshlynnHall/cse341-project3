const request = require('supertest');
const express = require('express');
const { ObjectId } = require('mongodb');
const { setupTestDb, cleanupTestDb, getTestDb } = require('./setup');
const workoutController = require('../controllers/workouts');

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  req.app.locals.db = getTestDb();
  next();
});

app.get('/workouts', workoutController.getAllWorkouts);
app.get('/workouts/:id', workoutController.getWorkoutById);
app.post('/workouts', workoutController.createWorkout);
app.put('/workouts/:id', workoutController.updateWorkout);
app.delete('/workouts/:id', workoutController.deleteWorkout);

describe('Workout Controller Tests', () => {
  beforeAll(async () => {
    await setupTestDb();
  });

  afterAll(async () => {
    await cleanupTestDb();
  });

  beforeEach(async () => {
    const db = getTestDb();
    await db.collection('workouts').deleteMany({});
  });

  describe('POST /workouts', () => {
    test('should create a new workout with valid data', async () => {
      const workoutData = {
        userId: new ObjectId().toString(),
        date: '2025-01-15',
        type: 'strength',
        duration: 60,
        exercises: ['Push-ups', 'Pull-ups'],
        notes: 'Great workout',
        caloriesBurned: 350
      };

      const response = await request(app)
        .post('/workouts')
        .send(workoutData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.type).toBe(workoutData.type);
      expect(response.body.duration).toBe(workoutData.duration);
    });

    test('should return 400 if required fields are missing', async () => {
      const incompleteWorkout = {
        userId: new ObjectId().toString(),
        date: '2025-01-15'
        // Missing 1
      };

      const response = await request(app)
        .post('/workouts')
        .send(incompleteWorkout)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('All fields are required.');
    });
  });

  describe('GET /workouts', () => {
    test('should return all workouts', async () => {
      const workoutData = {
        userId: new ObjectId().toString(),
        date: '2025-01-15',
        type: 'strength',
        duration: 60,
        exercises: ['Push-ups', 'Pull-ups'],
        notes: 'Great workout',
        caloriesBurned: 350
      };

      await request(app)
        .post('/workouts')
        .send(workoutData);

      const response = await request(app)
        .get('/workouts')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /workouts/:id', () => {
    test('should return a workout by valid ID', async () => {
      const workoutData = {
        userId: new ObjectId().toString(),
        date: '2025-01-15',
        type: 'strength',
        duration: 60,
        exercises: ['Push-ups', 'Pull-ups'],
        notes: 'Great workout',
        caloriesBurned: 350
      };

      const createResponse = await request(app)
        .post('/workouts')
        .send(workoutData);

      const workoutId = createResponse.body._id;

      const response = await request(app)
        .get(`/workouts/${workoutId}`)
        .expect(200);

      expect(response.body._id).toBe(workoutId);
      expect(response.body.type).toBe(workoutData.type);
    });

    test('should return 404 for non-existent workout', async () => {
      const fakeId = new ObjectId().toString();

      const response = await request(app)
        .get(`/workouts/${fakeId}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Workout not found.');
    });
  });
});
