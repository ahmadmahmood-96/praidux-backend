const Contact = require("../models/contact");
const cloudinary = require("cloudinary").v2;
const {
  uploadToCloudinary, // for images/logos
  uploadVideoToCloudinary, // new function for video
  safeUnlink,
  forceDeleteFile,
} = require("../utils/cloudinary");
exports.createContact = async (req, res) => {
  let uploadedFile = null;

  try {
    const {
      countryCode,
      countryName,
      fullName,
      phone,
      email,
      description, // or message
      services = [], // optional, default to empty array
    } = req.body;

    // Validate required fields
    if (!countryCode || !countryName || !fullName || !phone || !email) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let fileUrl = null;

    // Handle file upload if present
    if (req.files?.attachment?.[0]) {
      const file = req.files.attachment[0];
      const result = await uploadToCloudinary(file.path);
      fileUrl = result.secure_url;
      uploadedFile = file;
    }

    if (!fileUrl) {
      return res.status(400).json({ message: "Attachment is required" });
    }

    const newContact = await Contact.create({
      countryCode,
      countryName,
      fullName,
      phone,
      email,
      description,
      services,
      fileUrl,
    });

    if (uploadedFile) setImmediate(() => forceDeleteFile(uploadedFile.path));

    return res.status(201).json({
      message: "Contact created successfully",
      contact: newContact,
    });
  } catch (error) {
    if (uploadedFile) setImmediate(() => forceDeleteFile(uploadedFile.path));
    return res.status(500).json({ message: error.message });
  }
};
