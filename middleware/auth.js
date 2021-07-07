var middlewareobj = {};

middlewareobj.isLoggedInAdmin = function(req, res, next) {
  if (req.isAuthenticated()) {
    if (req.user.owner) return next();
  }
  res.redirect('/adminLogin');
};

middlewareobj.isLoggedInUser = function(req, res, next) {
  if (req.isAuthenticated() && !req.user.owner) {
    if (!req.user.owner) return next();
  }
  res.redirect('/userLogin');
};

module.exports = middlewareobj;
