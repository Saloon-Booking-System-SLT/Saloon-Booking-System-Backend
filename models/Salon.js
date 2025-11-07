const mongoose = require("mongoose");

const salonSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // 🔐 Added password
  phone: String,
  location: String,
  workingHours: String,
  services: [String],
  salonType: String,
  image: String,
  coordinates: {
    lat: Number,
    lng: Number,
  },
  // Firebase Authentication Support
  isGoogleAuth: { type: Boolean, default: false },
  isPhoneAuth: { type: Boolean, default: false },
  firebaseUID: { type: String, default: null },
  
  // Additional fields for better functionality
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  lastLogin: { type: Date, default: null }
}, {
  timestamps: true
});

module.exports = mongoose.model("Salon", salonSchema);
