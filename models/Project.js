const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    mainCategory: {
      type: String,
      required: true,
      trim: true,
    },
    client: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: String,
      required: true,
      trim: true,
    },
    downloads: {
      type: String, 
      required: true,
      trim: true,
    },
    images: {
      type: [String],
      validate: [(val) => val.length > 0, "At least one image is required"],
    },
    video: {
      type: String,
      trim: true,
    },
    logo: {
      type: String,
      trim: true,
    },
    categories: {
      type: [String], // combines design, development, ai, platform
      required: true,
      validate: [(val) => val.length > 0, "At least one category is required"],
    },
    description: {
      type: String,
      required: true,
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

module.exports = mongoose.model("Project", projectSchema);
