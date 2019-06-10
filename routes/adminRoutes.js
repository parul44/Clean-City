const express = require('express');
const router = express.Router();
const adminControllers = require('../controllers/adminControllers');

router.post('/register', adminControllers.register);

router.post('/login', adminControllers.login, function(req, res) {});

router.get('/logout', adminControllers.logout);

module.exports = router;
