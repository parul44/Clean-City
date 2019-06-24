const mongoose = require('mongoose');
var passportlocalmongoose = require('passport-local-mongoose');

//Defining userSchema
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  credits: {
    type: Number,
    default: 0
  }
});

userSchema.plugin(passportlocalmongoose);

//Creating User Model with User Schema
const User = mongoose.model('User', userSchema);

module.exports = User;
