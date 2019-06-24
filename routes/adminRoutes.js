const express = require('express');
const router = express.Router();
const adminControllers = require('../controllers/adminControllers');

router.post('/adminRegister', adminControllers.register);

router.post('/adminLogin', adminControllers.login, function(req, res) {
  res.redirect(`/dashboard`);
});

router.get('/info', adminControllers.getInfo);

router.get('/logout', adminControllers.logout);

module.exports = router;
