const mongoose = require("mongoose");

const visitSchema = new mongoose.Schema({
    visitor_id: {
        type: String,
        required: true,
    },
    ip_address: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        default: "Unknown",
    },
    user_agent: String,
}, {
    timestamps: true
});

module.exports = mongoose.model("Visit", visitSchema);