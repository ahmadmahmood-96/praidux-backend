const mongoose = require("mongoose");

const carMakeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    models: [{
        type: String,
        trim: true
    }]
}, {
    collection: 'car_makes',
    timestamps: true
});

const CarMake = mongoose.model("CarMake", carMakeSchema);

module.exports = CarMake;