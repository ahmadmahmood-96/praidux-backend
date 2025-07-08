// controllers/projectController.js
const Project = require("../models/Project");
const cloudinary = require("cloudinary").v2;
const {
  uploadToCloudinary, // for images/logos
  uploadVideoToCloudinary, // new function for video
  safeUnlink,
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
// Add this at the top of your controller file
const getPublicIdFromUrl = (url) => {
  // Extract public_id from Cloudinary URL
  const matches = url.match(/upload\/(?:v\d+\/)?([^\.]+)/);
  return matches ? matches[1] : null;
};
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find().select(
      "title mainCategory logo  categories description listOnWebsite"
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

    // ✅ Add regular fields from body
    for (const key in req.body) {
      if (
        [
          "existingImages[]",
          "existingLogo",
          "images",
          "logo",
          "video",
        ].includes(key)
      )
        continue;

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
  
  // 1. Process existing images (filter out removed ones)
  if (req.body.existingImages) {
    const existingImages = Array.isArray(req.body.existingImages) 
      ? req.body.existingImages 
      : [req.body.existingImages];
    
    const removedImages = req.body['removedImages[]'] 
      ? (Array.isArray(req.body['removedImages[]']) 
          ? req.body['removedImages[]'] 
          : [req.body['removedImages[]']])
      : [];
    
    // Filter out removed images
    finalImageUrls = existingImages.filter(url => !removedImages.includes(url));
    
    // Delete removed images from Cloudinary
    for (const url of removedImages) {
      try {
        const publicId = getPublicIdFromUrl(url);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      } catch (err) {
        console.error('Failed to delete image from Cloudinary:', url, err);
      }
    }
  }

  // 2. Add new images
  if (req.files?.images) {
    const newImages = Array.isArray(req.files.images) 
      ? req.files.images 
      : [req.files.images];
    
    for (const file of newImages) {
      const result = await uploadToCloudinary(file.path);
      if (result?.secure_url) {
        finalImageUrls.push(result.secure_url);
        uploadedFiles.push(file);
      }
    }
  }

  updateData.images = finalImageUrls;
}

    // ✅ Handle Logo (new if uploaded, otherwise keep existing)
    if (req.files?.logo?.[0]) {
      const logoResult = await uploadToCloudinary(req.files.logo[0].path);
      updateData.logo = logoResult.secure_url;
      uploadedFiles.push(req.files.logo[0]);
    } else if (req.body.existingLogo) {
      updateData.logo = req.body.existingLogo;
    }

    // ✅ Handle Video (replace only if new uploaded)
    if (req.files?.video?.[0]) {
      const videoResult = await uploadVideoToCloudinary(
        req.files.video[0].path
      );
      updateData.video = videoResult.secure_url;
      uploadedFiles.push(req.files.video[0]);
    } else if (req.body.existingVideo) {
      updateData.video = req.body.existingVideo;
    }

    // ✅ Perform Update
    const updatedProject = await Project.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    setImmediate(() => cleanupFiles(uploadedFiles));

    return res.status(200).json({
      status: "success",
      message: "Project updated",
      result: updatedProject,
    });
  } catch (error) {
    if (uploadedFiles.length > 0)
      setImmediate(() => cleanupFiles(uploadedFiles));
    return res.status(500).json({ status: "error", message: error.message });
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
// PUT /project/update-list-status/:id
exports.updateListStatus = async (req, res) => {
  const { id } = req.params;
  const { listOnWebsite } = req.body;

  if (typeof listOnWebsite !== "boolean") {
    return res.status(400).json({ status: "fail", message: "Invalid status" });
  }

  try {
    const updated = await Project.findByIdAndUpdate(
      id,
      { listOnWebsite },
      { new: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ status: "fail", message: "Project not found" });
    }

    return res
      .status(200)
      .json({ status: "success", message: "Status updated", result: updated });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};
