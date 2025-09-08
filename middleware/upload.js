const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure temp-uploads directory exists
const uploadDir = "temp-uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true,
  });
}

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename to avoid conflicts
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// File filter to only allow images
const fileFilter = (req, file, cb) => {
  const imageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  const videoTypes = ["video/mp4", "video/webm", "video/quicktime"];

  // Allow any file type if fieldname is 'attachment'
  if (file.fieldname === "attachment") {
    cb(null, true);
  } 
   else if (file.fieldname.startsWith("blockMedia_")) {
    if (imageTypes.includes(file.mimetype) || videoTypes.includes(file.mimetype)) {
      return cb(null, true);
    }
    return cb(new Error("Invalid block media type"), false);
  }

  // Allow images
  else if (
    ["images", "logo", "projectLogo", "clientImage", "blogImage"].includes(file.fieldname) &&
    imageTypes.includes(file.mimetype)
  ) {
    cb(null, true);
  } 
  // Allow videos
  else if (file.fieldname === "video" && videoTypes.includes(file.mimetype)) {
    cb(null, true);
  } 
  // Reject anything else
  else {
    cb(new Error(`Invalid file type for ${file.fieldname}`), false);
  }
};


const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 10MB per file
    files: 10, // Maximum 10 files
  },
  fileFilter: fileFilter,
});

module.exports = upload;
