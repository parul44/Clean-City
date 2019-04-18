const express = require("express");
const router = express.Router();
const adminControllers = require("../controllers/adminControllers");

// final route is /admin/test
router.get("/test", adminControllers.getTest);

module.exports = router;