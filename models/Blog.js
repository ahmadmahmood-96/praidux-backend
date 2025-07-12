const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    writerName: {
      type: String,
      required: true,
      trim: true,
    },
    blogTitle: {
      type: String,
      required: true,
      trim: true,
    },
    categories: {
      type: [String],
      required: true,
      validate: [(val) => val.length > 0, "At least one category is required"],
    },
    blogContent: {
      type: String,
      required: true,
    },
    listOnWebsite: {
      type: Boolean,
      default: false,
    },
    blogImageUrl: {
      type: String, // You might store image URL/path here
      trim: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

module.exports = mongoose.model("Blog", blogSchema);
