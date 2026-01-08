import os
import torch
import datetime
import torch.nn.functional as F
from flask import Flask, request, jsonify
from flask_cors import CORS
from torchvision import transforms
from PIL import Image
from transformers import ViTForImageClassification
from huggingface_hub import hf_hub_download
from werkzeug.utils import secure_filename
from pymongo import MongoClient

# =====================
# Flask App
# =====================
app = Flask(__name__)
CORS(app)

# Upload folder
app.config["UPLOAD_FOLDER"] = "uploads"
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

# =====================
# MongoDB (Atlas via ENV)
# =====================
MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["skin-disease-db"]
reports_collection = db["reports"]

# =====================
# Disease Labels
# =====================
disease_labels = [
    "Acne and Rosacea Photos",
    "Actinic Keratosis Basal Cell Carcinoma and other Malignant Lesions",
    "Atopic Dermatitis Photos",
    "Bullous Disease Photos",
    "Cellulitis Impetigo and other Bacterial Infections",
    "Eczema Photos",
    "Exanthems and Drug Eruptions",
    "Hair Loss Photos Alopecia and other Hair Diseases",
    "Herpes HPV and other STDs Photos",
    "Light Diseases and Disorders of Pigmentation",
    "Lupus and other Connective Tissue diseases",
    "Melanoma Skin Cancer Nevi and Moles",
    "Nail Fungus and other Nail Disease",
    "Poison Ivy Photos and other Contact Dermatitis",
    "Psoriasis pictures Lichen Planus and related diseases",
    "Scabies Lyme Disease and other Infestations and Bites",
    "Seborrheic Keratoses and other Benign Tumors",
    "Systemic Disease",
    "Tinea Ringworm Candidiasis and other Fungal Infections",
    "Urticaria Hives",
    "Vascular Tumors",
    "Vasculitis Photos",
    "Warts Molluscum and other Viral Infections"
]

# =====================
# Load Model from Hugging Face (.pth correctly)
# =====================
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Download weights
model_path = hf_hub_download(
    repo_id="pragun3669/dermify-vit",
    filename="best_vit1_model.pth"
)

# Load base architecture
model = ViTForImageClassification.from_pretrained(
    "google/vit-large-patch16-224",
    num_labels=len(disease_labels),
    ignore_mismatched_sizes=True
)

# Load trained weights
state_dict = torch.load(model_path, map_location=device)
model.load_state_dict(state_dict)

model.to(device)
model.eval()

# =====================
# Image Transform
# =====================
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])
])

# =====================
# Prediction Function
# =====================
def predict_image(image_path):
    image = Image.open(image_path).convert("RGB")
    input_tensor = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        output = model(input_tensor).logits
        probs = F.softmax(output, dim=1)

    predicted_class = output.argmax().item()
    confidence = probs[0][predicted_class].item()

    return disease_labels[predicted_class], confidence

# =====================
# Routes
# =====================
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

    predicted_disease, confidence = predict_image(file_path)

    report_data = {
        "patientName": patient_name,
        "email": email,
        "prediction": predicted_disease,
        "confidence": round(confidence * 100, 2),
        "imagePath": file_path,
        "createdAt": datetime.datetime.utcnow()
    }

    reports_collection.insert_one(report_data)

    return jsonify({
        "prediction": predicted_disease,
        "confidence": round(confidence * 100, 2)
    })

@app.route("/reports", methods=["GET"])
def get_reports():
    email = request.args.get("email")
    reports = list(reports_collection.find({"email": email}).sort("createdAt", -1))
    for r in reports:
        r["_id"] = str(r["_id"])
    return jsonify(reports)

# =====================
# Run App (Render-safe)
# =====================
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
