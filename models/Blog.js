const mongoose = require("mongoose");

const contentBlockSchema = new mongoose.Schema(
  {
    mediaUrl: {
      type: String, 
      trim: true,
    },
    mediaType: {
      type: String, 
      enum: ["image", "video", null],
      default: null,
    },
    text: {
      type: String, 
      trim: true,
    },
  },
  { _id: false } 
);

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
    contentBlocks: [contentBlockSchema], 
    listOnWebsite: {
      type: Boolean,
      default: false,
    },
    blogImageUrl: {
      type: String, 
      trim: true,
    },
     blogContent: {
      type: String, 
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Blog", blogSchema);
