# 🧠 DERMIFY: Skin Disease Detection & Diagnosis Platform

DERMIFY is a full-stack AI-powered web application designed for early detection and classification of skin diseases using deep learning. The platform enables users to either upload an image or capture one in real-time using their phone camera via an IP Webcam. It then predicts the skin condition using trained ML models and generates a personalized report containing disease details, precautions, and treatment suggestions.

---

## 📌 Features

- 🔍 Real-time and image-based **skin disease classification**
- 📷 **IP Webcam** integration to capture live images via smartphone
- 🧠 Dual deep learning model pipeline:
  - Vision Transformer (ViT)
  - EfficientNet-B2
- 📄 Automated medical **report generation** with predictions and treatment advice
- 📊 Model evaluation with **confusion matrix**, **ROC**, and **precision-recall curves**
- 🌐 Built using the **MERN stack** + **Flask ML API**

---

## 🧰 Tech Stack

### 🌐 Frontend:
- React.js
- CSS
- Axios (API Calls)

### ⚙️ Backend:
- Node.js (user auth, routes)
- Express.js
- MongoDB with Mongoose

### 🤖 Machine Learning:
- Python
- Flask (for serving the ML model)
- PyTorch (for training/inference)
- OpenCV (for image preprocessing)
- Scikit-learn (for evaluation & metrics)

---

## 🤖 Models Used

### 1. Vision Transformer (ViT)
- Trained on 23-class skin disease dataset
- Validation split done using **Stratified K-Fold**
- Handles global context well for skin textures

**Performance:**
| Metric              | Accuracy    |
|---------------------|-------------|
| Train Accuracy      | 97.55%      |
| Validation Accuracy | 64.23%      |
| Test Accuracy       | 65.59%      |

---

### 2. EfficientNet-B2
- Lightweight CNN architecture
- Pretrained on ImageNet, fine-tuned on skin disease dataset
- Validation split done using **Stratified Group K-Fold**
- Optimized for speed and resource usage

**Performance:**
| Metric              | Accuracy |
|---------------------|----------|
| Train Accuracy      | 94.56%   |
| Validation Accuracy | 60.78%   |
| Test Accuracy       | 63.85%   |

---

## 📂 Dataset

- **DermNet Kaggle Dataset**
- 23 types of skin diseases
- ~20,000 total images
- Dataset link: [DermNet on Kaggle](https://www.kaggle.com/datasets/shubhamgoel27/dermnet)

---

## 📤 Image Input Methods

- Upload an image manually from your device
- Capture a real-time image using your **smartphone camera via IP Webcam** (e.g., DroidCam or IP Webcam app)

---

## 📈 Model Evaluation

### 📊 Confusion Matrix

<img width="1241" height="1154" alt="confusion matrix VIT" src="https://github.com/user-attachments/assets/bcbe6e2e-1249-4d48-9854-3d121c831c8c" />


### 📉 ROC Curve

<img width="846" height="535" alt="ROC curve" src="https://github.com/user-attachments/assets/c936131c-1ac8-47bb-89c5-e525ad68bc8f" />


### 📈 Precision-Recall Curve

<img width="846" height="535" alt="recall" src="https://github.com/user-attachments/assets/0584e1f0-acdd-45b6-8412-fc0a5702058b" />


---

## 📄 Sample Report

> Click below to view/download a demo of the generated medical report:

📎 [View Sample Report (PDF)][Eczema_Photos_Report (2).pdf](https://github.com/user-attachments/files/21366197/Eczema_Photos_Report.2.pdf)


---

## 📽️ Live Demo

https://github.com/user-attachments/assets/f9488aa7-2bc7-4fc9-801b-b6f350ad721e



## 📄 License

This project is licensed under the MIT License.


