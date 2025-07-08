const express = require("express");
const faqController = require("../controllers/FaqController");
const router = express.Router();

router.post("/add-faq", faqController.createFaq);
router.get("/view-faqs", faqController.getAllFaqs);
router.get("/view-faq/:id", faqController.getFaqById);
router.put("/update-faq/:id", faqController.updateFaq);
router.delete("/delete-faq/:id", faqController.deleteFaq);

module.exports = router;
