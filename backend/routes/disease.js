const express = require("express");
const Disease = require("../models/Disease");
const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");

const router = express.Router();

/* =========================================================
   FETCH DISEASE INFO
========================================================= */
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

/* =========================================================
   ML PREDICTION (NODE → FLASK → HF SPACES)
========================================================= */
router.post("/predict", async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: "No image file provided" });
    }

    const image = req.files.file || req.files[Object.keys(req.files)[0]];
    const { patientName, email } = req.body;

    const formData = new FormData();
    formData.append("file", image.data, image.name);
    formData.append("patientName", patientName || "Unknown");
    formData.append("email", email || "Unknown");

    const mlResponse = await axios.post(
      `${process.env.ML_API_URL}/predict`,
      formData,
      {
        headers: formData.getHeaders(),
        timeout: 120000,
      }
    );

    return res.json(mlResponse.data);

  } catch (error) {
    console.error("❌ ML Prediction Error:", error);
    return res.status(500).json({ message: "error while trying to predict" });
  }
});

/* =========================================================
   GENERATE PDF REPORT
========================================================= */
router.post("/generate-pdf", async (req, res) => {
  console.log("📥 PDF generation request hit the route");

  try {
    let { username, predicted_disease } = req.body;

    const safeUsername =
      typeof username === "string" && username.trim().length > 0
        ? username.trim()
        : "Anonymous Patient";

    if (!predicted_disease) {
      return res.status(400).json({ message: "Predicted disease missing" });
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
    doc.fontSize(20).font("Helvetica-Bold").text("DERMIFY", { align: "center" });
    doc.moveDown(0.3);
    doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.3);

    // Patient Info
    const dateTime = new Date().toLocaleString();
    doc.fontSize(10).font("Times-Roman").text(`Patient Name: ${safeUsername}`);
    doc.text(`Role: Patient`);
    doc.text(`Date/Time: ${dateTime}`, { align: "right" });
    doc.moveDown(0.2);
    doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.3);

    // Title
    doc.fontSize(14).font("Times-Bold").text("Skin Prediction Report", {
      align: "center",
      underline: true,
    });
    doc.moveDown(0.4);

    // Disease Info
    doc.fontSize(14).font("Times-Roman").text(`Disease Name: ${name}`);
    doc.moveDown(0.3);

    doc.text("Description:", { underline: true });
    doc.text(description);
    doc.moveDown(0.3);

    doc.text("Prevention:", { underline: true });
    prevention.forEach((step, index) => {
      doc.text(`${index + 1}. ${step}`);
    });
    doc.moveDown(0.3);

    doc.text("Treatment:", { underline: true });
    treatment.forEach((step, index) => {
      doc.text(`${index + 1}. ${step}`);
    });
    doc.moveDown(0.3);

    if (diet?.length) {
      doc.text("Recommended Diet:", { underline: true });
      diet.forEach((item, index) => {
        doc.text(`${index + 1}. ${item}`);
      });
      doc.moveDown(0.3);
    }

    // Images
    if (image?.length) {
      doc.text("Sample Images:", { underline: true });
      doc.moveDown(0.2);

      let startX = 40;
      let startY = doc.y;

      image.slice(0, 3).forEach((imgPath) => {
        const absolutePath = path.join(__dirname, "..", imgPath);
        if (fs.existsSync(absolutePath)) {
          doc.image(absolutePath, startX, startY, { width: 100, height: 100 });
          startX += 110;
        }
      });

      doc.y = startY + 110;
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
