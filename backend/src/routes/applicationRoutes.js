const router = require("express").Router();
const Application = require("../models/Application");
const Job = require("../models/Job");
const { protect } = require("../middleware/auth");
router.post("/:jobId", protect, async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: "Job not found." });
    const application = await Application.create({ user: req.user._id, job: job._id });
    res.status(201).json({ application });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: "You have already applied to this job." });
    next(err);
  }
});
router.get("/me", protect, async (req, res, next) => {
  try {
    const applications = await Application.find({ user: req.user._id }).populate("job").sort({ createdAt: -1 });
    res.json({ applications });
  } catch (err) { next(err); }
});
module.exports = router;
