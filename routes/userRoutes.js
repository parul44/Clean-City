const express = require('express');
const router = express.Router();
const userControllers = require('../controllers/userControllers');

router.post('/userRegister', userControllers.register);

router.post('/userLogin', userControllers.login, function(req, res) {
  res.redirect(`/userDashboard`);
});

router.get('/userLogout', userControllers.logout);

module.exports = router;
