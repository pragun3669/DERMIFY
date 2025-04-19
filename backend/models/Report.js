const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",  // Refers to your User model
    required: true
  },
  email: {
    type: String,
    required: true
  },
  prediction: {
    type: String,
    required: true
  },
  reportPath: {
    type: String,  // Path to the saved PDF file
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Report = mongoose.model("Report", reportSchema);
module.exports = Report;
