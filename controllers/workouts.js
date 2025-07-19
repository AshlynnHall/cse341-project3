const { ObjectId } = require('mongodb');

exports.getAllWorkouts = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const workouts = await db.collection('workouts').find().toArray();
    res.json(workouts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch workouts.' });
  }
};

exports.getWorkoutById = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const workout = await db.collection('workouts').findOne({ _id: new ObjectId(req.params.id) });
    if (!workout) return res.status(404).json({ error: 'Workout not found.' });
    res.json(workout);
  } catch (err) {
    res.status(400).json({ error: 'Invalid ID.' });
  }
};

exports.createWorkout = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { userId, date, type, duration, exercises, notes, caloriesBurned } = req.body;
    if (!userId || !date || !type || !duration || !exercises || !notes || !caloriesBurned) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    const workout = { userId, date, type, duration, exercises, notes, caloriesBurned };
    const result = await db.collection('workouts').insertOne(workout);
    workout._id = result.insertedId;
    res.status(201).json(workout);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create workout.' });
  }
};

exports.updateWorkout = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { userId, date, type, duration, exercises, notes, caloriesBurned } = req.body;
    const result = await db.collection('workouts').replaceOne(
      { _id: new ObjectId(req.params.id) },
      { userId, date, type, duration, exercises, notes, caloriesBurned }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Workout not found.' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: 'Invalid ID.' });
  }
};

exports.deleteWorkout = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = await db.collection('workouts').deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Workout not found.' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: 'Invalid ID.' });
  }
};