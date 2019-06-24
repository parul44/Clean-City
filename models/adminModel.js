const mongoose = require('mongoose');
var passportlocalmongoose = require('passport-local-mongoose');

//Defining adminSchema
const adminSchema = new mongoose.Schema({
  username: String,
  password: String,
  owner: {
    type: String
  }
});

adminSchema.plugin(passportlocalmongoose);

//Creating Admin Model with Admin Schema
const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
