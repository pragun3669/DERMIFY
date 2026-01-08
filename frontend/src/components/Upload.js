import React, { useState, useRef, useEffect } from 'react';
import axios from "axios";
import "../styles/Skinclassifier.css";

function UploadImage() {
    const [capturedImage, setCapturedImage] = useState(null);
    const [prediction, setPrediction] = useState("");
    const [predictedDisease, setPredictedDisease] = useState("");
    const [confidence, setConfidence] = useState(null);
    const [pdfLoading, setPdfLoading] = useState(false);
    const snapshotRef = useRef();
    const videoRef = useRef();
    const [user, setUser] = useState({ username: "", email: "" });

    const IP_WEBCAM_URL = "http://192.168.29.204:8080"; // Change to your actual IP

    // Load user info from localStorage
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser) {
            setUser(storedUser);
        }
    }, []);

    // Auto-refresh the live image feed every 200ms
    useEffect(() => {
        const interval = setInterval(() => {
            if (videoRef.current) {
                videoRef.current.src = `${IP_WEBCAM_URL}/shot.jpg?${Date.now()}`;
            }
        }, 200); // Refresh every 200ms

        return () => clearInterval(interval);
    }, []);

    // Capture image from the <img> tag
    const captureImage = () => {
        const canvas = snapshotRef.current;
        const context = canvas.getContext("2d");
        const img = videoRef.current;

        canvas.width = img.naturalWidth || 640;
        canvas.height = img.naturalHeight || 480;

        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setCapturedImage(dataUrl);
    };

    // Convert data URL to file
    const dataURLtoFile = (dataURL, filename) => {
        const [metadata, base64] = dataURL.split(",");
        const mime = metadata.match(/:(.*?);/)[1];
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const arrayBuffer = new ArrayBuffer(len);
        const uintArray = new Uint8Array(arrayBuffer);

        for (let i = 0; i < len; i++) {
            uintArray[i] = binaryString.charCodeAt(i);
        }

        return new File([uintArray], filename, { type: mime });
    };

    // Send captured image for prediction
    const handlePredict = () => {
        if (!capturedImage) {
            alert("Please capture an image first.");
            return;
        }

        const imageFile = dataURLtoFile(capturedImage, "captured_image.jpg");
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("patientName", user.username);
        formData.append("email", user.email);

        axios.post(`${process.env.REACT_APP_API_URL}/api/predict` , formData, {
            headers: { "Content-Type": "multipart/form-data" }
        })
        .then((response) => {
            setPredictedDisease(response.data.prediction);
            setConfidence(response.data.confidence);
            setPrediction(`Predicted Class: ${response.data.prediction}`);
        })
        .catch((error) => {
            console.error("Error uploading image:", error);
            alert("Error processing image. Try again.");
        });
    };

    // Generate PDF report
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

    return (
        <div className="container">
            <h2 className="header">IP Webcam Live Stream & Image Capture</h2>

            {/* Live image feed from IP Webcam */}
            <img
                ref={videoRef}
                src={`${IP_WEBCAM_URL}/shot.jpg`}
                alt="Live Camera Feed"
                className="preview-image"
                crossOrigin="anonymous"
            />

            {/* Capture and Predict Buttons */}
            <div className="button-group">
                <button onClick={captureImage} className="green-button">
                    Capture Image
                </button>

                <button onClick={handlePredict} className="green-button">
                    Predict
                </button>
            </div>

            {/* Hidden canvas for capturing the frame */}
            <canvas ref={snapshotRef} style={{ display: "none" }}></canvas>

            {/* Display the captured image */}
            {capturedImage && (
                <div>
                    <h3>Captured Image</h3>
                    <img src={capturedImage} alt="Captured" className="preview-image" />
                </div>
            )}

            {/* Display Prediction Results */}
            {prediction && (
                <div>
                    <h3 className="result-text">{prediction}</h3>

                    {confidence !== null && (
                        <div className="progress-bar-container">
                            <div
                                className="progress-bar"
                                style={{
                                    width: `${confidence}%`,
                                    backgroundColor: confidence >= 80 ? "#4caf50" : confidence >= 50 ? "#ffeb3b" : "#f44336",
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

export default UploadImage;
