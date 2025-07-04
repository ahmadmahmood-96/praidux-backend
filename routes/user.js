const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// For adding users
router.post("/add-user", userController.addUser);

// For viewing users
router.get("/view-users", userController.getUsers);

// For viewing one user
router.get("/view-user/:id", userController.getUser);

module.exports = router;