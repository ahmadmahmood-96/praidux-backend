require("dotenv").config();
const mongoose = require("mongoose");
const Color = require("../models/colors"); // Adjust path if needed

// Your list of colors
const colors = [
    "Red",
    "Blue",
    "Black",
    "White",
    "Silver",
    "Grey",
    "Green",
    "Yellow",
    "Orange",
    "Brown",
    "Beige",
    "Purple",
    "Pink",
    "Maroon",
    "Gold",
    "Navy",
    "Teal",
    "Cyan",
    "Magenta",
];

const seed = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/hikar", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log("✅ Connected to MongoDB");

        // Clear existing colors if needed
        await Color.deleteMany({});
        console.log("🗑 Existing colors cleared");

        // Insert new colors
        const colorDocs = colors.map((name) => ({
            name
        }));

        await Color.insertMany(colorDocs);
        console.log("🚀 Colors seeded successfully");

        process.exit();
    } catch (err) {
        console.error("❌ Seeding colors failed", err);
        process.exit(1);
    }
};

seed();