// Main server file
const express = require('express');
const path = require('path');
require('./db/mongoose');
const bodyParser = require('body-parser');
const passport = require("passport");
const LocalStrategy = require("passport-local");
const Admin = require("./models/adminModel");
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

const PORT = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'client')));

//passport configuration
app.use(require("express-session")({
  secret: "clean city is the best website",
  resave: false,
  saveUninitialized: false
}));
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

app.get('/', (req, res, next) => {
  res.sendFile(__dirname + '/client/index.html');
});

app.listen(PORT, () => {
  console.log(`Server has started on port ${PORT}`);
});
