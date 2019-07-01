// name the controllers in this format '<method of request><Name of the route>'

const Report = require('../models/reportModel');
const User = require('../models/userModel');
const multer = require('multer');
const sharp = require('sharp');
const fetch = require('node-fetch');
const io = require('../socket');

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

const adminFilter = owner => {
  var match = {};
  switch (owner) {
    case 'EDMC':
      match['results.district'] = {
        $in: ['Shahdara District', 'East District', 'North East District']
      };
      match.reportType = {
        $in: ['garbage', 'road', 'water', 'electricity', 'crime']
      };
      break;
    case 'SDMC':
      match['results.district'] = {
        $in: [
          'South East Delhi District',
          'South District',
          'West District',
          'South West District',
          'Central District'
        ]
      };
      match.reportType = {
        $in: ['garbage', 'road', 'water', 'electricity', 'crime']
      };
      break;
    case 'NDMC':
      match['results.district'] = {
        $in: ['North West District', 'North District', 'Central District']
      };
      match.reportType = {
        $in: ['garbage', 'road', 'water', 'electricity', 'crime']
      };
      break;
    case 'NewDMC':
      match['results.district'] = {
        $in: ['New Delhi District']
      };
      match.reportType = {
        $in: ['garbage', 'road', 'water', 'electricity', 'crime']
      };
      break;
    case 'DJB':
      match.reportType = {
        $in: ['water']
      };
      break;
    case 'PWD':
      match.reportType = {
        $in: ['road']
      };
      break;
  }

  return match;
};

const userFilter = user => {
  var match = {};
  match.username = user.username;
  return match;
};

const findAdmins = report => {
  var admins = [];
  // prettier-ignore
  if(['garbage', 'road', 'water', 'electricity', 'crime'].includes(report.reportType)){
    if (['Shahdara District', 'East District', 'North East District'].includes(report.results.district)){
      admins.push('EDMC')
    }
    if (['South East Delhi District', 'South District', 'West District', 'South West District', 'Central District'].includes(report.results.district)){
      admins.push('SDMC')
    }
    if (['North West District', 'North District', 'Central District'].includes(report.results.district)){
      admins.push('NDMC')
    }
    if (['New Delhi District'].includes(report.results.district)){
      admins.push('NewDMC')
    }
  }
  // prettier-ignore
  if (report.reportType == 'road') {
    admins.push('PWD')
  }
  // prettier-ignore
  if (report.reportType == 'water') {
    admins.push('DJB')
  }
  return admins;
};

//Image resizing - Saving in DB controller
const postSubmitData = async (req, res) => {
  try {
    var newReport = {};
    const buffer = await sharp(req.file.buffer)
      .resize(1920, 1920, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .toFormat('jpeg')
      .toBuffer();
    newReport.imageBuffer = buffer;
    if (!req.body.name == '') newReport.name = req.body.name;
    if (!req.body.contactNumber == null)
      newReport.contactNumber = req.body.contactNumber;
    newReport.reportType = req.body.reportType;
    newReport.description = req.body.description;
    newReport.location = req.body.location;
    newReport.properties = {
      brief: req.body.description.slice(0, 100)
    };
    newReport.geometry = {
      coordinates: [req.body.longitude, req.body.latitude]
    };

    const response = await fetch(
      `http://apis.mapmyindia.com/advancedmaps/v1/${
        process.env.API_KEY
      }/rev_geocode?lat=${req.body.latitude}&lng=${req.body.longitude}`
    );

    const data = await response.json();
    newReport.results = data.results[0];

    if (req.user) {
      if (!req.user.owner) newReport.username = req.user.username;
    }

    const report = new Report(newReport);
    await report.save();

    //After saving report , checking user and updating user account
    if (req.user) {
      if (!req.user.owner) {
        let _id = req.user._id;
        User.updateOne(
          { _id: _id },
          {
            $inc: { submissions: 1 }
          },
          function(err) {
            if (err) {
              console.log(err);
            }
          }
        );
      }
    }
    //Emit notification event
    var reportData = {
      _id: report._id,
      reportType: report.reportType,
      pincode: report.results.pincode
    };
    // prettier-ignore
    var adminsArray = findAdmins(report);
    adminsArray.forEach(async admin => {
      //Report added notification
      io.getIO().emit(`reportAdded${admin}`, reportData);

      //counting unseen reports of that pincode for the admin
      var match = adminFilter(admin);
      match.createdAt = {
        $gt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24)
      };
      match['results.pincode'] = report.results.pincode;
      match.status = 'unseen';

      let count = await Report.countDocuments(match, function(err, c) {
        if (err) {
          console.log(err);
        }
      });
      console.log(count);

      //High Priority Reports notification
      if (count === 5) {
        io.getIO().emit(`priority1Report${admin}`, reportData);
      } else if (count === 3) {
        io.getIO().emit(`priority2Report${admin}`, reportData);
      }
    });

    res.status(201).send(`Report added to DB! with id ${report._id}`);
  } catch (e) {
    res.status(400).send({ error: e.errmsg });
  }
};

