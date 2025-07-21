// controllers/videoTestimonialController.js
const VideoTestimonial = require("../models/videoTestimonial");
const cloudinary = require("cloudinary").v2;
const {
  uploadVideoToCloudinary,
  forceDeleteFile,
} = require("../utils/cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cleanupFiles = async (files) => {
  if (!files || files.length === 0) return;
  await new Promise((resolve) => setTimeout(resolve, 500));
  const deletePromises = files.map(async (file) => forceDeleteFile(file.path));
  await Promise.all(deletePromises);
};

exports.getAllVideoTestimonials = async (req, res) => {
  try {
    const testimonials = await VideoTestimonial.find().sort({ createdAt: -1 });
    res.status(200).json({
      status: "success",
      message: "Video Testimonials retrieved",
      result: testimonials,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.getVideoTestimonialById = async (req, res) => {
  try {
    const { id } = req.params;
    const testimonial = await VideoTestimonial.findById(id);
    if (!testimonial)
      return res.status(404).json({ status: "fail", message: "Not found" });
    res.status(200).json({ status: "success", result: testimonial });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
// ✅ Get video testimonials that are listed on the website
exports.getListedVideoTestimonials = async (req, res) => {
  try {
    const listedTestimonials = await VideoTestimonial.find({ listOnWebsite: true });
    res.status(200).json({
      status: "success",
      message: "Listed video testimonials retrieved",
      result: listedTestimonials,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.createVideoTestimonial = async (req, res) => {
  let uploadedFiles = [];
  try {
    const {
      clientName,
      designation,
      projectName,
      liveStatus,
      description,
      websiteLink,
      iosLink,
      androidLink,
      stars,
      listOnWebsite,
    } = req.body;

    if (
      !clientName ||
      !designation ||
      !projectName ||
      !liveStatus ||
      !description ||
      !stars ||
      listOnWebsite === undefined
    )
      return res.status(400).json({ message: "Missing required fields" });

    if (!req.files || !req.files.video || req.files.video.length === 0) {
      return res.status(400).json({ message: "Video is required" });
    }

    const videoFile = req.files.video[0];
    const videoResult = await uploadVideoToCloudinary(videoFile.path);
    uploadedFiles.push(videoFile);

    const newTestimonial = await VideoTestimonial.create({
      clientName,
      designation,
      projectName,
      liveStatus,
      description,
      websiteLink,
      iosLink,
      androidLink,
      stars,
      videoUrl: videoResult.secure_url,
      listOnWebsite,
    });

    setImmediate(() => cleanupFiles(uploadedFiles));

    return res
      .status(201)
      .json({ message: "Testimonial created", result: newTestimonial });
  } catch (error) {
    setImmediate(() => cleanupFiles(uploadedFiles));
    return res.status(500).json({ message: error.message });
  }
};

exports.updateListStatus = async (req, res) => {
  const { id } = req.params;
  const { listOnWebsite } = req.body;

  if (typeof listOnWebsite !== "boolean") {
    return res
      .status(400)
      .json({ status: "fail", message: "listOnWebsite must be a boolean" });
  }

  try {
    const updated = await VideoTestimonial.findByIdAndUpdate(
      id,
      { listOnWebsite },
      { new: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ status: "fail", message: "Testimonial not found" });
    }

    return res.status(200).json({
      status: "success",
      message: "Status updated",
      result: updated,
    });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};
exports.updateVideoTestimonial = async (req, res) => {
  const { id } = req.params;
  let uploadedFiles = [];

  try {
    const existing = await VideoTestimonial.findById(id);
    if (!existing) {
      return res
        .status(404)
        .json({ status: "fail", message: "Testimonial not found" });
    }

    const {
      clientName,
      designation,
      projectName,
      liveStatus,
      description,
      websiteLink,
      iosLink,
      androidLink,
      stars,
      listOnWebsite,
    } = req.body;

    const updateData = {};

    if (clientName !== undefined) updateData.clientName = clientName;
    if (designation !== undefined) updateData.designation = designation;
    if (projectName !== undefined) updateData.projectName = projectName;
    if (liveStatus !== undefined) updateData.liveStatus = liveStatus;
    if (description !== undefined) updateData.description = description;
    if (websiteLink !== undefined) updateData.websiteLink = websiteLink;
    if (iosLink !== undefined) updateData.iosLink = iosLink;
    if (androidLink !== undefined) updateData.androidLink = androidLink;
    if (stars !== undefined) updateData.stars = stars;
    if (listOnWebsite !== undefined)
      updateData.listOnWebsite = listOnWebsite;

    // ✅ Handle new video upload (optional)
    if (req.files?.video?.[0]) {
      const videoFile = req.files.video[0];
      const result = await uploadVideoToCloudinary(videoFile.path);
      updateData.videoUrl = result.secure_url;
      uploadedFiles.push(videoFile);
    }

    const updated = await VideoTestimonial.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    setImmediate(() => cleanupFiles(uploadedFiles));

    return res.status(200).json({
      status: "success",
      message: "Testimonial updated",
      result: updated,
    });
  } catch (err) {
    setImmediate(() => cleanupFiles(uploadedFiles));
    return res.status(500).json({ status: "error", message: err.message });
  }
};

exports.deleteVideoTestimonial = async (req, res) => {
  const { id } = req.params;

  try {
    const testimonial = await VideoTestimonial.findById(id);
    if (!testimonial) {
      return res
        .status(404)
        .json({ status: "fail", message: "Testimonial not found" });
    }

    // ✅ Extract and delete video from Cloudinary (if exists)
    if (testimonial.videoUrl) {
      const publicId = extractPublicIdFromCloudinaryUrl(testimonial.videoUrl);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
      }
    }

    // ✅ Delete testimonial document from MongoDB
    await VideoTestimonial.findByIdAndDelete(id);

    return res.status(200).json({
      status: "success",
      message: "Testimonial deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

// Helper to extract public ID from Cloudinary URL
function extractPublicIdFromCloudinaryUrl(url) {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)\.\w+$/);
  return match ? match[1] : null;
}

