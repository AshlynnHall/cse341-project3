const request = require('supertest');
const express = require('express');
const { ObjectId } = require('mongodb');
const { setupTestDb, cleanupTestDb, getTestDb } = require('./setup');
const goalController = require('../controllers/goals');

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  req.app.locals.db = getTestDb();
  next();
});

app.get('/goals', goalController.getAllGoals);
app.get('/goals/:id', goalController.getGoalById);
app.post('/goals', goalController.createGoal);
app.put('/goals/:id', goalController.updateGoal);
app.delete('/goals/:id', goalController.deleteGoal);

describe('Goal Controller Tests', () => {
  beforeAll(async () => {
    await setupTestDb();
  });

  afterAll(async () => {
    await cleanupTestDb();
  });

  beforeEach(async () => {
    const db = getTestDb();
    await db.collection('goals').deleteMany({});
  });

  describe('POST /goals', () => {
    test('should create a new goal with valid data', async () => {
      const goalData = {
        userId: new ObjectId().toString(),
        target: 'Lose 10 pounds',
        type: 'weight_loss',
        startDate: '2025-01-15',
        endDate: '2025-04-15',
        status: 'active',
        notes: 'Focus on cardio and diet'
      };

      const response = await request(app)
        .post('/goals')
        .send(goalData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.target).toBe(goalData.target);
      expect(response.body.type).toBe(goalData.type);
      expect(response.body.status).toBe(goalData.status);
    });

    test('should return 400 if required fields are missing', async () => {
      const incompleteGoal = {
        userId: new ObjectId().toString(),
        target: 'Lose 10 pounds'
        // Missing 1
      };

      const response = await request(app)
        .post('/goals')
        .send(incompleteGoal)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('All fields are required.');
    });
  });

  describe('GET /goals', () => {
    test('should return all goals', async () => {
      const goalData = {
        userId: new ObjectId().toString(),
        target: 'Lose 10 pounds',
        type: 'weight_loss',
        startDate: '2025-01-15',
        endDate: '2025-04-15',
        status: 'active',
        notes: 'Focus on cardio and diet'
      };

      await request(app)
        .post('/goals')
        .send(goalData);

      const response = await request(app)
        .get('/goals')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /goals/:id', () => {
    test('should return a goal by valid ID', async () => {
      const goalData = {
        userId: new ObjectId().toString(),
        target: 'Lose 10 pounds',
        type: 'weight_loss',
        startDate: '2025-01-15',
        endDate: '2025-04-15',
        status: 'active',
        notes: 'Focus on cardio and diet'
      };

      const createResponse = await request(app)
        .post('/goals')
        .send(goalData);

      const goalId = createResponse.body._id;

      const response = await request(app)
        .get(`/goals/${goalId}`)
        .expect(200);

      expect(response.body._id).toBe(goalId);
      expect(response.body.target).toBe(goalData.target);
    });

    test('should return 404 for non-existent goal', async () => {
      const fakeId = new ObjectId().toString();

      const response = await request(app)
        .get(`/goals/${fakeId}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Goal not found.');
    });
  });

  describe('PUT /goals/:id', () => {
    test('should update an existing goal', async () => {
      const goalData = {
        userId: new ObjectId().toString(),
        target: 'Lose 10 pounds',
        type: 'weight_loss',
        startDate: '2025-01-15',
        endDate: '2025-04-15',
        status: 'active',
        notes: 'Focus on cardio and diet'
      };

      const createResponse = await request(app)
        .post('/goals')
        .send(goalData);

      const goalId = createResponse.body._id;

      const updatedData = {
        userId: goalData.userId,
        target: 'Lose 15 pounds',
        type: 'weight_loss',
        startDate: '2025-01-15',
        endDate: '2025-05-15',
        status: 'active',
        notes: 'Updated goal with more ambitious target'
      };

      await request(app)
        .put(`/goals/${goalId}`)
        .send(updatedData)
        .expect(204);

      await new Promise(resolve => setTimeout(resolve, 100));

      const getResponse = await request(app)
        .get(`/goals/${goalId}`)
        .expect(200);

      expect(getResponse.body.target).toBe(updatedData.target);
      expect(getResponse.body.notes).toBe(updatedData.notes);
    });
  });

  describe('DELETE /goals/:id', () => {
    test('should delete an existing goal', async () => {
      const goalData = {
        userId: new ObjectId().toString(),
        target: 'Lose 10 pounds',
        type: 'weight_loss',
        startDate: '2025-01-15',
        endDate: '2025-04-15',
        status: 'active',
        notes: 'Focus on cardio and diet'
      };

      const createResponse = await request(app)
        .post('/goals')
        .send(goalData);

      const goalId = createResponse.body._id;

      await request(app)
        .delete(`/goals/${goalId}`)
        .expect(204);

      await request(app)
        .get(`/goals/${goalId}`)
        .expect(404);
    });
  });
});
