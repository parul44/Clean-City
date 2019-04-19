const mongoose = require('mongoose');
// const validator = require('validator');

//Defining geocheme as subschema for report schema
const GeoSchema = new mongoose.Schema({
  type: {
    type: String,
    default: 'Point'
  },
  coordinates: {
    type: [Number],
    index: '2dsphere'
  }
});

//Defining Report Schema
const reportSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: 'Anonymous',
      trim: true
    },
    reportType: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true,
      minlength: 7,
      maxlength: 100,
      trim: true
    },
    location: {
      type: String,
      required: true
    },
    imageUrl: {
      type: String
    },
    imageBuffer: {
      type: Buffer
    },
    geometry: GeoSchema
  },
  {
    timestamps: true
  }
);

//Creating Report Model with Report Schema
const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
