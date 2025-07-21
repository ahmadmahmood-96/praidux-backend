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
      fullName,
      phone,
      email,
      description, 
      services = [],
    } = req.body;

    // Validate required fields
    if (  !fullName || !phone || !email) {
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
exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 }); // optional: latest first
    res.status(200).json({
      message: "Contacts fetched successfully",
      contacts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

