const express = require("express");
const contactController = require("../controllers/contactController");
const upload = require("../middleware/upload"); // assuming you're using this
const router = express.Router();

// Route to create a new contact entry
router.post(
  "/add-contact",
  upload.fields([{ name: "attachment", maxCount: 1 }]),
  contactController.createContact
);
router.get("/view-all", contactController.getAllContacts);
module.exports = router;