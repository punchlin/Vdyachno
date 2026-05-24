const express = require("express");
const router = express.Router();
const Gift = require("../models/Gift");
const upload = require("../middleware/upload");
const jwt = require("jsonwebtoken");

// ===== AUTH middleware =====
function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}

// ===== CREATE GIFT =====
router.post("/", auth, upload.single("image"), async (req, res) => {
  try {
    const gift = new Gift({
      title: req.body.title,
      description: req.body.description,
      value: req.body.value,
      category: req.body.category,
      image: `/uploads/${req.file.filename}`,
      createdBy: req.user.id
    });

    await gift.save();
    res.json(gift);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});
// ===== GET PENDING GIFTS =====
router.get("/pending", async (req, res) => {
  const gifts = await Gift.find({ status: "pending" })
    .populate("createdBy");

  res.json(gifts);
});

// ===== APPROVE GIFT =====
router.put("/:id/approve", async (req, res) => {
  await Gift.findByIdAndUpdate(req.params.id, {
    status: "approved"
  });

  res.json({ message: "Approved" });
});

router.get("/approved", async (req, res) => {

  const gifts = await Gift.find({
    status: "approved",
    $or: [
  { isOrdered: false },
  { isOrdered: { $exists: false } }
]
  })
  .populate("createdBy");

  res.json(gifts);
});

// ===== REJECT GIFT =====
router.put("/:id/reject", async (req, res) => {
  await Gift.findByIdAndUpdate(req.params.id, {
    status: "rejected"
  });

  res.json({ message: "Rejected" });
});

// ===== GET MY GIFTS =====
router.get("/my", auth, async (req, res) => {
  try {
    const gifts = await Gift.find({ createdBy: req.user.id });
    res.json(gifts);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;