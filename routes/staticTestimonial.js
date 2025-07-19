const express = require("express");
const router = express.Router();
const staticTestimonialController = require("../controllers/staticTestimonialController");
const upload = require("../middleware/upload");

// ✅ Add static testimonial
router.post(
  "/add-static-testimonial",
 upload.fields([
  { name: "projectLogo", maxCount: 1 },
  { name: "clientImage", maxCount: 1 },
])
,
  staticTestimonialController.createStaticTestimonial
);

// ✅ Get all static testimonials
router.get(
  "/view-static-testimonials",
  staticTestimonialController.getAllStaticTestimonials
);

// ✅ Get testimonials where listOnWebsite = true
router.get(
  "/view-listed-static-testimonials",
  staticTestimonialController.getListedStaticTestimonials
);


// ✅ Get one static testimonial by ID
router.get(
  "/view-static-testimonial/:id",
  staticTestimonialController.getStaticTestimonialById
);

// ✅ Update static testimonial
router.put(
  "/update-static-testimonial/:id",
 upload.fields([
  { name: "projectLogo", maxCount: 1 },
  { name: "clientImage", maxCount: 1 },
])
,
  staticTestimonialController.updateStaticTestimonial
);

// ✅ Delete static testimonial
router.delete(
  "/delete-static-testimonial/:id",
  staticTestimonialController.deleteStaticTestimonial
);

// ✅ Update `listOnWebsite` status
router.put(
  "/update-static-list-status/:id",
  staticTestimonialController.updateListStatus
);

module.exports = router;
