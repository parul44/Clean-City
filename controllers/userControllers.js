// name the controllers in this format '<method of request><Name of the route>'

const Report = require('../models/reportModel');
const multer = require('multer');
const sharp = require('sharp');

//controllers
//Multer file upload controller
const upload = multer({
  limits: {
    fileSize: 5000000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Please upload an image'));
    }

    cb(undefined, true);
  }
});

//Image resizing - Saving in DB controller
const postSubmitData = async (req, res) => {
  try {
    const buffer = await sharp(req.file.buffer)
      .resize(1920, 1920, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .toFormat('jpeg')
      .toBuffer();
    req.body.imageBuffer = buffer;
    req.body.properties = {
      brief: req.body.description.slice(0, 100)
    };
    req.body.geometry = {
      coordinates: [req.body.longitude, req.body.latitude]
    };
    const report = new Report(req.body);
    await report.save();
    res.status(201).send(`Report added to DB! with id ${report._id}`);
  } catch (e) {
    res.status(400).send(e);
  }
};

const getGeojson = async (req, res) => {
  try {
    features = await Report.find(
      { reportType: req.params.reportType },
      'geometry properties -_id'
    );
    featurecollection = {
      type: 'FeatureCollection',
      features: features
    };
    res.status(200).json(featurecollection);
  } catch (e) {
    res.status(400).send(e);
  }
};

const getReports = async (req, res) => {
  try {
    res.status(200).send('Getting all reports!');
  } catch (e) {
    res.status(400).send(e);
  }
};

const getReportsID = async (req, res) => {
  try {
    res.status(200).send(`Getting report with id ${req.params.id}`);
  } catch (e) {
    res.status(400).send(e);
  }
};

module.exports = {
  upload,
  postSubmitData,
  getGeojson,
  getReports,
  getReportsID
};
