const express = require('express');
const router = express.Router();
const userControllers = require('../controllers/userControllers');
const Report = require('../models/reportModel');

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

router.get('/getcount',userControllers.getcount);

module.exports = router;
