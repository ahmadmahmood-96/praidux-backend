const express = require("express");
const carConfigController = require("../controllers/carConfigController");
const router = express.Router();

// For adding car config (car make + models)
router.post("/add-car-config", carConfigController.createCarMake);

// For viewing all car configs
router.get("/view-car-configs", carConfigController.getAllCarMakes);

// For viewing a car config with given ID
router.get("/view-car-config/:id", carConfigController.getCarMakeById);

// For updating a car config with given ID
router.patch("/update-car-config/:id", carConfigController.updateCarMake);

// For deleting a car config with given ID
router.delete("/delete-car-config/:id", carConfigController.deleteCarMake);

// For all car config (only makes)
router.get('/get-makes', carConfigController.getAllCarMakeNames);

// For all car models based on car make name
router.get('/get-models/:makeName', carConfigController.getCarModelsByMakeName);

module.exports = router;