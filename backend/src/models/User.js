const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ["student", "admin"], default: "student" },
  headline: { type: String, default: "", maxlength: 140 },
  skills: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model("User", userSchema);
