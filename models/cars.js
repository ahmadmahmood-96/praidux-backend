const mongoose = require("mongoose");

const carSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  make: {
    type: String,
    required: true,
  },
  model: {
    type: String,
    required: true,
  },
  manufacturing_year: {
    type: Number,
    required: true,
  },
  condition: {
    type: String,
    required: true,
  },
  body_type: {
    type: String,
    required: true,
  },
  engine: String,
  cylinders: String,
  doors: String,
  horsepower: String,
  fuel_type: {
    type: String,
    required: true,
  },
  gear_type: {
    type: String,
    required: true,
  },
  drive_train: {
    type: String,
  },
  exterior_color: String,
  interior_color: [String],
  chasis_no: {
    type: String,
    required: true,
    unique: true,
  },
  engine_no: {
    type: String,
    required: true,
    unique: true,
  },
  reg_no: String,
  state: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    required: true,
  },
  mileage: {
    type: Number,
    required: true,
  },
  mileage_unit: {
    type: String,
    required: true,
  },
  description: String,
  images: {
    type: [String], // Expecting image URLs or filenames (store on server/S3 and save path)
    required: true,
  },
  should_list_on_website: {
    type: Boolean,
    default: true,
  },
  reserved_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  clicks: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model("Car", carSchema);