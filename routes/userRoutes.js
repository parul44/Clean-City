const express = require("express");
const router = express.Router();
const userControllers = require("../controllers/userControllers");

// final route is /user/test
router.get("/test", userControllers.getTest);

module.exports = router;
