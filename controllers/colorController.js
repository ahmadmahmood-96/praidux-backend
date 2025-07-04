const Color = require("../models/colors");

// Create new color
exports.createColor = async (req, res) => {
    try {
        const {
            name
        } = req.body;

        if (!name || name.trim() === "") {
            return res.status(400).json({
                status: "fail",
                message: "Color name is required"
            });
        }

        const color = await Color.create({
            name: name.trim()
        });

        res.status(201).json({
            status: "success",
            message: "Color created successfully",
            result: color
        });
    } catch (err) {
        res.status(500).json({
            status: "fail",
            message: err.message
        });
    }
};

// Get all colors
exports.getAllColors = async (req, res) => {
    try {
        const colors = await Color.find().sort({
            createdAt: -1
        });

        res.status(200).json({
            status: "success",
            resultCount: colors.length,
            result: colors
        });
    } catch (err) {
        res.status(500).json({
            status: "fail",
            message: err.message
        });
    }
};

// Get a single color by ID
exports.getColorById = async (req, res) => {
    try {
        const {
            id
        } = req.params;
        const color = await Color.findById(id);

        if (!color) {
            return res.status(404).json({
                status: "fail",
                message: "Color not found"
            });
        }

        res.status(200).json({
            status: "success",
            result: color
        });
    } catch (err) {
        res.status(500).json({
            status: "fail",
            message: err.message
        });
    }
};

// Update color
exports.updateColor = async (req, res) => {
    try {
        const {
            id
        } = req.params;
        const {
            name
        } = req.body;

        if (!name || name.trim() === "") {
            return res.status(400).json({
                status: "fail",
                message: "Color name is required"
            });
        }

        const color = await Color.findByIdAndUpdate(
            id, {
                name: name.trim()
            }, {
                new: true,
                runValidators: true
            }
        );

        if (!color) {
            return res.status(404).json({
                status: "fail",
                message: "Color not found"
            });
        }

        res.status(200).json({
            status: "success",
            message: "Color updated successfully",
            result: color
        });
    } catch (err) {
        res.status(500).json({
            status: "fail",
            message: err.message
        });
    }
};

// Delete color
exports.deleteColor = async (req, res) => {
    try {
        const {
            id
        } = req.params;
        const color = await Color.findByIdAndDelete(id);

        if (!color) {
            return res.status(404).json({
                status: "fail",
                message: "Color not found"
            });
        }

        res.status(200).json({
            status: "success",
            message: "Color deleted successfully"
        });
    } catch (err) {
        res.status(500).json({
            status: "fail",
            message: err.message
        });
    }
};