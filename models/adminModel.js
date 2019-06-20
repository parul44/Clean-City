const mongoose = require('mongoose');
var passportlocalmongoose = require('passport-local-mongoose');

//Defining admintSchema
const adminSchema = new mongoose.Schema({
  username: String,
  password: String,
  owner: {
    type: String,
    default: 'EDMC'
  }
});

adminSchema.plugin(passportlocalmongoose);

//Creating Admin Model with Admin Schema
const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
