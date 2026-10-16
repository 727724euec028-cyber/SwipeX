const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

function makeToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
}
function safeUser(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role, headline: user.headline, skills: user.skills };
}
router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Name, email and password are required." });
    if (String(password).length < 8) return res.status(400).json({ message: "Password must be at least 8 characters." });
    const normalizedEmail = String(email).trim().toLowerCase();
    if (await User.findOne({ email: normalizedEmail })) return res.status(409).json({ message: "Email already registered." });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name: String(name).trim(), email: normalizedEmail, passwordHash });
    res.status(201).json({ token: makeToken(user), user: safeUser(user) });
  } catch (err) { next(err); }
});
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: String(email || "").trim().toLowerCase() }).select("+passwordHash");
  if (!user || !(await bcrypt.compare(password || "", user.passwordHash))) {
    return res.status(401).json({ message: "Invalid email or password." });
  }
  res.json({ token: makeToken(user), user: safeUser(user) });
});
router.get("/me", protect, (req, res) => res.json({ user: safeUser(req.user) }));
router.put("/me", protect, async (req, res, next) => {
  try {
    const { name, headline, skills } = req.body;
    if (name !== undefined) req.user.name = String(name).trim().slice(0, 80);
    if (headline !== undefined) req.user.headline = String(headline).slice(0, 140);
    if (skills !== undefined) req.user.skills = Array.isArray(skills) ? skills.map(String).slice(0, 30) : [];
    await req.user.save();
    res.json({ user: safeUser(req.user) });
  } catch (err) { next(err); }
});
module.exports = router;