const getGeojson = async (req, res) => {
  try {
    var match = {};
    if (!(req.query.user == 'public')) {
      if (req.user) {
        if (req.user.owner) match = adminFilter(req.user.owner);
        else match = userFilter(req.user);
      }
    }
    match.reportType = req.params.reportType;
    match.status = { $nin: ['closed'] };

    features = await Report.find(match, 'geometry properties -_id');
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
    var match = {};
    var options = { sort: {} };
    if (!(req.query.user == 'public')) {
      if (req.user) {
        if (req.user.owner) match = adminFilter(req.user.owner);
        else match = userFilter(req.user);
      }
    }

    if (req.query.reportType) {
      if (req.query.reportType.length) match.reportType = req.query.reportType;
    }

    if (req.query.status) {
      if (req.query.status.length) match.status = req.query.status;
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
    if (req.query.limit) {
      options.limit = parseInt(req.query.limit);
    }

    if (req.query.skip) {
      options.skip = parseInt(req.query.skip);
    }

    var parts = [];
    if (req.query.sortBy) {
      parts = req.query.sortBy.split(':');
      options.sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    if (parts[0] == 'rank') {
      var jsonarray = await Report.aggregate([
        { $sortByCount: '$results.pincode' }
      ]);
      var order = jsonarray.map(function(obj) {
        return obj._id;
      });
      var reports = await Report.aggregate([
        { $match: match },
        {
          $addFields: {
            rank: { $indexOfArray: [order, '$results.pincode'] }
          }
        },
        { $sort: options.sort },
        { $project: { imageBuffer: 0 } }
      ]);
      res.status(200).send(reports);
    } else {
      var reports = await Report.find(match, '-imageBuffer', options);
      res.status(200).send(reports);
    }
  } catch (e) {
    res.status(404).send(e);
  }
};

const getCount = async (req, res) => {
  try {
    var match = {};
    if (!(req.query.user == 'public')) {
      if (req.user) {
        if (req.user.owner) match = adminFilter(req.user.owner);
        else match = userFilter(req.user);
      }
    }
    if (req.query.status) {
      match.status = `${req.query.status}`;
    }
    let count = await Report.countDocuments(match, function(err, c) {
      if (err) {
        console.log(err);
      }
    });
    res.status(200).send({ count: count });
  } catch (e) {
    res.status(404).send(e);
  }
};

const getGraph = async (req, res) => {
  try {
    var match = {};
    var count;
    if (!(req.query.user == 'public')) {
      if (req.user) {
        if (req.user.owner) match = adminFilter(req.user.owner);
        else match = userFilter(req.user);
      }
    }
    if (req.query.reportType) {
      if (req.query.reportType.length) match.reportType = req.query.reportType;
    }

    if (req.query.status) {
      if (req.query.status.length) match.status = req.query.status;
    }

    if (req.query.graphType == 'monthly') {
      match.createdAt = {
        $gt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 30 * 6)
      };

      count = await Report.aggregate([
        {
          $match: match
        },
        {
          $project: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            reportType: 1
          }
        },
        {
          $group: {
            _id: { year: '$year', reportType: '$reportType', month: '$month' },
            n: { $sum: 1 }
          }
        },
        {
          $project: {
            month: '$_id.month',

            reportType: '$_id.reportType',
            _id: 0,
            n: 1
          }
        }
      ]);
    } else if (req.query.graphType == 'weekly') {
      match.createdAt = {
        $gt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 30)
      };
      count = await Report.aggregate([
        {
          $match: match
        },
        {
          $project: {
            year: { $year: '$createdAt' },
            week: { $week: '$createdAt' },
            reportType: 1
          }
        },
        {
          $group: {
            _id: { year: '$year', reportType: '$reportType', week: '$week' },
            n: { $sum: 1 }
          }
        },
        {
          $project: {
            week: '$_id.week',

            reportType: '$_id.reportType',
            _id: 0,
            n: 1
          }
        }
      ]);
    }
    res.status(200).send(count);
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

const updateReports = (req, res) => {
  try {
    let idarray = req.body.idarray;
    let status = req.body.status;
    Report.updateMany(
      { _id: { $in: idarray } },
      { $set: { status: status } },
      function(err) {
        if (err) {
          console.log(err);
        }
      }
    );

    // Crediting
    if (status == 'closed') {
      var set = {};
      set.credited = true;
    }

    res.status(200).send(`Reports updated`);
  } catch (e) {
    res.status(404).send(e);
  }
};

const deleteReports = (req, res) => {
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
  getGraph,
  updateReports,
  deleteReports
};
