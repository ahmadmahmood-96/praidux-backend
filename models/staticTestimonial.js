const mongoose = require("mongoose");

const staticTestimonialSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      required: true,
      trim: true,
    },
    designation: {
      type: String,
      required: true,
      trim: true,
    },
    projectName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    projectLogo: {
      type: String,
      trim: true, // optional now
    },
    clientImage: {
      type: String,
      trim: true,
    },
    listOnWebsite: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("StaticTestimonial", staticTestimonialSchema);
