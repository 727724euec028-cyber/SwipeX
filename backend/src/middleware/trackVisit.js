const Visit = require("../models/Visit");
async function trackVisit(req, res) {
  try {
    const page = typeof req.body.page === "string" ? req.body.page.slice(0, 120) : "/";
    await Visit.create({ page });
    res.status(201).json({ tracked: true });
  } catch (_err) {
    res.status(500).json({ tracked: false });
  }
}
module.exports = { trackVisit };
