require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const fundraiserRoutes = require("./routes/fundraisers");
const giftRoutes = require("./routes/gifts");

const app = express();

app.use(cors());
app.use(express.json());

// API маршрути
app.use("/api/fundraisers", fundraiserRoutes);
app.use("/api/gifts", giftRoutes);
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/User"));
app.use("/api/donations", require("./routes/donations"));

// Статика
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/images", express.static(path.join(__dirname, "../images")));

// Підключення до бази
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

const path = require("path");

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../index.html"));
});

// Статика HTML 
app.use(express.static(path.join(__dirname, "../")));

app.listen(5000, () => console.log("Server running on port 5000"));