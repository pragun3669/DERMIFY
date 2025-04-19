const express = require("express");
const Disease = require("../models/Disease"); // Disease Model
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// ✅ Fetch disease information from the database
router.get("/disease-info/:diseaseName", async (req, res) => {
  try {
    const diseaseName = req.params.diseaseName;
    const disease = await Disease.findOne({ name: diseaseName });

    if (!disease) {
      return res.status(404).json({ message: "Disease not found" });
    }

    res.json(disease);
  } catch (error) {
    console.error("Error fetching disease info:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/generate-pdf", async (req, res) => {
  try {
      const { body_part, symptoms, predicted_disease, username } = req.body;

      if (!body_part || !symptoms || !predicted_disease || !username) {
          return res.status(400).json({ message: "Missing required fields" });
      }

      const diseaseInfo = await Disease.findOne({ name: predicted_disease });

      if (!diseaseInfo) {
          return res.status(404).json({ message: "Disease not found in database" });
      }

      const { name, description, prevention, treatment } = diseaseInfo;

      const doc = new PDFDocument({ margin: 50 });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=${name.replace(/\s+/g, "_")}_Report.pdf`);

      doc.pipe(res);

      // Title with Green "DERMIFY" and Bold
      doc.fontSize(24).fillColor("black").font('Helvetica-Bold').text("DERMIFY", { align: "center" });
      doc.moveDown(0.5);
      
      // Horizontal line
      doc.moveDown(0.25).lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);

      // Patient Details (Username, Role, Date/Time)
      const dateTime = new Date().toLocaleString();
      doc.fontSize(12).font('Times-Roman').text(`Patient Name: ${username}`, { align: "left" });
      doc.text(`Role: Patient`, { align: "left" });
      doc.text(`Date/Time: ${dateTime}`, { align: "right", bold: true });

      // Horizontal line again
      doc.moveDown(0.5).lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);

      // Skin Prediction Report
      doc.fontSize(18).font('Times-Roman').text("Skin Prediction Report", { align: "center", underline: true }).moveDown();

      // Disease Information
      doc.fontSize(14).font('Times-Roman').text(`Disease Name: ${name}`).moveDown();
      doc.fontSize(12).font('Times-Roman').text(`Affected Body Part: ${body_part}`).moveDown();
      doc.fontSize(12).font('Times-Roman').text(`Selected Symptoms: ${symptoms.join(", ")}`).moveDown();

      doc.fontSize(12).font('Times-Roman').text("Description:", { underline: true }).text(description).moveDown();

      doc.fontSize(12).font('Times-Roman').text("Prevention:", { underline: true });
      prevention.forEach((step, index) => doc.text(`${index + 1}. ${step}`));
      doc.moveDown();

      doc.fontSize(12).font('Times-Roman').text("Treatment:", { underline: true });
      treatment.forEach((step, index) => doc.text(`${index + 1}. ${step}`));
      doc.moveDown();

      // Disclaimer
      doc.moveDown();
      doc.fontSize(12).font('Helvetica').text("**This information is not accurate. If serious, kindly visit a doctor.**", { align: "center" });

      doc.end();
  } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).json({ message: "Failed to generate PDF" });
  }
});

module.exports = router;
