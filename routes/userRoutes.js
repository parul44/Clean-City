const express = require('express');
const router = express.Router();
const userControllers = require('../controllers/userControllers');
const Report = require('../models/reportModel');
var middleware = require('../middleware/auth');

// final route is /user/test
router.post(
  '/submit',
  userControllers.upload.single('image'),
  userControllers.postSubmitData,
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

router.get('/geojson/:reportType', userControllers.getGeojson);

router.get('/reports', userControllers.getReports);

router.get('/reports/:id', userControllers.getReportsID);

router.get('/image/:id', userControllers.getImage);

router.get('/count', userControllers.getCount);

router.put('/reports', middleware.isLoggedIn, userControllers.updateReports);

router.delete('/reports', middleware.isLoggedIn, userControllers.deleteReports);

module.exports = router;
