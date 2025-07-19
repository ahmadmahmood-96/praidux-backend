const express = require("express");
const projectController = require("../controllers/projectController");
const router = express.Router();
const multer = require("multer");
const upload = require("../middleware/upload");

// For adding project
router.post(
  "/add-project",
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "logo", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  projectController.createProject
);
// For viewing all project
router.get("/view-projects", projectController.getAllProjects);

// For viewing project with given ID
router.get("/view-project/:id", projectController.getProjectById);

// For fetching only the projects that are listed on the website (listOnWebsite: true)
router.get("/public-projects", projectController.getPublicProjects);


// For updating project with given ID
router.put(
  "/update-project/:id",
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "logo", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  projectController.updateProject
);

// For deleting project with given ID
router.delete("/delete-project/:id", projectController.deleteProject);


router.put("/update-list-status/:id", projectController.updateListStatus);

module.exports = router;
