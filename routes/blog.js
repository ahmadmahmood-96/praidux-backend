const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blogController");
const upload = require("../middleware/upload");

router.post(
  "/add-blog",
  upload.fields([{ name: "blogImage", maxCount: 1 }]),
  blogController.createBlog
);

router.get("/view-blogs", blogController.getAllBlogs);

router.get("/view-blog/:id", blogController.getBlogById);

router.put(
  "/update-blog/:id",
  upload.fields([{ name: "blogImage", maxCount: 1 }]),
  blogController.updateBlog
);

router.delete("/delete-blog/:id", blogController.deleteBlog);

router.put("/update-blog-list-status/:id", blogController.updateBlogListStatus);

module.exports = router;
