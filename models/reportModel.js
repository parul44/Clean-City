const mongoose = require('mongoose');
// const validator = require('validator');

//Defining reportSchema
const reportSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true
    },
    contactNumber: {
      type: Number
    },
    reportType: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 800,
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
    properties: {
      brief: {
        type: String,
        default: 'Not specified'
      }
    },
    geometry: {
      type: {
        type: String,
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        index: '2dsphere'
      }
    },
    results: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

//Creating Report Model with Report Schema
const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
