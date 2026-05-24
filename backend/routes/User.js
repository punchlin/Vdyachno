const express = require("express");
const router = express.Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const upload = require("../middleware/upload"); 

// ================= AUTH =================
function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
}

// ================= ROUTES =================

// GET current user
router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
});

// PUT avatar
router.put("/avatar", auth, upload.single("avatar"), async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      avatar: `/uploads/${req.file.filename}`
    });

    res.json({ message: "Avatar updated" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Upload error" });
  }
});

module.exports = router;