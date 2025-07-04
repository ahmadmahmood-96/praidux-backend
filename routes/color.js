const express = require("express");
const router = express.Router();
const colorController = require("../controllers/colorController");

router.post("/add-color", colorController.createColor);
router.get("/view-colors", colorController.getAllColors);
router.get("/view-color/:id", colorController.getColorById);
router.patch("/update-color/:id", colorController.updateColor);
router.delete("/delete-color/:id", colorController.deleteColor);

module.exports = router;