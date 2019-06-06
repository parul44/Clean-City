const express = require('express');
const router = express.Router();
const passport = require("passport");
const adminControllers = require('../controllers/adminControllers');
const Report = require('../models/reportModel');
const Admin = require('../models/adminModel');


router.post('/register', adminControllers.register);

router.post('/login',passport.authenticate("local", 
{
    successRedirect: "/dashboard",
    failureRedirect: "/login"
}), function(req, res){
});

router.get('/logout',function(req,res){
    req.logout();
    res.redirect("/");
});

module.exports = router;
