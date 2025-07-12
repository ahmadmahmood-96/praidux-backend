const mongoose = require("mongoose");

const videoTestimonialSchema = new mongoose.Schema(
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
    liveStatus: {
      type: String,
      enum: ["yes", "no"],
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    websiteLink: {
      type: String,
      trim: true,
    },
    iosLink: {
      type: String,
      trim: true,
    },
    androidLink: {
      type: String,
      trim: true,
    },
    stars: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    videoUrl: {
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

// ✅ Custom validator to ensure at least one link is provided
videoTestimonialSchema.pre("validate", function (next) {
  const hasAtLeastOneLink =
    this.websiteLink || this.iosLink || this.androidLink;

  if (!hasAtLeastOneLink) {
    this.invalidate(
      "websiteLink",
      "At least one of websiteLink, iosLink, or androidLink is required."
    );
  }

  next();
});

module.exports = mongoose.model("VideoTestimonial", videoTestimonialSchema);
