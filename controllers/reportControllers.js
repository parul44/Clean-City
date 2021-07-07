// name the controllers in this format '<method of request><Name of the route>'

const Report = require('../models/reportModel');
const User = require('../models/userModel');
const multer = require('multer');
const aws = require('aws-sdk');
const multerS3 = require('multer-s3-transform');
const sharp = require('sharp');
const sgMail = require('@sendgrid/mail');
const fetch = require('node-fetch');
const io = require('../socket');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
  to: 'errahulgupta93@gmail.com',
  from: 'develophowtowebsite@gmail.com',
  subject: 'More than 4 reports!!!',
  text:
    'More than 4 reports have been added from same area , Please pay attention...',
  html:
    '<strong>More than 4 reports have been added from same area , Please pay attention...</strong>'
};
//controllers
//Multer file upload controller
aws.config.update({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  region: 'us-east-2'
});

const s3 = new aws.S3();

const upload = multer({
  storage: multerS3({
    acl: 'public-read',
    s3,
    bucket: 'clean-city-uploads',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    shouldTransform: function (req, file, cb) {
      cb(null, /^image/i.test(file.mimetype))
    },
    transforms: [{
      id: 'original',
      key: function (req, file, cb) {
        cb(null, Date.now().toString())
      },
      transform: function (req, file, cb) {
        cb(null, sharp()
        .resize(1920, 1920, {
          fit: 'inside',
          withoutEnlargement: true
        }).toFormat('jpeg')
        )
      }
    }]
  }),
  limits: {
    fileSize: 6 * 1024 * 1024
  },
  fileFilter(req, file, cb) {
    if (!(file.originalname.match(/\.(jpg|jpeg|png)$/i)&&(file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/png'))) {
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
const postSubmitData = async (req, res, next) => {
  try {
    var newReport = {};
    if (!req.body.name == '') newReport.name = req.body.name;
    if (!req.body.contactNumber == null)
      newReport.contactNumber = req.body.contactNumber;
    newReport.reportType = req.body.reportType;
    newReport.description = req.body.description;
    newReport.location = req.body.location;
    newReport.imageUrl = req.file.transforms[0].location;
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
        let username = req.user.username;
        User.updateOne(
          { username: username },
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
      sgMail.send(msg).catch(e => console.log(e));

      //High Priority Reports notification
      //counting unseen reports in 24h of that pincode/reportType for the admin
      var match = adminFilter(admin);
      match.createdAt = {
        $gt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24)
      };
      match['results.pincode'] = report.results.pincode;
      match.reportType = report.reportType;
      match.status = 'unseen';

      let count = await Report.countDocuments(match, function(err, c) {
        if (err) {
          console.log(err);
        }
      });

      if (count === 21) {
        io.getIO().emit(`priority1Report${admin}`, reportData);
      } else if (count === 16) {
        io.getIO().emit(`priority2Report${admin}`, reportData);
      } else if (count === 11) {
        io.getIO().emit(`priority3Report${admin}`, reportData);
      }
    });

    res.status(201).redirect(`/report/${report._id}`);
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: err.message });
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
    console.log(e);
    res.status(500).send(e.message);
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
        { $sort: options.sort }
      ]);
      res.status(200).send(reports);
    } else {
      var reports = await Report.find(match,{},options);
      res.status(200).send(reports);
    }
  } catch (e) {
    console.log(e);
    res.status(500).send(e.message);
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
    console.log(e);
    res.status(500).send(e.message);
  }
};

const getPriorityCount = async (req, res) => {
  try {
    var match = {};
    if (!(req.query.user == 'public')) {
      if (req.user) {
        if (req.user.owner) match = adminFilter(req.user.owner);
        else match = userFilter(req.user);
      }
    }
    match.createdAt = {
      $gt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24)
    };
    if (req.query.status) {
      if (req.query.status.length) match.status = req.query.status;
    }

    let count = await Report.aggregate(
      [
        {
          $match: match
        },
        {
          $project: {
            pincode: '$results.pincode',
            reportType: 1,
            _id: 0
          }
        },
        {
          $group: {
            _id: { pincode: '$pincode', reportType: '$reportType' },
            count: { $sum: 1 }
          }
        },
        {
          $match: { count: { $gt: 2 } }
        }
      ],
      function(err, c) {
        if (err) {
          console.log(err);
        }
      }
    );

    res.status(200).send(count);
  } catch (e) {
    console.log(e);
    res.status(500).send(e.message);
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
    console.log(e);
    res.status(500).send(e.message);
  }
};

const getReportsID = async (req, res) => {
  const _id = req.params.id;
  try {
    const report = await Report.findOne({ _id });
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.send(report);
  } catch (e) {
    console.log(e);
    res.status(500).send(e.message);
  }
};

const updateReports = async (req, res) => {
  try {
    let idarray = req.body.idarray;
    let status = req.body.status;
    Report.updateMany(
      { _id: { $in: idarray } },
      { $set: { status: status } },
      async function(err) {
        // CREDITING PROCESS
        if (status == 'closed') {
          //Finidng Non-credited , Non-anonymous Reports
          var reports = await Report.find(
            {
              _id: { $in: idarray },
              credited: false,
              username: { $exists: true }
            },
            { username: 1 }
          );
          //For each such report, Crediting the linked user and Setting 'credited' field to true
          reports.forEach(report => {
            //Crediting the linked user
            User.updateOne(
              { username: report.username },
              {
                $inc: { credits: 2 }
              },
              function(err) {
                // Setting 'credited' field to true
                Report.updateOne(
                  { _id: report._id },
                  {
                    $set: { credited: true }
                  },
                  function(err) {
                    if (err) {
                      console.log(err);
                    }
                  }
                );
                if (err) {
                  console.log(err);
                }
              }
            );
          });
        }
        if (err) {
          console.log(err);
        }
      }
    );

    res.status(200).send(`Reports updated`);
  } catch (e) {
    console.log(e);
    res.status(500).send(e.message);
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
    console.log(e);
    res.status(500).send(e.message);
  }
};

module.exports = {
  upload,
  postSubmitData,
  getGeojson,
  getReports,
  getReportsID,
  getCount,
  getPriorityCount,
  getGraph,
  updateReports,
  deleteReports
};
