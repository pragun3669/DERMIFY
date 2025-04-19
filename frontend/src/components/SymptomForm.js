import React, { useState } from "react";
import axios from "axios";
import "../styles/SymptomForm.css";

const SymptomForm = () => {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [selectedBodyPart, setSelectedBodyPart] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [diseaseInfo, setDiseaseInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const symptoms = [
    "Redness", "Itching", "Swelling", "Rash", "Blisters", "Pain", "Peeling Skin", 
    "Scaling", "Burning Sensation", "Pustules", "White Patches", "Loss of Skin Pigment"
  ];

  const bodyParts = [
    "Hands", "Neck", "Arms", "Face", "Legs", "Knees", "Scalp", "Elbows", "Lower Back",
    "Shoulders", "Back", "Chest", "Cheeks", "Nose", "Forehead", "Armpits", "Feet", "Groin",
    "Anywhere on body", "Torso"
  ];

  const handleCheckboxChange = (symptom) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setPrediction(null);
    setDiseaseInfo(null);
    setError(null);

    if (!selectedBodyPart || selectedSymptoms.length === 0) {
      setError("Please select at least one symptom and a body part.");
      return;
    }

    setLoading(true);

    const formattedSymptoms = symptoms.map(symptom => selectedSymptoms.includes(symptom) ? "Yes" : "No");

    const requestData = {
      body_part: selectedBodyPart,
      symptoms: formattedSymptoms
    };

    console.log("Sending Data:", requestData);

    try {
      const response = await axios.post("http://localhost:5005/predict", requestData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Prediction Response:", response.data);
      setPrediction(response.data);

      // Fetch disease info
      const diseaseInfoResponse = await axios.get(`http://localhost:5000/api/disease-info/${response.data.predicted_disease}`);
      setDiseaseInfo(diseaseInfoResponse.data);

    } catch (error) {
      console.error("Error fetching prediction or disease info:", error);
      setError("Failed to get prediction or disease information. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    if (!prediction) return;

    setPdfLoading(true);

    try {
      const username = localStorage.getItem("user"); // Fetch username from localStorage

      const pdfResponse = await axios.post(
        "http://localhost:5000/api/generate-pdf",
        { 
          username, // Include the username
          body_part: selectedBodyPart,
          symptoms: selectedSymptoms,
          predicted_disease: prediction.predicted_disease
        }, 
        { responseType: "blob" }
      );

      const blob = new Blob([pdfResponse.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Disease_Report.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setError("Failed to generate PDF. Please try again.");
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="symptom-form">
      <h2>Skin Disease Prediction</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="body-part-selection">
          <label>Select Affected Body Part:</label>
          <select value={selectedBodyPart} onChange={(e) => setSelectedBodyPart(e.target.value)} required>
            <option value="">-- Select --</option>
            {bodyParts.map((part, index) => (
              <option key={index} value={part}>{part}</option>
            ))}
          </select>
        </div>

        <div className="symptom-list">
          <p>Select Symptoms:</p>
          {symptoms.map((symptom, index) => (
            <label key={index} className="symptom-checkbox">
              <input
                type="checkbox"
                value={symptom}
                checked={selectedSymptoms.includes(symptom)}
                onChange={() => handleCheckboxChange(symptom)}
              />
              {symptom}
            </label>
          ))}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Predicting..." : "Predict Disease"}
        </button>
      </form>

      {prediction && (
        <div className="prediction-result">
          <h3>Prediction Result</h3>
          <p><strong>Body Part:</strong> {selectedBodyPart}</p>
          <p><strong>Symptoms:</strong> {selectedSymptoms.join(", ")}</p>
          <p><strong>Condition:</strong> {prediction.predicted_disease}</p>

          {diseaseInfo && (
            <div className="disease-info">
              <h4>About {prediction.predicted_disease}</h4>
              <p><strong>Description:</strong> {diseaseInfo.description}</p>

              {/* Render disease images */}
              {diseaseInfo && diseaseInfo.images && diseaseInfo.images.length > 0 && (
  <div className="disease-images">
    <h4>Images of {prediction.predicted_disease}</h4>
    {diseaseInfo.images.map((image, index) => (
      <img
        key={index}
        src={`${image}`} // The correct path to your images
        alt={`Image ${index + 1}`} // Remove redundant words like "image"
        className="disease-image"
      />
    ))}
  </div>
)}
            </div>
          )}

          <button onClick={handleGeneratePDF} disabled={pdfLoading}>
            {pdfLoading ? "Generating PDF..." : "Download Report"}
          </button>
        </div>
      )}
    </div>
  );
};

export default SymptomForm;
