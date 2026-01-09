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

  /* ======================
     LOAD USER ON MOUNT
  ====================== */
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser?.username && storedUser?.email) {
      setUser({
        username: storedUser.username,
        email: storedUser.email
      });
    }
  }, []);

  /* ======================
     IMAGE HANDLERS
  ====================== */
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const capturePhoto = () => {
    const screenshot = webcamRef.current.getScreenshot();
    fetch(screenshot)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], "webcam.jpg", { type: "image/jpeg" });
        setImage(file);
        setPreview(URL.createObjectURL(file));
        setShowWebcam(false);
      });
  };

  /* ======================
     ML PREDICT
  ====================== */
  const handleSubmit = async () => {
    if (!image) {
      alert("Please upload or capture an image.");
      return;
    }

    if (!user.username) {
      alert("User not found. Please login again.");
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

  /* ======================
     GENERATE PDF
  ====================== */
  const handleGeneratePDF = async () => {
    if (!predictedDisease) {
      alert("Please predict a disease first.");
      return;
    }

    if (!user.username) {
      alert("User not found. Please login again.");
      return;
    }

    setPdfLoading(true);

    try {
      const pdfResponse = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/generate-pdf`,
        {
          username: user.username,          // ✅ FIXED
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
      alert("Failed to generate PDF.");
    } finally {
      setPdfLoading(false);
    }
  };

  /* ======================
     UI HELPERS
  ====================== */
  const getSeverityColor = () => {
    if (confidence >= 80) return "green";
    if (confidence >= 50) return "yellow";
    return "red";
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
        <button className="green-button" onClick={() => { setShowWebcam(false); setShowFileInput(true); }}>
          Upload Photo
        </button>
        <button className="green-button" onClick={() => { setShowFileInput(false); setShowWebcam(true); }}>
          Take Photo
        </button>
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
          <img src={preview} alt="preview" className="preview-image" />
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

          <button
            className="green-button"
            onClick={handleGeneratePDF}
            disabled={pdfLoading}
          >
            {pdfLoading ? "Generating PDF..." : "Download Report"}
          </button>
        </div>
      )}
    </div>
  );
}

export default SkinDisease;
