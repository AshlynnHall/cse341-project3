const { ObjectId } = require('mongodb');

exports.getAllGoals = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const goals = await db.collection('goals').find().toArray();
    res.json(goals);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch goals.' });
  }
};

exports.getGoalById = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const goal = await db.collection('goals').findOne({ _id: new ObjectId(req.params.id) });
    if (!goal) return res.status(404).json({ error: 'Goal not found.' });
    res.json(goal);
  } catch (err) {
    res.status(400).json({ error: 'Invalid ID.' });
  }
};

exports.createGoal = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { userId, target, type, startDate, endDate, status, notes } = req.body;
    if (!userId || !target || !type || !startDate || !endDate || !status || !notes) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    const goal = { userId, target, type, startDate, endDate, status, notes };
    const result = await db.collection('goals').insertOne(goal);
    goal._id = result.insertedId;
    res.status(201).json(goal);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create goal.' });
  }
};

exports.updateGoal = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { userId, target, type, startDate, endDate, status, notes } = req.body;
    const result = await db.collection('goals').replaceOne(
      { _id: new ObjectId(req.params.id) },
      { userId, target, type, startDate, endDate, status, notes }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Goal not found.' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: 'Invalid ID.' });
  }
};

exports.deleteGoal = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = await db.collection('goals').deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Goal not found.' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: 'Invalid ID.' });
  }
};