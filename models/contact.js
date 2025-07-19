const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  countryName: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
  },
  description: {
    type: String,
    default: "",
  },
  services: {
    type: [String], 
    default: [],
  },
  fileUrl: {
    type: String, 
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model("Contact", contactSchema);
