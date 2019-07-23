const express = require('express')
const router = express.Router()
const reportControllers = require('../controllers/reportControllers')
const Report = require('../models/reportModel')
var middleware = require('../middleware/auth')

router.post('/submit', reportControllers.upload.single('image'), reportControllers.postSubmitData, (error, req, res, next) => {
	res.status(500).send({ error: error })
})

router.get('/geojson/:reportType', reportControllers.getGeojson)

router.get('/reports', reportControllers.getReports)

router.get('/reports/:id', reportControllers.getReportsID)

router.get('/count', reportControllers.getCount)

router.get('/priorityCount', reportControllers.getPriorityCount)

router.get('/graph', reportControllers.getGraph)

router.put('/reports', middleware.isLoggedInAdmin, reportControllers.updateReports)

router.delete('/reports', middleware.isLoggedInAdmin, reportControllers.deleteReports)

module.exports = router
