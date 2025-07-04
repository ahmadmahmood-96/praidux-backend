const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// router.post('/verify-email', authController.verifyEmail);
// router.post('/change-password', authController.changePassword);
router.post("/login", authController.login);

module.exports = router;