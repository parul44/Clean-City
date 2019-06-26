const passport = require('passport');
const User = require('../models/userModel');

const register = (req, res, next) => {
  var newUser = new User({
    username: req.body.username,
    name: req.body.name
  });
  User.register(newUser, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
    }
    passport.authenticate('user')(req, res, function() {
      res.redirect('/userDashboard');
    });
  });
};

const login = passport.authenticate('user', {
  failureRedirect: '/userLogin'
});

const logout = (req, res, next) => {
  req.logout();
  res.redirect('/');
};

const getInfo = (req, res, next) => {
  res.status(200).send(req.user);
};

module.exports = {
  register,
  login,
  logout,
  getInfo
};
