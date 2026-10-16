const mongoose = require("mongoose");
const resumeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  fullName: { type: String, default: "" },
  headline: { type: String, default: "" },
  email: { type: String, default: "" },
  phone: { type: String, default: "" },
  summary: { type: String, default: "" },
  education: { type: String, default: "" },
  skills: { type: String, default: "" },
  projects: { type: String, default: "" },
  certifications: { type: String, default: "" },
  updatedAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model("Resume", resumeSchema);
