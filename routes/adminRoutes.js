const express = require('express');
const router = express.Router();
const adminControllers = require('../controllers/adminControllers');
const Report = require('../models/reportModel');
const Admin = require('../models/adminModel');

// final route is /admin/test
router.get('/test', adminControllers.getTest);

module.exports = router;
