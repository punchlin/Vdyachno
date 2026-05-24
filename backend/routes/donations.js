const express = require("express");
const router = express.Router();
const Donation = require("../models/Donation");
const Gift = require("../models/Gift");
const User = require("../models/user");
const jwt = require("jsonwebtoken");


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

router.get("/my", auth, async (req, res) => {

  const donations = await Donation.find({ user: req.user.id })
    .populate("fundraiser")
    .populate("gift")
    .sort({ createdAt: -1 });

  res.json(donations);
});

//
// ================= SELECT GIFT =================
//
router.put("/:id/select-gift", auth, async (req, res) => {
  try {
    const { giftId, city, phone, name, branch } = req.body;

    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    // 1️⃣ Прив'язуємо подарунок
    donation.gift = giftId;
    donation.giftStatus = "ordered";

    donation.delivery = {
      city,
      phone,
      name,
      branch
    };

    await donation.save();

    // 2️⃣ Оновлюємо адресу користувача
    await User.findByIdAndUpdate(req.user.id, {
      deliveryAddress: {
        city,
        phone,
        name,
        branch
      }
    });

    // 3️⃣ Міняємо статус подарунка (НЕ видаляємо!)
    await Gift.findByIdAndUpdate(giftId, {
      isOrdered: true
    });

    res.json({ message: "Gift selected successfully" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error selecting gift" });
  }
});


//
// ================= ORDERS FOR SPONSOR =================
//
router.get("/sponsor-orders", auth, async (req, res) => {
  try {

    const sponsorId = req.user.id;

    const donations = await Donation.find({ gift: { $ne: null } })
      .populate({
        path: "gift",
        populate: { path: "createdBy" }
      })
      .populate("user")
      .sort({ createdAt: -1 });

    // Фільтруємо тільки замовлення цього спонсора
    const filtered = donations.filter(d =>
      d.gift &&
      d.gift.createdBy &&
      d.gift.createdBy._id.toString() === sponsorId
    );

    res.json(filtered);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error loading sponsor orders" });
  }
});

//
// ================= DONATIONS FOR USER =================
//
router.get("/my", auth, async (req, res) => {
  const donations = await Donation.find({ user: req.user.id })
    .populate("gift")
    .sort({ createdAt: -1 });

  res.json(donations);
});

module.exports = router;