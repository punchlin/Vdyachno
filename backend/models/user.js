const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  companyName: String,
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: String,
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["user", "sponsor", "volunteer", "admin"],
    default: "user"
  },
  avatar: {
  type: String,
  default: ""
  },
  deliveryAddress: {
  city: String,
  phone: String,
  name: String,
  branch: String
}
  
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model("User", userSchema);