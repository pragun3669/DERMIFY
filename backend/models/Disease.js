const mongoose = require("mongoose");

const DiseaseSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // Disease name
  description: { type: String, required: true }, // Disease details
  image: { type: [String], required: true }, // Array of image URLs or paths
  prevention: { type: [String], required: true }, // List of prevention tips
  treatment: { type: [String], required: true }, // List of treatment options
  diet: { type: [String], required: true } // Recommended diet list
});

module.exports = mongoose.model("Disease", DiseaseSchema);
