// name the controllers in this format '<method of request><Name of the route>'

const Report = require('../models/reportModel');
const multer = require('multer');
const sharp = require('sharp');
const fetch = require('node-fetch');

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

    const response = await fetch(
      `http://apis.mapmyindia.com/advancedmaps/v1/${
        process.env.API_KEY
      }/rev_geocode?lat=${req.body.latitude}&lng=${req.body.longitude}`
    );

    const data = await response.json();
    req.body.results = data.results[0];

    const report = new Report(req.body);
    await report.save();
    res.status(201).send(`Report added to DB! with id ${report._id}`);
  } catch (e) {
    res.status(400).send({ error: e.errmsg });
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

// GET /reports?reportType=xyz
// GET /reports?pincode=123
// GET /reports?description=broken lamp
// GET /reports?location=punjabi bagh
// GET /reports?limit=10&skip=20
// GET /reports?sortBy=createdAt:desc
const getReports = async (req, res) => {
  const match = {};
  const options = { sort: {} };

  if (req.query.reportType) {
    if (req.query.reportType.length) match.reportType = req.query.reportType;
  }

  if (req.query.pincode) {
    if (req.query.pincode.length) {
      match['results.pincode'] = req.query.pincode;
    }
  }

  if (req.query.description) {
    if (req.query.description.length) {
      var regexString = req.query.description.replace(
        /[-\/\\^$*+?.()|[\]{}]/g,
        '\\$&'
      );
      var regex = new RegExp(regexString, 'i');
      match.description = regex;
    }
  }

  if (req.query.location) {
    if (req.query.location.length) {
      var regexString = req.query.location.replace(
        /[-\/\\^$*+?.()|[\]{}]/g,
        '\\$&'
      );
      var regex = new RegExp(regexString, 'i');
      match['results.formatted_address'] = regex;
    }
  }

  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(':');
    options.sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
  }

  if (req.query.limit) {
    options.limit = parseInt(req.query.limit);
  }

  if (req.query.skip) {
    options.skip = parseInt(req.query.skip);
  }

  try {
    var reports = await Report.find(match, '-imageBuffer', options);
    res.status(200).send(reports);
  } catch (e) {
    res.status(400).send(e);
  }
};
const getCount = async (req, res) => {
  try {
    let count = await Report.countDocuments({}, function(err, c) {
      if (err) {
        console.log(err);
      }
    });
    let report = await Report.findOne(
      {},
      { reportType: +1 },
      { sort: { created_at: -1 } },
      function(err, post) {
        if (err) {
          console.log(post);
        }
      }
    );
    res.status(200).send({ count: count, report: report });
  } catch (e) {
    res.status(404).send(e);
  }
};

const getReportsID = async (req, res) => {
  const _id = req.params.id;
  try {
    const report = await Report.findOne({ _id }, '-imageBuffer');
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.send(report);
  } catch (e) {
    res.status(404).send();
  }
};

const getImage = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report || !report.imageBuffer) {
      throw new Error();
    }

    res.set('Content-Type', 'image/jpg');
    res.send(report.imageBuffer);
  } catch (e) {
    res.status(404).send(e);
  }
};

const deleteReport = (req, res) => {
  try {
    var idarray = req.body.idarray;
    Report.deleteMany({ _id: { $in: idarray } }, function(err) {
      if (err) {
        console.log(err);
      }
    });
    res.status(200).send(`Reports deleted`);
  } catch (e) {
    res.status(404).send(e);
  }
};

module.exports = {
  upload,
  postSubmitData,
  getGeojson,
  getReports,
  getReportsID,
  getImage,
  getCount,
  deleteReport
};
