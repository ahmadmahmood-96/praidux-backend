const CarMake = require("../models/carMakes");

// Get all car makes
exports.getAllCarMakes = async (req, res) => {
    try {
        const carMakes = await CarMake.find();
        res.status(200).json({
            status: "success",
            message: "Car makes successfully retrieved",
            result: carMakes,
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
};

// Get single car make by ID
exports.getCarMakeById = async (req, res) => {
    try {
        const carMake = await CarMake.findById(req.params.id);
        if (!carMake) {
            return res.status(404).json({
                status: "error",
                message: "Car make not found",
            });
        }
        res.status(200).json({
            status: "success",
            message: "Car make successfully retrieved",
            result: carMake,
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
};

// Create a new car make
exports.createCarMake = async (req, res) => {
    try {
        const {
            name,
            models
        } = req.body;
        const carMake = await CarMake.create({
            name,
            models
        });
        res.status(201).json({
            status: "success",
            message: "Car make successfully created",
            result: carMake,
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
};

// Update a car make
exports.updateCarMake = async (req, res) => {
    try {
        const {
            name,
            models
        } = req.body;
        const carMake = await CarMake.findByIdAndUpdate(
            req.params.id, {
                name,
                models
            }, {
                new: true,
                runValidators: true
            }
        );
        if (!carMake) {
            return res.status(404).json({
                status: "error",
                message: "Car make not found",
            });
        }
        res.status(200).json({
            status: "success",
            message: "Car make successfully updated",
            result: carMake,
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
};

// Delete a car make
exports.deleteCarMake = async (req, res) => {
    try {
        const carMake = await CarMake.findByIdAndDelete(req.params.id);
        if (!carMake) {
            return res.status(404).json({
                status: "error",
                message: "Car make not found",
            });
        }
        res.status(200).json({
            status: "success",
            message: "Car make successfully deleted",
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
};

// Fetching only car make names
exports.getAllCarMakeNames = async (req, res) => {
    try {
        const makes = await CarMake.find({}, "_id name").lean();
        res.status(200).json({
            status: "success",
            result: makes
        });
    } catch (error) {
        console.error("Error fetching car makes:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to fetch car makes"
        });
    }
};

// Fetching car models based on car make name
exports.getCarModelsByMakeName = async (req, res) => {
    try {
        const {
            makeName
        } = req.params;

        if (!makeName) {
            return res.status(400).json({
                error: "Make name is required"
            });
        }

        // Search by name (case-insensitive for safety)
        const carMake = await CarMake.findOne({
                name: new RegExp(`^${makeName}$`, 'i')
            })
            .select("name models");

        if (!carMake) {
            return res.status(404).json({
                error: "Car make not found"
            });
        }

        res.status(200).json({
            makeName: carMake.name,
            models: carMake.models
        });
    } catch (err) {
        console.error("Error fetching car models:", err);
        res.status(500).json({
            error: "Internal server error"
        });
    }
};