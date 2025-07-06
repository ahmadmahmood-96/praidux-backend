// controllers/projectController.js
const Project = require("../models/Project");
const cloudinary = require("cloudinary").v2;
const {
  uploadToCloudinary,          // for images/logos
  uploadVideoToCloudinary,     // new function for video
  forceDeleteFile
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

exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find().select(
      "title mainCategory logo video categories description"
    );
    res.status(200).json({
      status: "success",
      message: "Projects retrieved",
      result: projects,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id)
      return res
        .status(400)
        .json({ status: "fail", message: "ID is required" });

    const project = await Project.findById(id);
    res.status(200).json({
      status: "success",
      message: "Project retrieved",
      result: project,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

exports.createProject = async (req, res) => {
  let uploadedFiles = [];
  try {
    const {
      title,
      mainCategory,
      client,
      duration,
      downloads,
      categories,
      description,
      listOnWebsite,
    } = req.body;

    if (
      !title ||
      !mainCategory ||
      !categories ||
      !description ||
      !client ||
      !duration ||
      !downloads ||
      listOnWebsite === undefined // check for both true/false
    ) {
      return res
        .status(400)
        .json({ message: "Missing required project fields" });
    }

    const files = req.files;

    // ✅ Handle images
    const images = files?.images || [];
    if (images.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one image is required" });
    }

    const imageUrls = [];
    for (const file of images) {
      const result = await uploadToCloudinary(file.path);
      imageUrls.push(result.secure_url);
      uploadedFiles.push(file);
    }

    // ✅ Handle video (optional)
    let videoUrl = null;
   if (files?.video?.[0]) {
  const videoResult = await uploadVideoToCloudinary(files.video[0].path);
      videoUrl = videoResult.secure_url;
      uploadedFiles.push(files.video[0]);
    }

    // ✅ Handle logo (optional)
    let logoUrl = null;
    if (files?.logo?.[0]) {
      const logoResult = await uploadToCloudinary(files.logo[0].path);
      logoUrl = logoResult.secure_url;
      uploadedFiles.push(files.logo[0]);
    }

    const newProject = await Project.create({
      title,
      mainCategory,
      images: imageUrls,
      video: videoUrl,
      logo: logoUrl,
      categories: Array.isArray(categories) ? categories : [categories],
      description,
      client,
      duration,
      downloads,
      listOnWebsite,
    });

    setImmediate(() => cleanupFiles(uploadedFiles));

    return res
      .status(201)
      .json({ message: "Project created successfully", project: newProject });
  } catch (error) {
    if (uploadedFiles.length > 0)
      setImmediate(() => cleanupFiles(uploadedFiles));
    return res.status(500).json({ message: error.message });
  }
};

exports.updateProject = async (req, res) => {
  let uploadedFiles = [];
  try {
    const { id } = req.params;
    if (!id)
      return res
        .status(400)
        .json({ status: "fail", message: "ID is required" });

    const project = await Project.findById(id);
    if (!project)
      return res
        .status(404)
        .json({ status: "fail", message: "Project not found" });

    const updateData = {};
    for (const key in req.body) {
      if (key === "categories") {
        updateData[key] = Array.isArray(req.body[key])
          ? req.body[key]
          : [req.body[key]];
      } else {
        updateData[key] = req.body[key];
      }
    }

    const imagesChanged = req.body.imagesChanged === "true";
    if (imagesChanged) {
      let finalImageUrls = [];
      let existing = req.body["existingImages[]"];
      if (existing)
        finalImageUrls = Array.isArray(existing) ? existing : [existing];

      if (req.files && req.files.length > 0) {
        uploadedFiles = [...req.files];
        for (const file of req.files) {
          const result = await uploadToCloudinary(file.path);
          finalImageUrls.push(result.secure_url);
        }
        setImmediate(() => cleanupFiles(uploadedFiles));
      }
      updateData.images = finalImageUrls;
    }

    const updatedProject = await Project.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: "success",
      message: "Project updated",
      result: updatedProject,
    });
  } catch (error) {
    if (uploadedFiles.length > 0)
      setImmediate(() => cleanupFiles(uploadedFiles));
    res.status(500).json({ status: "error", message: error.message });
  }
};

function extractPublicId(url) {
  const regex = /\/upload\/(?:v\d+\/)?(.+?)\.\w{3,4}$/;
  const match = url.match(regex);
  return match && match[1] ? match[1] : null;
}

exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id)
      return res
        .status(400)
        .json({ status: "fail", message: "ID is required" });

    const project = await Project.findById(id);
    if (!project)
      return res
        .status(404)
        .json({ status: "fail", message: "Project not found" });

    if (project.images && project.images.length > 0) {
      for (const imageUrl of project.images) {
        const publicId = extractPublicId(imageUrl);
        if (publicId) await cloudinary.uploader.destroy(publicId);
      }
    }

    await Project.findByIdAndDelete(id);

    res
      .status(200)
      .json({ status: "success", message: "Project and images deleted" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
