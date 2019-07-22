// Main server file
const express = require('express');
const path = require('path');
require('./db/mongoose');
const bodyParser = require('body-parser');
const Report = require('./models/reportModel');
const reportRoutes = require('./routes/reportRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const Admin = require('./models/adminModel');
const User = require('./models/userModel');
const passport = require('passport');
var LocalStrategy = require('passport-local');
var middleware = require('./middleware/auth');

const app = express();

const PORT = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const public = path.join(__dirname, 'client');
app.use(express.static(public));

//Passport configuration
app.use(
  require('express-session')({
    secret: 'best website ever!',
    resave: false,
    saveUninitialized: false
  })
);
app.use(passport.initialize());
app.use(passport.session());

//passport for admin
passport.use('admin', new LocalStrategy(Admin.authenticate()));

//passport for admin
passport.use('user', new LocalStrategy(User.authenticate()));

function SessionConstructor(userId, userGroup, details) {
  this.userId = userId;
  this.userGroup = userGroup;
  this.details = details;
}

passport.serializeUser(function(userObject, done) {
  // userObject could be a Model1 or a Model2... or Model3, Model4, etc.
  let userGroup = 'admin';
  let userPrototype = Object.getPrototypeOf(userObject);

  if (userPrototype === Admin.prototype) {
    userGroup = 'admin';
  } else if (userPrototype === User.prototype) {
    userGroup = 'user';
  }

  let sessionConstructor = new SessionConstructor(userObject.id, userGroup, '');
  done(null, sessionConstructor);
});

passport.deserializeUser(function(sessionConstructor, done) {
  if (sessionConstructor.userGroup == 'admin') {
    Admin.findOne(
      {
        _id: sessionConstructor.userId
      },
      '-localStrategy.password',
      function(err, user) {
        // When using string syntax, prefixing a path with - will flag that path as excluded.
        done(err, user);
      }
    );
  } else if (sessionConstructor.userGroup == 'user') {
    User.findOne(
      {
        _id: sessionConstructor.userId
      },
      '-localStrategy.password',
      function(err, user) {
        // When using string syntax, prefixing a path with - will flag that path as excluded.
        done(err, user);
      }
    );
  }
});

// Routes
// Report routes
app.use('/report', reportRoutes);

// Admin routes
app.use('/admin', adminRoutes);

// User routes
app.use('/user', userRoutes);

//html routes
app.get('/about', (req, res, next) => {
  res.sendFile(__dirname + '/client/about.html');
});

app.get('/form', (req, res, next) => {
  res.sendFile(__dirname + '/client/form.html');
});

app.get('/report/:id', async (req, res, next) => {
  const _id = req.params.id;
  try {
    const report = await Report.findOne({ _id });
    if (!report) {
      return res.status(404).send({ error: 'Report not found' });
    }
    date1 = new Date(report.createdAt);
    date2 = new Date(report.updatedAt);
    res.status(200).send(`
      <h1>SUBMITTED REPORT ID : ${report._id}</h1>
      <h5>Created on: ${date1.toLocaleString('en-GB')}</h5>
      <h5>Updated on: ${date2.toLocaleString('en-GB')}</h5>
      <h5> Status : ${report.status}</h5>
      <pre>
        <p> 
        <b>View Image:</b> <a href='${
          report.imageUrl
        }' target=_blank>Click here</a>
        <b>View Location on Google Map:</b> <a href='https://www.google.com/maps/dir/${
          report.geometry.coordinates[1]
        },${report.geometry.coordinates[0]}' target=_blank>Click here</a>

        <b>Uploader Username:</b> <i>${report.username}</i>
        <b>Uploader Name:</b> <i>${report.name}</i>
        <b>Uploader Contact No.:</b> <i>${report.contactNumber}</i>

        <b>Report Type:</b> <i>${report.reportType}</i>
        <b>Description:</b> <i>${report.description}</i>

        <b>Coordinates:</b> <i>${report.geometry.coordinates}</i>
        <b>Landmark Specified:</b> <i>${report.location}</i>
        <b>Locality:</b> <i>${report.results.locality}</i>
        <b>Pincode:</b> <i>${report.results.pincode}</i>
        <b>District:</b> <i>${report.results.district}</i>
        <b>Approximated Address:</b> <i>${report.results.formatted_address}</i>
        <p>
      </pre>
    `);
  } catch (e) {
    res.status(404).send();
  }
});

app.get('/userRegister', (req, res, next) => {
  res.sendFile(__dirname + '/client/userRegister.html');
});

app.get('/userLogin', (req, res, next) => {
  res.sendFile(__dirname + '/client/userLogin.html');
});

app.get('/userDashboard', middleware.isLoggedInUser, (req, res, next) => {
  res.sendFile(__dirname + '/users/userDashboard.html');
});

app.get('/adminRegister', (req, res, next) => {
  res.sendFile(__dirname + '/client/adminRegister.html');
});

app.get('/adminLogin', (req, res, next) => {
  res.sendFile(__dirname + '/client/adminLogin.html');
});

app.get('/dashboard', middleware.isLoggedInAdmin, (req, res, next) => {
  res.sendFile(__dirname + '/admins/dashboard.html');
});

app.get('/dashboardReports', middleware.isLoggedInAdmin, (req, res, next) => {
  res.sendFile(__dirname + '/admins/dashboardReports.html');
});

app.get('/', (req, res, next) => {
  res.sendFile(__dirname + '/client/index.html');
});

const server = app.listen(PORT, () => {
  console.log(`Server has started on port ${PORT}`);
});

const io = require('./socket').init(server);
io.on('connection', socket => {
  console.log('New client connected');
});
