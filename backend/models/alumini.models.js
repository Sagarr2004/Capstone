import mongoose from "mongoose";

const alumniSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  currentCompany: { type: String, required: true },
  previousCompanies: { type: [String], required: true },
  linkedin: { type: String },
  github: { type: String },
}, { timestamps: true });

export const Alumni = mongoose.model("Alumni", alumniSchema);