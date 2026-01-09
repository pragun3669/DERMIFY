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
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Webcam from "react-webcam";
import "../styles/Skinclassifier.css";

function SkinDisease() {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [prediction, setPrediction] = useState("");
    const [predictedDisease, setPredictedDisease] = useState("");
    const [confidence, setConfidence] = useState(null);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [user, setUser] = useState({ username: "", email: "" });
    const [showWebcam, setShowWebcam] = useState(false);
    const [showFileInput, setShowFileInput] = useState(false);
    const webcamRef = useRef(null);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser) {
            setUser(storedUser);
        }
    }, []);

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        setImage(file);
        setPreview(URL.createObjectURL(file));
    };

    const capturePhoto = () => {
        const screenshot = webcamRef.current.getScreenshot();
        fetch(screenshot)
            .then(res => res.blob())
            .then(blob => {
                const file = new File([blob], "webcam.jpg", { type: "image/jpeg" });
                setImage(file);
                setPreview(URL.createObjectURL(file));
                setShowWebcam(false);
            });
    };

    const handleSubmit = async () => {
        if (!image) {
            alert("Please upload or capture an image.");
            return;
        }

        const formData = new FormData();
        formData.append("file", image);
        formData.append("patientName", user.username);
        formData.append("email", user.email);

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/predict`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
              );
              

            setPredictedDisease(response.data.prediction);
            setConfidence(response.data.confidence);
            setPrediction(`Predicted Class: ${response.data.prediction}`);

        } catch (error) {
            console.error("Error uploading image:", error);
            alert("Error processing image. Try again.");
        }
    };

    const handleGeneratePDF = async () => {
        if (!predictedDisease) return;

        setPdfLoading(true);

        try {
            const storedUser = JSON.parse(localStorage.getItem("user"));
            const username = storedUser?.name || "Anonymous";

            const pdfResponse = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/generate-pdf`,
                {
                    username,
                    predicted_disease: predictedDisease
                },
                { responseType: "blob" }
            );

            const blob = new Blob([pdfResponse.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${predictedDisease.replace(/\s+/g, "_")}_Report.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Failed to generate PDF. Please try again.");
        } finally {
            setPdfLoading(false);
        }
    };

    const handleUploadClick = () => {
        setShowWebcam(false);
        setShowFileInput(true);
    };

    const handleCameraClick = () => {
        setShowFileInput(false);
        setShowWebcam(true);
    };

    // Function to determine severity color based on confidence level
    const getSeverityColor = () => {
        if (confidence >= 80) return "green";  // High confidence
        if (confidence >= 50) return "yellow"; // Medium confidence
        return "red";  // Low confidence
    };

    return (
        <div className="container">
            <h2 className="header">Skin Disease Predictor</h2>

            {user.username && (
                <div className="user-info">
                    <strong>Logged in as:</strong> {user.username} ({user.email})
                </div>
            )}

            <div className="button-group">
                <button className="green-button" onClick={handleUploadClick}>Upload Photo</button>
                <button className="green-button" onClick={handleCameraClick}>Take Photo</button>
            </div>

            {showWebcam && (
                <div>
                    <Webcam ref={webcamRef} audio={false} screenshotFormat="image/jpeg" width={300} />
                    <br />
                    <button className="green-button" onClick={capturePhoto}>Capture</button>
                </div>
            )}

            {showFileInput && (
                <input type="file" accept="image/*" onChange={handleImageUpload} />
            )}

            <button className="green-button" onClick={handleSubmit}>Predict</button>

            {preview && (
                <div>
                    <h3>Uploaded Image</h3>
                    <img src={preview} alt="Uploaded preview" className="preview-image" />
                </div>
            )}

            {prediction && (
                <div>
                    <h3 className="result-text">{prediction}</h3>

                    {confidence !== null && (
                        <div className="progress-bar-container">
                            <div 
                                className="progress-bar" 
                                style={{
                                    width: `${confidence}%`,
                                    backgroundColor: getSeverityColor()
                                }}
                            >
                                {confidence.toFixed(2)}%
                            </div>
                        </div>
                    )}

                    <button className="green-button" onClick={handleGeneratePDF} disabled={pdfLoading}>
                        {pdfLoading ? "Generating PDF..." : "Download Report"}
                    </button>
                </div>
            )}
        </div>
    );
}

export default SkinDisease;


module.exports = router;
