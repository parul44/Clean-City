const express = require('express');
const router = express.Router();
const userControllers = require('../controllers/userControllers');

// final route is /user/test
router.post('/submit', userControllers.postSubmit);

router.get('/reports', userControllers.getReports);

router.get('/reports/:id', userControllers.getReportsID);

module.exports = router;
