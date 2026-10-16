const mongoose = require("mongoose");
const applicationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
  status: { type: String, enum: ["Submitted", "Reviewing", "Shortlisted", "Rejected"], default: "Submitted" },
  createdAt: { type: Date, default: Date.now }
});
applicationSchema.index({ user: 1, job: 1 }, { unique: true });
module.exports = mongoose.model("Application", applicationSchema);
