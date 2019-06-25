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
    passport.authenticate('admin')(req, res, function() {
      res.redirect('/dashboard');
    });
  });
};

const login = passport.authenticate('admin', {
  // successRedirect: '/dashboard',
  failureRedirect: '/adminLogin'
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
