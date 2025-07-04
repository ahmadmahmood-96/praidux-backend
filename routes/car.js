const express = require("express");
const carController = require("../controllers/carController");
const router = express.Router();
const multer = require("multer");
const upload = require('../middleware/upload');

// For adding cars
router.post("/add-car", upload.array("images", 15), carController.createCar);

// For viewing all cars
router.get("/view-cars", carController.getAllCars);

// For viewing car with given ID
router.get("/view-car/:id", carController.getCar);

// For updating car with given ID
router.put("/update-car/:id", upload.array("images", 15), carController.updateCar);

// For deleting car with given ID
router.delete("/delete-car/:id", carController.deleteCar);

module.exports = router;