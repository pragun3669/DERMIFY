const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const diseaseRoutes = require("./routes/disease");
const cors = require("cors");
const path = require("path");
const session = require("express-session");
require("dotenv").config();

const app = express();

// ✅ CORS (deployment-safe)
app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json());

// ✅ Sessions
app.use(session({
  name: "dermify.sid",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
  }
}));

connectDB();

app.use("/images", express.static(path.join(__dirname, "public/images")));
app.use("/api", authRoutes);
app.use("/api", diseaseRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
