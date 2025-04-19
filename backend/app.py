from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd

# ✅ Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing

# ✅ Load the trained model and encoders
model = joblib.load("Model/skin_disease_model.pkl")
disease_encoder = joblib.load("Model/disease_encoder.pkl")
body_part_encoder = joblib.load("Model/body_part_encoder.pkl")

# ✅ Define symptoms and body parts based on your list
SYMPTOMS = [
    "Redness", "Itching", "Swelling", "Rash", "Blisters", "Pain", "Peeling Skin", 
    "Scaling", "Burning Sensation", "Pustules", "White Patches", "Loss of Skin Pigment"
]
BODY_PARTS = [
    "Hands", "Neck", "Arms", "Face", "Legs", "Knees", "Scalp", "Elbows", "Lower Back",
    "Shoulders", "Back", "Chest", "Cheeks", "Nose", "Forehead", "Armpits", "Feet", "Groin",
    "Anywhere on body", "Torso"
]

@app.route("/")
def home():
    return jsonify({"message": "Skin Disease Prediction API is Running!"})

# ✅ Prediction endpoint
@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json  # Get JSON data

        # ✅ Validate request data
        if "body_part" not in data or "symptoms" not in data:
            return jsonify({"error": "Missing 'body_part' or 'symptoms' field"}), 400

        body_part = data["body_part"]
        symptoms = data["symptoms"]  # Should be a list of Yes/No values

        # ✅ Validate symptoms length
        if len(symptoms) != len(SYMPTOMS):
            return jsonify({"error": f"Expected {len(SYMPTOMS)} symptoms"}), 400

        # ✅ Convert Yes/No to 1/0
        symptom_values = [1 if sym.lower() == "yes" else 0 for sym in symptoms]

        # ✅ Encode body part
        body_part_encoded = body_part_encoder.transform([body_part])[0]

        # ✅ Create input DataFrame
        input_data = pd.DataFrame([symptom_values + [body_part_encoded]], columns=SYMPTOMS + ["Body_Part"])

        # ✅ Make prediction
        prediction = model.predict(input_data)[0]

        # ✅ Decode disease name
        disease_name = disease_encoder.inverse_transform([prediction])[0]

        return jsonify({"predicted_disease": disease_name})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5005, debug=True)  # Changed port to avoid conflicts
