const StaticTestimonial = require("../models/staticTestimonial");
const cloudinary = require("cloudinary").v2;
const {
   uploadToCloudinary,
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
  const deletePromises = files.map((file) => forceDeleteFile(file.path));
  await Promise.all(deletePromises);
};

// ✅ Get all static testimonials
exports.getAllStaticTestimonials = async (req, res) => {
  try {
    const testimonials = await StaticTestimonial.find();
    res.status(200).json({
      status: "success",
      message: "Static testimonials retrieved",
      result: testimonials,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// ✅ Get testimonial by ID
exports.getStaticTestimonialById = async (req, res) => {
  try {
    const { id } = req.params;
    const testimonial = await StaticTestimonial.findById(id);
    if (!testimonial)
      return res.status(404).json({ status: "fail", message: "Not found" });

    res.status(200).json({ status: "success", result: testimonial });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// ✅ Create testimonial
exports.createStaticTestimonial = async (req, res) => {
  let uploadedFiles = [];
  try {
    const {
      clientName,
      designation,
      projectName,
      description,
      listOnWebsite,
    } = req.body;

    if (!clientName || !designation || !projectName || !description || listOnWebsite === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let projectLogoUrl = "";
    let clientImageUrl = "";

    if (req.files?.projectLogo?.[0]) {
      const result = await  uploadToCloudinary(req.files.projectLogo[0].path);
      projectLogoUrl = result.secure_url;
      uploadedFiles.push(req.files.projectLogo[0]);
    }

    if (req.files?.clientImage?.[0]) {
      const result = await  uploadToCloudinary(req.files.clientImage[0].path);
      clientImageUrl = result.secure_url;
      uploadedFiles.push(req.files.clientImage[0]);
    }

    const newTestimonial = await StaticTestimonial.create({
      clientName,
      designation,
      projectName,
      description,
      projectLogo: projectLogoUrl,
      clientImage: clientImageUrl,
      listOnWebsite,
    });

    setImmediate(() => cleanupFiles(uploadedFiles));

    return res.status(201).json({ message: "Testimonial created", result: newTestimonial });
  } catch (error) {
    setImmediate(() => cleanupFiles(uploadedFiles));
    return res.status(500).json({ message: error.message });
  }
};

// ✅ Update testimonial
exports.updateStaticTestimonial = async (req, res) => {
  const { id } = req.params;
  let uploadedFiles = [];

  try {
    const existing = await StaticTestimonial.findById(id);
    if (!existing) {
      return res.status(404).json({ status: "fail", message: "Testimonial not found" });
    }

    const {
      clientName,
      designation,
      projectName,
      description,
      listOnWebsite,
    } = req.body;

    const updateData = {};

    if (clientName !== undefined) updateData.clientName = clientName;
    if (designation !== undefined) updateData.designation = designation;
    if (projectName !== undefined) updateData.projectName = projectName;
    if (description !== undefined) updateData.description = description;
    if (listOnWebsite !== undefined) updateData.listOnWebsite = listOnWebsite;

    if (req.files?.projectLogo?.[0]) {
      const result = await  uploadToCloudinary(req.files.projectLogo[0].path);
      updateData.projectLogo = result.secure_url;
      uploadedFiles.push(req.files.projectLogo[0]);
    }

    if (req.files?.clientImage?.[0]) {
      const result = await  uploadToCloudinary(req.files.clientImage[0].path);
      updateData.clientImage = result.secure_url;
      uploadedFiles.push(req.files.clientImage[0]);
    }

    const updated = await StaticTestimonial.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    setImmediate(() => cleanupFiles(uploadedFiles));

    return res.status(200).json({
      status: "success",
      message: "Testimonial updated",
      result: updated,
    });
  } catch (error) {
    setImmediate(() => cleanupFiles(uploadedFiles));
    return res.status(500).json({ message: error.message });
  }
};

// ✅ Delete testimonial
exports.deleteStaticTestimonial = async (req, res) => {
  const { id } = req.params;

  try {
    const testimonial = await StaticTestimonial.findById(id);
    if (!testimonial) {
      return res.status(404).json({ status: "fail", message: "Testimonial not found" });
    }

    await StaticTestimonial.findByIdAndDelete(id);

    return res.status(200).json({
      status: "success",
      message: "Testimonial deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

// ✅ Update listOnWebsite status
exports.updateListStatus = async (req, res) => {
  const { id } = req.params;
  const { listOnWebsite } = req.body;

  if (typeof listOnWebsite !== "boolean") {
    return res.status(400).json({
      status: "fail",
      message: "listOnWebsite must be a boolean",
    });
  }

  try {
    const updated = await StaticTestimonial.findByIdAndUpdate(
      id,
      { listOnWebsite },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ status: "fail", message: "Testimonial not found" });
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
