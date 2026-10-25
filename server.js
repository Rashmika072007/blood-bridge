
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Import donor routes
const donorRoutes = require("./routes/donors");
const adminRoutes = require("./routes/admin");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    message: "Blood Bridge server is running!",
  });
});

// Donor API routes
app.use("/api/donors", donorRoutes);
app.use("/api/admin", adminRoutes);

// Start server after connecting to MongoDB
async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from .env");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully!");

    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
      console.log(`Blood Bridge running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Startup error name:", error.name);
    console.error("Startup error message:", error.message);
    console.error("Full error:", error);
    process.exit(1);
  }
}

startServer();
