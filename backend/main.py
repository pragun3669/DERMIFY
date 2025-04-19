import os
import torch
import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from torchvision import transforms
from PIL import Image
from transformers import ViTForImageClassification
from werkzeug.utils import secure_filename
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from pymongo import MongoClient

# Initialize Flask
app = Flask(__name__)
CORS(app)

# Upload & Static paths
app.config["UPLOAD_FOLDER"] = "uploads"
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

report_folder = os.path.join("static", "reports")
os.makedirs(report_folder, exist_ok=True)

# MongoDB Connection
client = MongoClient("mongodb://localhost:27017/")
db = client["dermify"]
reports_collection = db["reports"]

# Disease Labels
disease_labels = [
    "Acne and Rosacea Photos", "Actinic Keratosis Basal Cell Carcinoma and other Malignant Lesions",
    "Atopic Dermatitis Photos", "Bullous Disease Photos", "Cellulitis Impetigo and other Bacterial Infections",
    "Eczema Photos", "Exanthems and Drug Eruptions", "Hair Loss Photos Alopecia and other Hair Diseases",
    "Herpes HPV and other STDs Photos", "Light Diseases and Disorders of Pigmentation",
    "Lupus and other Connective Tissue diseases", "Melanoma Skin Cancer Nevi and Moles",
    "Nail Fungus and other Nail Disease", "Poison Ivy Photos and other Contact Dermatitis",
    "Psoriasis pictures Lichen Planus and related diseases",
    "Scabies Lyme Disease and other Infestations and Bites",
    "Seborrheic Keratoses and other Benign Tumors", "Systemic Disease",
    "Tinea Ringworm Candidiasis and other Fungal Infections", "Urticaria Hives",
    "Vascular Tumors", "Vasculitis Photos", "Warts Molluscum and other Viral Infections"
]

# Load Model
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model_path = os.path.join("Model", "best_vit1_model.pth")

model = ViTForImageClassification.from_pretrained(
    "google/vit-large-patch16-224",
    num_labels=len(disease_labels),
    ignore_mismatched_sizes=True
)
model.load_state_dict(torch.load(model_path, map_location=device))
model.to(device)
model.eval()

# Transform for images
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])
])

# Prediction Logic
def predict_image(image_path):
    image = Image.open(image_path).convert("RGB")
    input_tensor = transform(image).unsqueeze(0).to(device)
    output = model(input_tensor).logits
    predicted_class = output.argmax().item()
    return disease_labels[predicted_class]

# PDF Generator
def generate_pdf(patient_name, email, prediction, image_path, save_path):
    c = canvas.Canvas(save_path, pagesize=letter)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, 750, "DERMIFY - Skin Disease Report")

    c.setFont("Helvetica", 12)
    c.drawString(50, 720, f"Patient Name: {patient_name}")
    c.drawString(50, 700, f"Email: {email}")
    c.drawString(50, 680, f"Predicted Disease: {prediction}")
    c.drawString(50, 660, f"Date: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    c.drawImage(image_path, 50, 400, width=200, height=200)
    c.save()

# Flask Prediction Route
@app.route("/predict", methods=["POST"])
def predict():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    patient_name = request.form.get("patientName", "Unknown")
    email = request.form.get("email", "Unknown")

    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(file_path)

    predicted_disease = predict_image(file_path)

    report_name = f"{patient_name}_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}.pdf"
    report_path = os.path.join(report_folder, report_name)

    generate_pdf(patient_name, email, predicted_disease, file_path, report_path)

    # Save to MongoDB
    report_data = {
        "patientName": patient_name,
        "email": email,
        "prediction": predicted_disease,
        "reportPath": f"/static/reports/{report_name}",
        "createdAt": datetime.datetime.utcnow()
    }
    reports_collection.insert_one(report_data)

    return jsonify({
        "prediction": predicted_disease,
        "report_url": f"/static/reports/{report_name}"
    })

# Route to fetch all reports for a patient
@app.route("/reports", methods=["GET"])
def get_reports():
    email = request.args.get("email")
    reports = list(reports_collection.find({"email": email}).sort("createdAt", -1))
    for r in reports:
        r["_id"] = str(r["_id"])
    return jsonify(reports)

# Run Flask
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5007, debug=True)
