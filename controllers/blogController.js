const Blog = require("../models/Blog");
const cloudinary = require("cloudinary").v2;
const { uploadToCloudinary, forceDeleteFile } = require("../utils/cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cleanupFiles = async (files) => {
  if (!files || files.length === 0) return;
  await new Promise((resolve) => setTimeout(resolve, 500));
  const deletePromises = files.map((file) => forceDeleteFile(file.path));
  await Promise.all(deletePromises);
};

// ✅ Get all blogs
exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.status(200).json({
      status: "success",
      message: "Blogs retrieved",
      result: blogs,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
// ✅ blogController.js
exports.getListedBlogs = async (req, res) => {
  try {
    const { skip = 0, limit = 6 } = req.query;
    const listedBlogs = await Blog.find({ listOnWebsite: true })
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));
    res.status(200).json(listedBlogs);
  } catch (error) {
    console.error("Error fetching listed blogs:", error);
    res.status(500).json({ message: "Failed to fetch listed blogs" });
  }
};

// ✅ Get blog by ID
exports.getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);
    if (!blog)
      return res
        .status(404)
        .json({ status: "fail", message: "Blog not found" });

    res.status(200).json({ status: "success", result: blog });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};


// ✅ Create blog
exports.createBlog = async (req, res) => {
  let uploadedFiles = [];

  try {
    const { writerName, blogTitle, categories, listOnWebsite, contentBlocks ,blogContent} =
      req.body;

    if (
      !writerName ||
      !blogTitle ||
      !categories ||
      !contentBlocks ||
      listOnWebsite === undefined
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ Start without blogImageUrl
   let blogImageUrl;
const blogImageFile = req.files?.find((f) => f.fieldname === "blogImage");
if (blogImageFile) {
  const result = await uploadToCloudinary(blogImageFile.path);
  blogImageUrl = result.secure_url;
  uploadedFiles.push(blogImageFile);
}

    // ✅ Parse blocks
    let parsedBlocks = JSON.parse(contentBlocks);

    // ✅ Upload block media if any
    for (let block of parsedBlocks) {
      if (block.tempFileKey) {
        const file = req.files.find((f) => f.fieldname === block.tempFileKey);

        if (file) {
          const result = await uploadToCloudinary(file.path);
          block.mediaUrl = result.secure_url;
          block.mediaType = file.mimetype.startsWith("video")
            ? "video"
            : "image";
          uploadedFiles.push(file);
        }
      }
    }

    // ✅ Build blog object
    const blogData = {
      writerName,
      blogTitle,
      categories: JSON.parse(categories),
      contentBlocks: parsedBlocks,
      listOnWebsite,
      blogContent,
    };

    // Only set blogImageUrl if uploaded
    if (blogImageUrl) {
      blogData.blogImageUrl = blogImageUrl;
    }

    const newBlog = await Blog.create(blogData);

    setImmediate(() => cleanupFiles(uploadedFiles));

    return res.status(201).json({
      message: "Blog created successfully",
      result: newBlog,
    });
  } catch (error) {
    setImmediate(() => cleanupFiles(uploadedFiles));
    return res.status(500).json({ message: error.message });
  }
};



exports.updateBlog = async (req, res) => {
  const { id } = req.params;
  let uploadedFiles = [];

  try {
    const existing = await Blog.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const { writerName, blogTitle, categories, listOnWebsite, contentBlocks ,blogContent} =
      req.body;

    const updateData = {};
    if (writerName !== undefined) updateData.writerName = writerName;
    if (blogTitle !== undefined) updateData.blogTitle = blogTitle;
    if (categories !== undefined)
      updateData.categories = JSON.parse(categories);
    if (listOnWebsite !== undefined) updateData.listOnWebsite = listOnWebsite;
    if (blogContent !== undefined) updateData.blogContent = blogContent;

    // ✅ Handle blog image update
    const blogImageFile = req.files.find((f) => f.fieldname === "blogImage");
    if (blogImageFile) {
      const result = await uploadToCloudinary(blogImageFile.path);
      updateData.blogImageUrl = result.secure_url;
      uploadedFiles.push(blogImageFile);
    } else {
      updateData.blogImageUrl = existing.blogImageUrl;
    }

    // ✅ Handle contentBlocks
    if (contentBlocks !== undefined) {
      let parsedBlocks = JSON.parse(contentBlocks);

      let mergedBlocks = await Promise.all(
        parsedBlocks.map(async (block, idx) => {
          if (block.tempFileKey) {
            const file = req.files.find(
              (f) => f.fieldname === block.tempFileKey
            );
            if (file) {
              const result = await uploadToCloudinary(file.path);
              uploadedFiles.push(file);
              return {
                ...block,
                mediaUrl: result.secure_url,
                mediaType: file.mimetype.startsWith("video")
                  ? "video"
                  : "image",
              };
            }
          }
          // ✅ no new file → keep existing media
          if (existing.contentBlocks[idx]?.mediaUrl && !block.mediaUrl) {
            return {
              ...block,
              mediaUrl: existing.contentBlocks[idx].mediaUrl,
              mediaType: existing.contentBlocks[idx].mediaType,
            };
          }
          return block;
        })
      );

      updateData.contentBlocks = mergedBlocks;
    }

    const updatedBlog = await Blog.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    setImmediate(() => cleanupFiles(uploadedFiles));

    return res.status(200).json({
      message: "Blog updated successfully",
      result: updatedBlog,
    });
  } catch (error) {
    setImmediate(() => cleanupFiles(uploadedFiles));
    return res.status(500).json({ message: error.message });
  }
};

// ✅ Delete blog
exports.deleteBlog = async (req, res) => {
  const { id } = req.params;

  try {
    const blog = await Blog.findById(id);
    if (!blog) {
      return res
        .status(404)
        .json({ status: "fail", message: "Blog not found" });
    }

    await Blog.findByIdAndDelete(id);

    return res.status(200).json({
      status: "success",
      message: "Blog deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

// ✅ Update listOnWebsite only
exports.updateBlogListStatus = async (req, res) => {
  const { id } = req.params;
  const { listOnWebsite } = req.body;

  if (typeof listOnWebsite !== "boolean") {
    return res.status(400).json({
      status: "fail",
      message: "listOnWebsite must be a boolean",
    });
  }

  try {
    const updated = await Blog.findByIdAndUpdate(
      id,
      { listOnWebsite },
      { new: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ status: "fail", message: "Blog not found" });
    }

    return res.status(200).json({
      status: "success",
      message: "Status updated",
      result: updated,
    });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};
