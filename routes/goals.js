const express = require('express');
const router = express.Router();
const goals = require('../controllers/goals');

router.get('/', goals.getAllGoals);
router.get('/:id', goals.getGoalById);
router.post('/', goals.createGoal);
router.put('/:id', goals.updateGoal);
router.delete('/:id', goals.deleteGoal);

module.exports = router;