const router = require("express").Router();
const Job = require("../models/Job");
const { protect, adminOnly } = require("../middleware/auth");
router.get("/", async (req, res, next) => {
  try {
    const q = String(req.query.q || "").trim();

    const filter = q
      ? {
          $or: [
            { title: { $regex: q, $options: "i" } },
            { company: { $regex: q, $options: "i" } },
            { location: { $regex: q, $options: "i" } }
          ]
        }
      : {};

    const jobs = await Job.find(filter)
      .sort({ createdAt: -1 })
      .limit(100);

    console.log("Database:", Job.db.name);
    console.log("Collection:", Job.collection.name);
    console.log("Jobs found:", jobs.length);

    res.json({ jobs });
  } catch (err) {
    next(err);
  }
});
router.post("/", protect, adminOnly, async (req, res, next) => {
  try {
    const { title, company, location, type, mode, description, skills } = req.body;
    if (!title || !company || !description) return res.status(400).json({ message: "Title, company and description are required." });
    const job = await Job.create({ title, company, location, type, mode, description, skills: Array.isArray(skills) ? skills : [] });
    res.status(201).json({ job });
  } catch (err) { next(err); }
});
router.delete("/:id", protect, adminOnly, async (req, res, next) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found." });
    res.json({ message: "Job deleted." });
  } catch (err) { next(err); }
});
module.exports = router;
