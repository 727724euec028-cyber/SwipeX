const router = require("express").Router();
const Resume = require("../models/Resume");
const { protect } = require("../middleware/auth");
router.get("/me", protect, async (req, res, next) => {
  try {
    let resume = await Resume.findOne({ user: req.user._id });
    if (!resume) resume = await Resume.create({ user: req.user._id, fullName: req.user.name, email: req.user.email });
    res.json({ resume });
  } catch (err) { next(err); }
});
router.put("/me", protect, async (req, res, next) => {
  try {
    const allowed = ["fullName", "headline", "email", "phone", "summary", "education", "skills", "projects", "certifications"];
    const update = {};
    allowed.forEach((key) => { if (req.body[key] !== undefined) update[key] = String(req.body[key]).slice(0, 5000); });
    update.updatedAt = new Date();
    const resume = await Resume.findOneAndUpdate(
      { user: req.user._id },
      { $set: update, $setOnInsert: { user: req.user._id } },
      { new: true, upsert: true, runValidators: true }
    );
    res.json({ resume });
  } catch (err) { next(err); }
});
module.exports = router;
