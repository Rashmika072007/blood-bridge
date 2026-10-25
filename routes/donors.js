const express = require("express");
const Donor = require("../models/Donor");

const router = express.Router();

const validBloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

// Search available donors
router.get("/", async (req, res) => {
  try {
    const { bloodGroup, city } = req.query;
    const filter = { available: true };

    if (bloodGroup && bloodGroup !== "all") {
      if (!validBloodGroups.includes(bloodGroup)) {
        return res.status(400).json({
          success: false,
          message: "Invalid blood group.",
        });
      }

      filter.bloodGroup = bloodGroup;
    }

    if (city?.trim()) {
      // Match the city name even when a longer location is entered.
      const cityName = city.trim().split(",")[0].trim();
      filter.city = {
        $regex: cityName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        $options: "i",
      };
    }

    const donors = await Donor.find(filter)
      .select("name bloodGroup city available")
      .limit(50);

    res.json({
      success: true,
      count: donors.length,
      donors,
    });
  } catch (error) {
    console.error("Donor search error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to search donors.",
    });
  }
});

// Register a donor
router.post("/", async (req, res) => {
  try {
    const { name, bloodGroup, city, contact, consent } = req.body;

    if (!consent) {
      return res.status(400).json({
        success: false,
        message: "Please provide consent before registering.",
      });
    }

    if (
      typeof name !== "string" ||
      typeof city !== "string" ||
      typeof contact !== "string" ||
      !name.trim() ||
      !city.trim() ||
      !contact.trim() ||
      name.trim().length > 100 ||
      city.trim().length > 100 ||
      contact.trim().length > 30 ||
      !validBloodGroups.includes(bloodGroup)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid name, blood group, city, and contact.",
      });
    }

    const donor = await Donor.create({
      name: name.trim(),
      bloodGroup,
      city: city.trim(),
      contact: contact.trim(),
      available: true,
    });

    res.status(201).json({
      success: true,
      message: "Donor registered successfully.",
      donor: {
        _id: donor._id,
        name: donor.name,
        bloodGroup: donor.bloodGroup,
        city: donor.city,
        available: donor.available,
      },
    });
  } catch (error) {
    console.error("Donor registration error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to register donor.",
    });
  }
});

module.exports = router;
