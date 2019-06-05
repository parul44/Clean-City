const mongoose = require('mongoose');

//Defining admintSchema
const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true
    },

    password: {
      type: String,
      required: true,
      minlength: 7,
      trim: true
    },

    zone: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

//Creating Admin Model with Admin Schema
const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
