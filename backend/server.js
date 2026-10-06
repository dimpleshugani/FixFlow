const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dns = require("dns");

require("dotenv").config();

// Use reliable public DNS servers for MongoDB SRV lookup
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const requestRoutes = require("./routes/requestRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Home route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "FixFlow Backend API is running 🚀",
  });
});

// Request routes
app.use("/api/requests", requestRoutes);
app.use("/api/auth", authRoutes);

app.use((error, req, res, next) => {
  console.error("API error:", error.message);
  res.status(500).json({ message: "Something went wrong. Please try again." });
});

// Check MongoDB URI
console.log("MongoDB URI loaded:", !!process.env.MONGO_URI);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(
        `🚀 FixFlow server running on http://localhost:${PORT}`
      );
    });
  })
  .catch((error) => {
    console.error("❌ MongoDB connection failed");
    console.error(error.message);
  });