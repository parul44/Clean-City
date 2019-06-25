const mongoose = require('mongoose');
var passportlocalmongoose = require('passport-local-mongoose');

//Defining adminSchema
const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    trim: true,
    required: true
  },
  password: {
    type: String
  },
  owner: {
    type: String,
    required: true
  }
});

adminSchema.plugin(passportlocalmongoose);

//Creating Admin Model with Admin Schema
const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
