var middlewareobj = {};

middlewareobj.isLoggedIn = function(req, res, next) {
  if (req.isAuthenticated() && req.user.owner) {
    return next();
  }
  res.redirect('/adminLogin');
};

middlewareobj.isLoggedInUser = function(req, res, next) {
  if (req.isAuthenticated() && !req.user.owner) {
    return next();
  }
  res.redirect('/userLogin');
};

module.exports = middlewareobj;
