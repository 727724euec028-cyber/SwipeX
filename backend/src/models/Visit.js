const mongoose = require("mongoose");
const visitSchema = new mongoose.Schema({
  page: { type: String, default: "/" },
  createdAt: { type: Date, default: Date.now, expires: "180d" }
});
module.exports = mongoose.model("Visit", visitSchema);
