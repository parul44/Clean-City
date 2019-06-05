// Main server file
const express = require('express');
const path = require('path');
require('./db/mongoose');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

const PORT = process.env.PORT || 5000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'client')));

// Routes
// User routes
app.use('/user', userRoutes);

// Admin routes
app.use('/admin', adminRoutes);

//html routes
app.get('/about', (req, res, next) => {
  res.sendFile(__dirname + '/client/about.html');
});

app.get('/form', (req, res, next) => {
  res.sendFile(__dirname + '/client/form.html');
});

app.get('/', (req, res, next) => {
  res.sendFile(__dirname + '/client/index.html');
});

app.listen(PORT, () => {
  console.log(`Server has started on port ${PORT}`);
});
