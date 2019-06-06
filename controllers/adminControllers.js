// name the controllers in this format '<method of request><Name of the route>'

const Admin = require('../models/adminModel');

const getTest = (req, res, next) => {
  res.send('Admin Test');
};

module.exports = {
  getTest
};
