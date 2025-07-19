const { ObjectId } = require('mongodb');

exports.getAllExercises = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const exercises = await db.collection('exercises').find().toArray();
    res.json(exercises);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch exercises.' });
  }
};

exports.getExerciseById = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const exercise = await db.collection('exercises').findOne({ _id: new ObjectId(req.params.id) });
    if (!exercise) return res.status(404).json({ error: 'Exercise not found.' });
    res.json(exercise);
  } catch (err) {
    res.status(400).json({ error: 'Invalid ID.' });
  }
};

exports.createExercise = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { name, muscleGroup, equipment, difficulty, description, userId, date } = req.body;
    if (!name || !muscleGroup || !equipment || !difficulty || !description || !userId || !date) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    const exercise = { name, muscleGroup, equipment, difficulty, description, userId, date };
    const result = await db.collection('exercises').insertOne(exercise);
    exercise._id = result.insertedId;
    res.status(201).json(exercise);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create exercise.' });
  }
};

exports.updateExercise = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { name, muscleGroup, equipment, difficulty, description, userId, date } = req.body;
    const result = await db.collection('exercises').replaceOne(
      { _id: new ObjectId(req.params.id) },
      { name, muscleGroup, equipment, difficulty, description, userId, date }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Exercise not found.' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: 'Invalid ID.' });
  }
};

exports.deleteExercise = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const result = await db.collection('exercises').deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Exercise not found.' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: 'Invalid ID.' });
  }
};