const express = require("express");
const router = express.Router();
const Fundraiser = require("../models/Fundraiser");
const multer = require("multer");
const path = require("path");
const jwt = require("jsonwebtoken");
const Donation = require("../models/Donation");

/* -------- AUTH -------- */

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

/* -------- MULTER -------- */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

/* -------- ROUTES -------- */

// Створення збору
router.post("/", auth, upload.single("image"), async (req, res) => {

  try {

    const { title, shortDescription, goal, link, category } = req.body;

    const fundraiser = new Fundraiser({
      title,
      shortDescription,
      goal,
      link,
      category,
      image: req.file ? "/uploads/" + req.file.filename : "",
      createdBy: req.user.id
    });

    await fundraiser.save();

    res.json({ message: "Fundraiser submitted for moderation" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }

});

// Pending
router.get("/pending", async (req, res) => {
  const fundraisers = await Fundraiser
    .find({ status: "pending" })
    .populate("createdBy");
  res.json(fundraisers);
});

// Approve
router.put("/:id/approve", async (req, res) => {
  await Fundraiser.findByIdAndUpdate(req.params.id, { status: "approved" });
  res.json({ message: "Approved" });
});

// Reject
router.put("/:id/reject", async (req, res) => {
  await Fundraiser.findByIdAndUpdate(req.params.id, { status: "rejected" });
  res.json({ message: "Rejected" });
});

// Approved list
router.get("/approved", async (req, res) => {
  const fundraisers = await Fundraiser
    .find({ status: "approved" })
    .populate("createdBy");

  res.json(fundraisers);
});
router.delete("/:id", async (req, res) => {
  await Fundraiser.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

// ===== GET MY FUNDRAISERS =====
router.get("/my", auth, async (req, res) => {
  try {
    const fundraisers = await Fundraiser.find({ createdBy: req.user.id });
    res.json(fundraisers);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});
// ===== DELETE FUNDRAISER =====
router.delete("/:id", auth, async (req, res) => {
  try {
    const fundraiser = await Fundraiser.findById(req.params.id);

    if (!fundraiser) {
      return res.status(404).json({ message: "Not found" });
    }

    // перевірка що це його збір
    if (fundraiser.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await Fundraiser.findByIdAndDelete(req.params.id);

    res.json({ message: "Deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ===== DONATE =====
router.put("/:id/donate", auth, async (req, res) => {

  try {

    const { amount } = req.body;

    const fundraiser = await Fundraiser.findById(req.params.id);

    if (!fundraiser) {
      return res.status(404).json({ message: "Not found" });
    }

    fundraiser.raised += Number(amount);
    await fundraiser.save();

    // 🔥 Зберігаємо донат
    const donation = await Donation.create({
    user: req.user.id,
    fundraiser: fundraiser._id,
    amount: Number(amount),
    paymentMethod: "Visa"
  });

  res.json({ message: "Donation successful", donationId: donation._id });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Donation error" });
  }
});
module.exports = router;