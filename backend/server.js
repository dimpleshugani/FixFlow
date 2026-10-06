const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dns = require("dns");

require("dotenv").config();

// Use reliable public DNS servers for MongoDB SRV lookup
if (process.platform === "win32") {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
}

const requestRoutes = require("./routes/requestRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

const PORT = process.env.PORT || 5000;
let connectionPromise;

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

function connectDatabase() {
  if (mongoose.connection.readyState === 1) return Promise.resolve(mongoose.connection);
  if (mongoose.connection.readyState === 2 && connectionPromise) return connectionPromise;
  if (!process.env.MONGO_URI) return Promise.reject(new Error("MONGO_URI is required."));

  connectionPromise = mongoose.connect(process.env.MONGO_URI).catch((error) => {
    connectionPromise = undefined;
    throw error;
  });
  return connectionPromise;
}

if (require.main === module) {
  connectDatabase()
    .then(() => {
    console.log("✅ MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(
        `🚀 FixFlow server running on http://localhost:${PORT}`
      );
    });
    })
    .catch((error) => {
      console.error("❌ MongoDB connection failed:", error.message);
      process.exitCode = 1;
    });
}

module.exports = { app, connectDatabase };