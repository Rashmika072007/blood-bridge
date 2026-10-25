
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Donor = require("../models/Donor");

const router = express.Router();

// Admin login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required.",
      });
    }

    const admin = await Admin.findOne({
      username: username.trim().toLowerCase(),
    });

    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password.",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Server authentication is not configured.",
      });
    }

    const token = jwt.sign(
      { adminId: admin._id },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.json({
      success: true,
      message: "Login successful.",
      token,
    });
  } catch (error) {
    console.error("Admin login error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to log in.",
    });
  }
});

// Protect admin-only routes
async function requireAdmin(req, res, next) {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Admin authentication required.",
      });
    }

    const token = header.slice(7);
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(payload.adminId);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Admin account not found.",
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired admin session.",
    });
  }
}

// List donors for the admin dashboard
router.get("/donors", requireAdmin, async (req, res) => {
  try {
    const donors = await Donor.find()
      .select("name bloodGroup city contact available")
      .sort({ createdAt: -1 });

    const total = await Donor.countDocuments();
    const available = await Donor.countDocuments({ available: true });

    return res.json({
      success: true,
      donors,
      total,
      available,
    });
  } catch (error) {
    console.error("Admin donor list error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to load donors.",
    });
  }
});


// Update a donor's availability
router.patch("/donors/:id/availability", requireAdmin, async (req, res) => {
  try {
    if (typeof req.body.available !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Availability must be true or false.",
      });
    }

    const donor = await Donor.findByIdAndUpdate(
      req.params.id,
      { available: req.body.available },
      { new: true, runValidators: true }
    );

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: "Donor not found.",
      });
    }

    return res.json({ success: true, donor });
  } catch (error) {
    console.error("Availability update error:", error.message);
    return res.status(400).json({
      success: false,
      message: "Unable to update donor availability.",
    });
  }
});

// Delete a donor
router.delete("/donors/:id", requireAdmin, async (req, res) => {
  try {
    const donor = await Donor.findByIdAndDelete(req.params.id);

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: "Donor not found.",
      });
    }

    return res.json({
      success: true,
      message: "Donor deleted successfully.",
    });
  } catch (error) {
    console.error("Donor deletion error:", error.message);
    return res.status(400).json({
      success: false,
      message: "Unable to delete donor.",
    });
  }
});

module.exports = router;
