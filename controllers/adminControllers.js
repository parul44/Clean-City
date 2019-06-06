// name the controllers in this format '<method of request><Name of the route>'
const passport = require("passport");
const Admin = require('../models/adminModel');


const register = (req, res, next) => {
  var newUser = new Admin({username: req.body.username});
    Admin.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
        }
        passport.authenticate("local")(req, res, function(){
           res.redirect("/"); 
        });
    });
};

module.exports = {
  register
};
