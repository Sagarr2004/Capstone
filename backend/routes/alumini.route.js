import express from "express";
import { Alumni } from "../models/alumini.models.js"; // ✅ Fixed import

const router = express.Router();

router.post("/add", async (req, res) => {
  try {
    const { name, email, currentCompany, previousCompanies, linkedin, github } = req.body;
    if (!name || !email || !currentCompany || !previousCompanies.length) {
      return res.status(400).json({ message: "All required fields must be filled", success: false });
    }
    const newAlumni = new Alumni({
      name,
      email,
      currentCompany,
      previousCompanies,
      linkedin,
      github
    });

    await newAlumni.save();
    res.status(201).json({ message: "Alumni data stored successfully!", success: true });
  } catch (error) {
    console.error("Error adding alumni:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
});

router.get("/search", async (req, res) => {
  try {
    const { currentCompany, previousCompanies } = req.query;
    let query = {};

    if (currentCompany) {
      query.currentCompany = { $regex: new RegExp(currentCompany, "i") };
    }

    if (previousCompanies) {
      query.previousCompanies = { $regex: new RegExp(previousCompanies, "i") };
    }

    const alumni = await Alumni.find(query);
    res.json({ alumni });
  } catch (error) {
    console.error("Error searching alumni:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/all", async (req, res) => {
  try {
    const alumni = await Alumni.find().sort({ createdAt: -1 });
    res.status(200).json({ alumni, success: true });
  } catch (error) {
    console.error("Error fetching alumni data:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
});

export default router;