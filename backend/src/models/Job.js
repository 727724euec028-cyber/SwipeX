const mongoose = require("mongoose");
const jobSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  company: { type: String, required: true, trim: true },
  location: { type: String, default: "Remote" },
  type: { type: String, enum: ["Internship", "Full-time", "Part-time"], default: "Internship" },
  mode: { type: String, enum: ["Remote", "Hybrid", "On-site"], default: "Remote" },
  description: { type: String, required: true },
  skills: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model("Job", jobSchema);
