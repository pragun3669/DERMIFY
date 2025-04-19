const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const diseaseRoutes = require("./routes/disease");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const session = require("express-session"); // ✅ Added for session support
require("dotenv").config();
const reportRoutes = require("./routes/report");


const app = express();

// ✅ Allow credentials for session-based authentication
app.use(cors({
  origin: "http://localhost:3000", // Your frontend URL
  credentials: true, // Allow cookies
}));

app.use(express.json());

// ✅ Session middleware (Only needed if using sessions)
app.use(session({
  secret: process.env.SESSION_SECRET || "your_secret_key", 
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Change to `true` if using HTTPS
}));

connectDB();
app.use("/images", express.static(path.join(__dirname, "public/images")));
app.use("/api", authRoutes);
app.use("/api", diseaseRoutes);
app.use("/reports", reportRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
