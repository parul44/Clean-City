const express = require("express");
const router = express.Router();
const passport = require("passport");
const adminControllers = require("../controllers/adminControllers");
const Admin = require("../models/adminModel");

//show register form
router.get("/register",function(req,res){
    res.render("register");
});

//handle sign up logic
router.post("/register",function(req,res){
});

module.exports = router;