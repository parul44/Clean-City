const express = require('express');
const router = express.Router();
const adminControllers = require('../controllers/adminControllers');

router.post('/register', adminControllers.register);

router.post('/login', adminControllers.login, function(req, res) {
  res.redirect(`/dashboard?owner=${req.user.owner}`);
});

router.get('/logout', adminControllers.logout);

module.exports = router;
