const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.login = async (req, res) => {
  try {
    const {
      email,
      password
    } = req.body;

    // Check if user exists
    const user = await User.findOne({
      email,
    });
    if (!user) {
      return res.status(400).json({
        message: "User does not exist",
      });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = jwt.sign({
        user: user,
      },
      process.env.SECRET_KEY
    );

    // Format response
    const response = {
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: "An error occurred during login",
    });
  }
};