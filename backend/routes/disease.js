const express = require("express");
const Disease = require("../models/Disease");
const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// Fetch disease info from database
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

// Generate PDF Report with Image + Diet
router.post("/generate-pdf", async (req, res) => {
  console.log("📥 PDF generation request hit the route");
  try {
    const { username, predicted_disease } = req.body;

    if (!username || !predicted_disease) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const diseaseInfo = await Disease.findOne({ name: predicted_disease });

    if (!diseaseInfo) {
      return res.status(404).json({ message: "Disease not found in database" });
    }

    const { name, description, prevention, treatment, diet, image } = diseaseInfo;

    const doc = new PDFDocument({ margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${name.replace(/\s+/g, "_")}_Report.pdf`
    );

    doc.pipe(res);

    // Header
    doc.fontSize(20).fillColor("black").font("Helvetica-Bold").text("DERMIFY", { align: "center" });
    doc.moveDown(0.3);
    doc.lineWidth(0.5).moveTo(40, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.3);

    // Patient Info
    const dateTime = new Date().toLocaleString();
    doc.fontSize(10).font("Times-Roman").text(`Patient Name: ${username}`);
    doc.text(`Role: Patient`);
    doc.text(`Date/Time: ${dateTime}`, { align: "right" });
    doc.moveDown(0.2);
    doc.lineWidth(0.5).moveTo(40, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.3);

    // Report Title
    doc.fontSize(14).font("Times-Bold").text("Skin Prediction Report", {
      align: "center",
      underline: true,
    });
    doc.moveDown(0.4);

    // Disease Info
    doc.fontSize(14).font("Times-Roman").text(`Disease Name: ${name}`);
    doc.moveDown(0.3);

    doc.text("Description:", { underline: true });
    doc.text(description, { lineGap: 1 });
    doc.moveDown(0.3);

    doc.text("Prevention:", { underline: true });
    prevention.forEach((step, index) => {
      doc.text(`${index + 1}. ${step}`, { lineGap: 0.5 });
    });
    doc.moveDown(0.3);

    doc.text("Treatment:", { underline: true });
    treatment.forEach((step, index) => {
      doc.text(`${index + 1}. ${step}`, { lineGap: 0.5 });
    });
    doc.moveDown(0.3);

    if (diet && diet.length > 0) {
      doc.text("Recommended Diet:", { underline: true });
      diet.forEach((item, index) => {
        doc.text(`${index + 1}. ${item}`, { lineGap: 0.5 });
      });
      doc.moveDown(0.3);
    }

    // Limit number of images and size
    if (image && image.length > 0) {
      doc.text("Sample Images:", { underline: true });
      doc.moveDown(0.2);

      let startX = 40;
      let startY = doc.y;
      const imageWidth = 100;
      const imageHeight = 100;
      const gap = 10;
      const maxImages = 3;

      image.slice(0, maxImages).forEach((imgPath, index) => {
        const absolutePath = path.join(__dirname, "..", imgPath);
        if (fs.existsSync(absolutePath)) {
          if (startX + imageWidth > 550) {
            startX = 40;
            startY += imageHeight + gap;
          }
          doc.image(absolutePath, startX, startY, { width: imageWidth, height: imageHeight });
          startX += imageWidth + gap;
        } else {
          doc.fontSize(9).text(`Image ${index + 1} not found.`, startX, startY);
          startX += imageWidth + gap;
        }
      });

      doc.y = startY + imageHeight + gap;
    }

    // Disclaimer
    doc.moveDown(0.3);
    doc.fontSize(9).font("Helvetica-Oblique").fillColor("green").text(
      "**This information is not accurate. If serious, kindly visit a doctor.**",
      { align: "center" }
    );

    doc.end();

  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ message: "Failed to generate PDF" });
  }
});

module.exports = router;
