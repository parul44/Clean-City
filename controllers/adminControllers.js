const passport = require('passport');
const Admin = require('../models/adminModel');

const register = (req, res, next) => {
  var newUser = new Admin({
    username: req.body.username,
    owner: req.body.owner
  });
  Admin.register(newUser, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
    }
    passport.authenticate('local')(req, res, function() {
      res.redirect('/');
    });
  });
};

const login = passport.authenticate('local', {
  // successRedirect: '/dashboard',
  failureRedirect: '/login'
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
