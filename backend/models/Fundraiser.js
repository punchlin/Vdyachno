const mongoose = require("mongoose");

const fundraiserSchema = new mongoose.Schema({
  title: String,
  shortDescription: String,
  goal: Number,
  raised: {
  type: Number,
  default: 0
  },
  link: String,
  category: String,
  image: String,
  status: {
    type: String,
    default: "pending"
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true });

module.exports = mongoose.model("Fundraiser", fundraiserSchema);