const express = require('express');
const router = express.Router();
const userControllers = require('../controllers/userControllers');
var middleware = require('../middleware/auth');

router.post('/register', userControllers.register);

router.post('/login', userControllers.login, function(req, res) {
  res.redirect(`/userDashboard`);
});

router.get('/logout', userControllers.logout);

router.get('/info', userControllers.getInfo);

router.put('/redeem', middleware.isLoggedInUser, userControllers.redeem);

module.exports = router;
