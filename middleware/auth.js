var middlewareobj = {};

middlewareobj.isLoggedIn = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/adminLogin');
};

middlewareobj.isLoggedInUser = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/userLogin');
};

module.exports = middlewareobj;
