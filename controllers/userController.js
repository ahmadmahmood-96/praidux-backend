const {
  query
} = require("express");
const User = require("../models/user");
const bcrypt = require("bcryptjs");

exports.addUser = async (req, res) => {
  try {
    const {
      name,
      email,
      phone_number,
      password,
      role
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      email,
    });
    if (existingUser) {
      return res.status(400).json({
        message: "Email is already registered",
      });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      name,
      email,
      phone_number,
      password: hashedPassword,
      role: role, // Default role if not provided
    });

    await newUser.save();

    res.status(201).json({
      message: "User added successfully!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "An error occurred while adding user",
    });
  }
};

// view all users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("_id name email phone_number role createdAt");

    res.status(200).json({
      message: "Users retrieved successfully",
      users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An error has occurred",
    });
  }
};

exports.getUser = async (req, res) => {
  try {
    // check if query paramters exsists
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({
        message: "Please provde user id",
      });
    }

    const user = await User.findOne({
      _id: id
    });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User found",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "an error has occured while retrieving the user",
    });
  }
};