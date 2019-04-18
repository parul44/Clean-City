// name the controllers in this format '<method of request><Name of the route>'
exports.getTest = (req, res, next) => {
  res.send("Admin Test");
};