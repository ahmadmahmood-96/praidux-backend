const express = require("express");
const router = express.Router();
const testimonialController = require("../controllers/videoTestimonialController");
const multer = require("multer");
const upload = require("../middleware/upload");

// Create new video testimonial
router.post(
  "/add-video-testimonial",
  upload.fields([{ name: "video", maxCount: 1 }]),
  testimonialController.createVideoTestimonial
);

// Get all video testimonials
router.get("/view-video-testimonials", testimonialController.getAllVideoTestimonials);

//  Get single video testimonial by ID
router.get("/view-video-testimonial/:id", testimonialController.getVideoTestimonialById);

// Update video testimonial by ID
router.put(
  "/update-video-testimonial/:id",
  upload.fields([{ name: "video", maxCount: 1 }]),
  testimonialController.updateVideoTestimonial
);

//  Delete video testimonial by ID
router.delete(
  "/delete-video-testimonial/:id",
  testimonialController.deleteVideoTestimonial
);

// ✅ Get only testimonials listed on website
router.get(
  "/view-listed-video-testimonials",
  testimonialController.getListedVideoTestimonials
);


//  Update listOnWebsite status (boolean)
router.put(
  "/update-video-status/:id",
  testimonialController.updateListStatus
);

module.exports = router;
