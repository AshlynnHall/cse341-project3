const express = require('express');
const router = express.Router();
const workouts = require('../controllers/workouts');

router.get('/', workouts.getAllWorkouts);
router.get('/:id', workouts.getWorkoutById);
router.post('/', workouts.createWorkout);
router.put('/:id', workouts.updateWorkout);
router.delete('/:id', workouts.deleteWorkout);

module.exports = router;