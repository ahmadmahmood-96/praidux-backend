const express = require("express");
const router = express.Router();
const visitorController = require("../controllers/visitorController");
const verifyToken = require("../middleware/verify");

router.post("/track-visit", visitorController.recordVisit);
router.get("/stats", verifyToken, visitorController.getVisitStats);

module.exports = router;