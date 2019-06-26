const express = require('express');
const router = express.Router();
const adminControllers = require('../controllers/adminControllers');

router.post('/register', adminControllers.register);

router.post('/login', adminControllers.login, function(req, res) {
  res.redirect(`/dashboard`);
});

router.get('/logout', adminControllers.logout);

router.get('/info', adminControllers.getInfo);

module.exports = router;
