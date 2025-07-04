const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    phone_number: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["admin", "assistant"], // Restrict values to "admin" or "salesperson"
        required: true,
        default: "assistant", // Default role
    },
    last_login: {
        type: Date,
        default: null,
    },
    updated_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    otp: {
        type: String,
        default: null,
    },
    otp_expiry: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
});

module.exports = mongoose.model("User", userSchema);