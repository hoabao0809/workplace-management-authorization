const express = require('express');

const authController = require('../controllers/auth');

const router = express.Router();

// Login
router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);

// Logout
router.get('/logout', authController.postLogout);

module.exports = router;
