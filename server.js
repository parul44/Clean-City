// Main server file
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();

const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");

const PORT = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "client")));

// Routes

// User route
app.use("/user", userRoutes);

// Admin route
app.use("/admin", adminRoutes);

app.get("/", (req, res, next) => {
  res.sendFile(__dirname + "/client/index.html");
});

app.listen(PORT, () => {
  console.log(`Server has started on port ${PORT}`);
});