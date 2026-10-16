const router = require("express").Router();
const User = require("../models/User");
const Job = require("../models/Job");
const Resume = require("../models/Resume");
const Application = require("../models/Application");
const Visit = require("../models/Visit");
const { protect, adminOnly } = require("../middleware/auth");

router.use(protect, adminOnly);
router.get("/stats", async (_req, res, next) => {
  try {
    const [users, jobs, applications, resumes, visits, recentUsers] = await Promise.all([
      User.countDocuments({ role: "student" }),
      Job.countDocuments(),
      Application.countDocuments(),
      Resume.countDocuments(),
      Visit.countDocuments(),
      User.find({ role: "student" }).select("name email headline createdAt").sort({ createdAt: -1 }).limit(8)
    ]);
    res.json({ stats: { users, jobs, applications, resumes, visits }, recentUsers });
  } catch (err) { next(err); }
});
router.get("/users", async (_req, res, next) => {
  try {
    const users = await User.find({ role: "student" }).select("name email headline skills createdAt").sort({ createdAt: -1 }).limit(200);
    res.json({ users });
  } catch (err) { next(err); }
});
router.get("/resumes", async (_req, res, next) => {
  try {
    const resumes = await Resume.find().populate("user", "name email").sort({ updatedAt: -1 }).limit(200);
    res.json({ resumes });
  } catch (err) { next(err); }
});
router.get("/applications", async (_req, res, next) => {
  try {
    const applications = await Application.find().populate("user", "name email").populate("job", "title company").sort({ createdAt: -1 }).limit(200);
    res.json({ applications });
  } catch (err) { next(err); }
});
module.exports = router;
