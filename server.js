// Main server file
const express = require('express');
const path = require('path');
require('./db/mongoose');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const Report = require('./models/reportModel');
const adminRoutes = require('./routes/adminRoutes');
const Admin = require('./models/adminModel');
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
passport.use(new LocalStrategy(Admin.authenticate()));
passport.serializeUser(Admin.serializeUser());
passport.deserializeUser(Admin.deserializeUser());

// Routes
// User routes
app.use('/user', userRoutes);

// Admin routes
app.use('/admin', adminRoutes);

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
    const report = await Report.findOne({ _id }, '-imageBuffer');
    if (!report) {
      return res.status(404).send({ error: 'Report not found' });
    }
    date1 = new Date(report.createdAt);
    date2 = new Date(report.updatedAt);
    res.status(200).send(`
      <h1>REPORT ID : ${report._id}</h1>
      <h5>Created on: ${date1.toLocaleString('en-GB')}</h5>
      <h5>Updated on: ${date2.toLocaleString('en-GB')}</h5>
      <h5> Status : ${report.status}</h5>
      <pre>
        <p> 
        <b>View Image:</b> <a href='/user/image/${
          report._id
        }' target=_blank>Click here</a>
        <b>View Location on Google Map:</b> <a href='https://www.google.com/maps/dir/${
          report.geometry.coordinates[1]
        },${report.geometry.coordinates[0]}' target=_blank>Click here</a>

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

app.get('/register', (req, res, next) => {
  res.sendFile(__dirname + '/client/register.html');
});

app.get('/login', (req, res, next) => {
  res.sendFile(__dirname + '/client/login.html');
});

app.get('/dashboard', middleware.isLoggedIn, (req, res, next) => {
  res.sendFile(__dirname + '/admin/dashboard.html');
});

app.get('/dashboardReports', middleware.isLoggedIn, (req, res, next) => {
  res.sendFile(__dirname + '/admin/ReportsForAdmin.html');
});

app.get('/', (req, res, next) => {
  res.sendFile(__dirname + '/client/index.html');
});

app.use(middleware.isLoggedIn);
app.use(express.static(path.join(__dirname, 'admin')));

app.listen(PORT, () => {
  console.log(`Server has started on port ${PORT}`);
});
