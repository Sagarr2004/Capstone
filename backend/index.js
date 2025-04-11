import express from "express";
// import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";

import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import companyRoute from "./routes/company.route.js";
import jobRoute from "./routes/job.route.js";
import applicationRoute from "./routes/application.route.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import { Notification } from "./models/notifications.models.js";
import { Alumni } from "./models/alumini.models.js";
import Comapny from "./routes/company.route.js";
import { Company } from "./models/company.model.js";
import {Expert} from "./models/UserProfile.js"

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);

// Inject io into requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/company", companyRoute);
app.use("/api/v1/job", jobRoute);
app.use("/api/v1/application", applicationRoute);
app.use("/api/v1/resume", resumeRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/v1/company", companyRoute);

app.post("/api/alumni/add", async (req, res) => {
  try {
    const { name, email, currentCompany, previousCompanies, linkedin, github } =
      req.body;
    if (!name || !email || !currentCompany || !previousCompanies.length) {
      return res.status(400).json({
        message: "All required fields must be filled",
        success: false,
      });
    }
    const newAlumni = new Alumni({
      name,
      email,
      currentCompany,
      previousCompanies,
      linkedin,
      github,
    });

    await newAlumni.save();
    res
      .status(201)
      .json({ message: "Alumni data stored successfully!", success: true });
  } catch (error) {
    console.error("Error adding alumni:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
});


app.post("/submit-profile", async (req, res) => {
  try {
    const { fullName, skills, degree, experience } = req.body;

    const newProfile = new Expert({
      fullName,
      skills: skills.split(',').map(skill => skill.trim()),
      degree,
      experience
    });

    await newProfile.save();
    res.status(201).json({ message: "Profile saved successfully!" });
  } catch (error) {
    console.error("Error saving profile:", error);
    res.status(500).json({ error: "Something went wrong!" });
  }
});


app.get("/get-expert-profiles", async (req, res) => {
  try {
    const experts = await Expert.find({}, "fullName skills"); // only send what’s needed
    console.log("Expert Data:",experts)
    const formattedExperts = experts.map(expert => ({
      name: expert.fullName,
      skills: expert.skills,
    }));

    

    res.status(200).json(formattedExperts);
  } catch (err) {
    console.error("Error fetching expert profiles:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});



app.get("/api/alumni/search", async (req, res) => {
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
app.delete("/api/v1/company/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Use findByIdAndDelete to delete the company by its ID
    const company = await Company.findOneAndDelete({ _id: id });

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.status(200).json({ message: "Company deleted successfully" });
  } catch (error) {
    console.error("Error deleting company:", error);
    res
      .status(500)
      .json({ message: "An error occurred while deleting the company" });
  }
});

app.get("/api/alumni/all", async (req, res) => {
  try {
    const alumni = await Alumni.find().sort({ createdAt: -1 });
    res.status(200).json({ alumni, success: true });
  } catch (error) {
    console.error("Error fetching alumni data:", error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
});

// Delete all notifications
app.delete("/api/v1/job/deleteNotifications", async (req, res) => {
  try {
    await Notification.deleteMany({});
    res.json({ message: "✅ Notifications deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: error.message || "❌ Error deleting notifications" });
  }
});

// Global Error Handling
app.use((err, req, res, next) => {
  console.error("❌ Unhandled Error:", err);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

// Start server after DB connection
const PORT = process.env.PORT || 8000;
const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => console.log(`🚀 Server running at port ${PORT}`));
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
};

startServer();
