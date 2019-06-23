var middlewareobj = {};

middlewareobj.isLoggedIn = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/adminlogin');
};

module.exports = middlewareobj;
