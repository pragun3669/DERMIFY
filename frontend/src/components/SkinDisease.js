import React, { useState } from "react";
import axios from "axios";

function SkinDisease() {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [prediction, setPrediction] = useState("");

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        setImage(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async () => {
        if (!image) {
            alert("Please upload an image.");
            return;
        }

        const formData = new FormData();
        formData.append("file", image);
        formData.append("patientName", "John Doe");  // Replace with logged-in user name
        formData.append("email", "john@example.com");  // Replace with logged-in user email

        try {
            const response = await axios.post("http://localhost:5007/predict", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            setPrediction(`Predicted Class: ${response.data.prediction}`);
            if (response.data.report_url) {
                window.open(`http://localhost:5007${response.data.report_url}`, '_blank');
            }
        } catch (error) {
            console.error("Error uploading image:", error);
            alert("Error processing image. Try again.");
        }
    };

    return (
        <div style={{ textAlign: "center", padding: "20px" }}>
            <h2>Skin Disease Predictor</h2>
            <input type="file" accept="image/*" onChange={handleImageUpload} />
            <button onClick={handleSubmit} style={{ marginLeft: "10px" }}>Predict</button>

            {preview && (
                <div>
                    <h3>Uploaded Image</h3>
                    <img src={preview} alt="Uploaded" style={{ width: "300px", borderRadius: "10px" }} />
                </div>
            )}

            {prediction && <h3>{prediction}</h3>}
        </div>
    );
}

export default SkinDisease;
