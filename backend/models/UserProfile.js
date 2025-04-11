import mongoose from "mongoose";

const ExpertProfile = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  skills: {
    type: [String],
    required: true,
  },
  degree: {
    type: String,
    required: true,
  },
  experience: {
    type: Number,
    required: true,
    min: 0,
  },
});

export const Expert = mongoose.model("Expert", ExpertProfile);
