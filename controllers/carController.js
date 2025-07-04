const Car = require("../models/cars");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const {
  uploadToCloudinary,
  forceDeleteFile
} = require("../utils/cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Get all cars
exports.getAllCars = async (req, res) => {
  try {
    const cars = await Car.find().select(
      "_id make model manufacturing_year fuel_type gear_type price currency"
    );

    res.status(200).json({
      status: "success",
      message: "Cars successfully retrieved",
      result: cars,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "error.message",
    });
  }
};

// Get car by id
exports.getCar = async (req, res) => {
  try {
    const {
      id
    } = req.params;

    if (!id) {
      return res.status(400).json({
        status: "fail",
        message: "ID is required",
      });
    }

    const car = await Car.findById(id);

    res.status(200).json({
      status: "success",
      message: "Car successfully retrieved",
      result: car,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "error.message",
    });
  }
};

const cleanupFiles = async (files) => {
  if (!files || files.length === 0) return;

  console.log(`Starting cleanup of ${files.length} files...`);

  // Add delay before cleanup to ensure all handles are released
  await new Promise(resolve => setTimeout(resolve, 500));

  const deletePromises = files.map(async (file) => {
    try {
      const success = await forceDeleteFile(file.path);
      if (success) {
        console.log(`Successfully deleted: ${file.path}`);
      } else {
        console.log(`Failed to delete: ${file.path}`);
      }
      return success;
    } catch (error) {
      console.error(`Error deleting ${file.path}:`, error);
      return false;
    }
  });

  const results = await Promise.all(deletePromises);
  const successCount = results.filter(Boolean).length;
  console.log(`Cleanup completed: ${successCount}/${files.length} files deleted`);
};

exports.createCar = async (req, res) => {
  let uploadedFiles = [];

  try {
    const {
      title,
      make,
      model,
      manufacturing_year,
      condition,
      body_type,
      engine,
      cylinders,
      doors,
      horsepower,
      fuel_type,
      gear_type,
      drive_train,
      exterior_color,
      interior_color,
      chasis_no,
      engine_no,
      reg_no,
      state,
      price,
      currency,
      mileage,
      mileage_unit,
      description,
      should_list_on_website,
    } = req.body;

    // Validate required fields
    if (!title || !body_type || !make || !model ||
      !manufacturing_year || !price || !currency || !mileage || !mileage_unit) {
      return res.status(400).json({
        message: "Missing required car fields"
      });
    }

    // Check for uploaded files
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({
        message: "At least one image is required"
      });
    }

    // Upload images to Cloudinary
    const imageUrls = [];
    uploadedFiles = [...files]; // Keep reference for cleanup

    for (const file of files) {
      try {
        const result = await uploadToCloudinary(file.path);
        imageUrls.push(result.secure_url);
        console.log(`Successfully uploaded: ${file.path}`);
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);

        // Clean up all files (including the failed one)
        await cleanupFiles(uploadedFiles);

        return res.status(500).json({
          message: "Failed to upload images"
        });
      }
    }

    // Parse date properly
    const parsedYear = manufacturing_year instanceof Date ?
      manufacturing_year.getFullYear() :
      new Date(manufacturing_year).getFullYear();

    // Create car record
    const newCar = await Car.create({
      title,
      make,
      model,
      manufacturing_year: parsedYear,
      condition,
      body_type,
      engine,
      cylinders: cylinders ? Number(cylinders) : undefined,
      doors: doors ? Number(doors) : undefined,
      horsepower: horsepower ? Number(horsepower) : undefined,
      fuel_type,
      gear_type,
      drive_train,
      exterior_color,
      interior_color: Array.isArray(interior_color) ? interior_color : [interior_color],
      chasis_no,
      engine_no,
      reg_no,
      state,
      price: Number(price),
      currency,
      mileage: Number(mileage),
      mileage_unit,
      description,
      should_list_on_website: should_list_on_website === "false" ? false : Boolean(should_list_on_website),
      images: imageUrls,
    });

    // Clean up uploaded files after successful database operation
    // Use setImmediate to ensure cleanup happens after response
    setImmediate(() => {
      cleanupFiles(uploadedFiles);
    });

    return res.status(201).json({
      message: "Car added successfully",
      car: newCar,
    });

  } catch (error) {
    console.error("Error creating car:", error);

    // Clean up any uploaded files in case of error
    if (uploadedFiles.length > 0) {
      setImmediate(() => {
        cleanupFiles(uploadedFiles);
      });
    }

    return res.status(500).json({
      message: error.message || "Internal server error",
    });
  }
};

