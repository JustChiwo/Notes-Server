// Connect authentication URLs to their controller functions.
const express = require('express');
const { signup, login, logout } = require('../controllers/authController');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
// Auth middleware will be added to /logout later.
router.post('/logout', logout);

module.exports = router;
