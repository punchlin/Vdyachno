const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  fundraiser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Fundraiser"
  },

  amount: Number,

  paymentMethod: {
    type: String,
    default: "Visa"
  },

  gift: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Gift",
    default: null
  },

  giftStatus: {
    type: String,
    default: "В обробці"
    },
  
  delivery: {
  city: String,
  phone: String,
  name: String,
  branch: String
}

}, { timestamps: true });

module.exports = mongoose.model("Donation", donationSchema);