exports.updateCar = async (req, res) => {
  let uploadedFiles = [];

  try {
    const {
      id
    } = req.params;

    if (!id) {
      return res.status(400).json({
        status: "fail",
        message: "ID is required",
      });
    }

    const car = await Car.findById(id);
    if (!car) {
      return res.status(404).json({
        status: "fail",
        message: "Car not found with ID",
      });
    }

    // Initialize updateData with only the fields sent in the request body
    const updateData = {};

    // Iterate over req.body to add fields to updateData
    // FormData sends everything as strings, so parse as needed
    for (const key in req.body) {
      if (key === "manufacturing_year" || ["cylinders", "doors", "horsepower", "price", "mileage"].includes(key)) {
        updateData[key] = Number(req.body[key]);
      } else if (key === "should_list_on_website") {
        updateData[key] = req.body[key] === "true"; // Convert string "true"/"false" to boolean
      } else if (key === "interior_color") {
        // If interior_color is sent as a single string (from FormData, for single item arrays), convert to array
        // If it's already an array (from multiple selections), it will be handled correctly by FormData parsing
        updateData[key] = Array.isArray(req.body[key]) ? req.body[key] : [req.body[key]];
      } else if (key !== "imagesChanged" && key !== "existingImages[]") {
        updateData[key] = req.body[key];
      }
    }

    // Handle images only if imagesChanged is true
    const imagesChanged = req.body.imagesChanged === "true";

    if (imagesChanged) {
      let finalImageUrls = [];

      // Collect existing image URLs sent from the frontend
      let existing = req.body["existingImages[]"];
      if (existing) {
        if (Array.isArray(existing)) {
          finalImageUrls = existing;
        } else {
          finalImageUrls = [existing]; // Handle case where only one existing image URL is sent
        }
      }

      // Handle newly uploaded files
      if (req.files && req.files.length > 0) {
        uploadedFiles = [...req.files]; // Keep track for cleanup

        for (const file of req.files) {
          const result = await uploadToCloudinary(file.path);
          finalImageUrls.push(result.secure_url);
        }
        // Clean up temporary files after upload
        setImmediate(() => cleanupFiles(uploadedFiles));
      }
      updateData.images = finalImageUrls; // Set the images field in updateData
    } else {
      // If images are not changed, ensure we don't accidentally clear them
      // This means if 'imagesChanged' is 'false', updateData should NOT contain an 'images' field
      // The `Car.findByIdAndUpdate` will then not touch the images field if it's not present in updateData.
    }


    const updatedCar = await Car.findByIdAndUpdate(id, updateData, {
      new: true, // Return the updated document
      runValidators: true, // Run Mongoose validators on update
    });

    if (!updatedCar) {
      return res.status(404).json({
        status: "fail",
        message: "Failed to update car data",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Car successfully updated",
      result: updatedCar,
    });
  } catch (error) {
    console.error("Error updating car:", error);
    // Ensure temporary files are cleaned up in case of error
    if (uploadedFiles.length > 0) setImmediate(() => cleanupFiles(uploadedFiles));
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};


function extractPublicId(url) {
  try {
    // Regular expression to capture the public ID part
    // It looks for /upload/ followed by an optional /v<timestamp>/
    // and then captures everything until the last dot (before the file extension)
    const regex = /\/upload\/(?:v\d+\/)?(.+?)\.\w{3,4}$/;
    const match = url.match(regex);

    if (match && match[1]) {
      return match[1]; // The captured group is the public ID
    }

    console.log(`Could not extract public ID from URL: ${url}`);
    return null;
  } catch (error) {
    console.error("Error in extractPublicId:", error);
    return null;
  }
}

// Your existing deleteCar function (no changes needed here, as the fix is in extractPublicId)
exports.deleteCar = async (req, res) => {
  try {
    const {
      id
    } = req.params;

    if (!id) {
      return res.status(400).json({
        status: "fail",
        message: "ID is required",
      });
    }

    const car = await Car.findById(id);

    if (!car) {
      return res.status(404).json({
        status: "fail",
        message: "Car not found with that ID",
      });
    }

    // Delete images from Cloudinary
    if (car.images && car.images.length > 0) {
      for (const imageUrl of car.images) {
        const publicId = extractPublicId(imageUrl);
        if (publicId) {
          console.log(`Attempting to delete Cloudinary image with public ID: ${publicId}`);
          // Make sure 'cloudinary' object is globally available or imported in this file
          await cloudinary.uploader.destroy(publicId);
          console.log(`Successfully sent delete command for Cloudinary image: ${publicId}`);
        } else {
          console.log(`Skipping deletion: No valid public ID extracted for image URL: ${imageUrl}`);
        }
      }
    }

    // Delete the car document
    await Car.findByIdAndDelete(id);

    res.status(200).json({
      status: "success",
      message: "Car and associated images successfully deleted",
      result: null,
    });
  } catch (error) {
    console.error("Error deleting car:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Server error",
    });
  }
};