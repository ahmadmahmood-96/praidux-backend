// cloudinary.js - Improved version
const cloudinary = require("cloudinary").v2;
const sharp = require("sharp");
const fs = require("fs").promises;
const fsSync = require("fs");
const path = require("path");
const os = require("os");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Enhanced safe unlink with better error handling
const safeUnlink = async (filePath, maxRetries = 5, baseDelay = 200) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            // Check if file exists before attempting deletion
            await fs.access(filePath);
            await fs.unlink(filePath);
            return true;
        } catch (error) {
            if (error.code === 'ENOENT') {
                // File doesn't exist, consider it deleted
                return true;
            }

            if (error.code === 'EPERM' || error.code === 'EBUSY' || error.code === 'EMFILE') {
                // File is in use, wait and retry with exponential backoff
                const delay = baseDelay * Math.pow(2, i);
                console.log(`Attempt ${i + 1} failed for ${filePath}, retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));

                // Force garbage collection if available
                if (global.gc) {
                    global.gc();
                }
            } else {
                console.error(`Failed to delete ${filePath}:`, error.message);
                return false;
            }
        }
    }

    console.error(`Failed to delete ${filePath} after ${maxRetries} retries`);
    return false;
};

// Alternative method using synchronous deletion with better timing
const forceDeleteFile = (filePath) => {
    return new Promise((resolve) => {
        // Use setTimeout to ensure file handles are released
        setTimeout(() => {
            try {
                if (fsSync.existsSync(filePath)) {
                    fsSync.unlinkSync(filePath);
                }
                resolve(true);
            } catch (error) {
                console.error(`Force delete failed for ${filePath}:`, error.message);
                resolve(false);
            }
        }, 100);
    });
};

// const uploadToCloudinary = async (filePath) => {
//     const tempFileName = path.join(
//         os.tmpdir(),
//         `compressed_${Date.now()}_${Math.random().toString(36).substring(2)}.webp`
//     );

//     let sharpInstance = null;

//     try {
//         // 1️⃣ First compression attempt
//         sharpInstance = sharp(filePath);
//         await sharpInstance
//             .webp({
//                 quality: 80
//             })
//             .toFile(tempFileName);

//         // Explicitly destroy the sharp instance
//         if (sharpInstance) {
//             sharpInstance.destroy();
//             sharpInstance = null;
//         }

//         // 2️⃣ Check file size & recompress if needed
//         let stats = await fs.stat(tempFileName);
//         if (stats.size > 350 * 1024) {
//             // Delete the first file and create a new one with lower quality
//             await safeUnlink(tempFileName);

//             sharpInstance = sharp(filePath);
//             await sharpInstance
//                 .webp({
//                     quality: 75
//                 })
//                 .toFile(tempFileName);

//             // Explicitly destroy the sharp instance
//             if (sharpInstance) {
//                 sharpInstance.destroy();
//                 sharpInstance = null;
//             }
//         }

//         // 3️⃣ Upload to Cloudinary
//         const result = await cloudinary.uploader.upload(tempFileName, {
//             folder: "hikar_car_images",
//             resource_type: "image",
//         });

//         // 4️⃣ Clean up temp file with delay
//         await new Promise(resolve => setTimeout(resolve, 100));
//         await safeUnlink(tempFileName);

//         return result;
//     } catch (error) {
//         // Clean up sharp instance
//         if (sharpInstance) {
//             sharpInstance.destroy();
//         }

//         // Clean up temp file in case of error
//         await safeUnlink(tempFileName);
//         throw error;
//     }
// };

const uploadToCloudinary = async (filePath) => {
    const ext = path.extname(filePath).toLowerCase();

    // Supported image formats
    const supportedImageExts = ['.jpg', '.jpeg', '.png', '.webp'];

    // 🔒 If not an image, directly upload without using sharp
    if (!supportedImageExts.includes(ext)) {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: "hikar_car_files", // You can organize files differently
            resource_type: "auto",     // Let Cloudinary detect type (image, raw, video)
        });

        return result;
    }

    // ⬇️ your existing image compression and upload logic
    const tempFileName = path.join(
        os.tmpdir(),
        `compressed_${Date.now()}_${Math.random().toString(36).substring(2)}.webp`
    );

    let sharpInstance = null;

    try {
        sharpInstance = sharp(filePath);
        await sharpInstance
            .webp({ quality: 80 })
            .toFile(tempFileName);

        if (sharpInstance) {
            sharpInstance.destroy();
            sharpInstance = null;
        }

        let stats = await fs.stat(tempFileName);
        if (stats.size > 350 * 1024) {
            await safeUnlink(tempFileName);

            sharpInstance = sharp(filePath);
            await sharpInstance
                .webp({ quality: 75 })
                .toFile(tempFileName);

            if (sharpInstance) {
                sharpInstance.destroy();
                sharpInstance = null;
            }
        }

        const result = await cloudinary.uploader.upload(tempFileName, {
            folder: "hikar_car_images",
            resource_type: "image",
        });

        await new Promise(resolve => setTimeout(resolve, 100));
        await safeUnlink(tempFileName);

        return result;
    } catch (error) {
        if (sharpInstance) sharpInstance.destroy();
        await safeUnlink(tempFileName);
        throw error;
    }
};


const uploadVideoToCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "hikar_car_videos", // You can name this folder as needed
      resource_type: "video",
    });
    return result;
  } catch (error) {
    console.error("Video upload failed:", error.message);
    throw error;
  }
};

module.exports = {
    uploadToCloudinary,
    uploadVideoToCloudinary,
    safeUnlink,
    forceDeleteFile
};