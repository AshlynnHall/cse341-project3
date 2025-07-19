const express = require('express');
const router = express.Router();
const users = require('../controllers/users');

router.get('/', users.getAllUsers);
router.get('/:id', users.getUserById);
router.post('/', users.createUser);
router.put('/:id', users.updateUser);
router.delete('/:id', users.deleteUser);

module.exports = router;