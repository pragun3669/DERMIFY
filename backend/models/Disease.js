const mongoose = require("mongoose");

const DiseaseSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // Disease name
  description: { type: String, required: true }, // Disease details
  image: { type: [String], required: true }, // URL of the disease image
  prevention: { type: [String], required: true }, // List of prevention tips
  treatment: { type: [String], required: true }, // List of treatment options
});

module.exports = mongoose.model("Disease", DiseaseSchema);
