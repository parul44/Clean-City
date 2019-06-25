const express = require('express');
const router = express.Router();
const userControllers = require('../controllers/userControllers');

router.post('/register', userControllers.register);

router.post('/login', userControllers.login, function(req, res) {
  res.redirect(`/userDashboard`);
});

router.get('/logout', userControllers.logout);

router.get('/info', userControllers.getInfo);

module.exports = router;
