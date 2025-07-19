const express = require('express');
const router = express.Router();
const exercises = require('../controllers/exercises');

router.get('/', exercises.getAllExercises);
router.get('/:id', exercises.getExerciseById);
router.post('/', exercises.createExercise);
router.put('/:id', exercises.updateExercise);
router.delete('/:id', exercises.deleteExercise);

module.exports = router;