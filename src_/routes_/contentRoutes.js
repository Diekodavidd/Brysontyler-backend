const express = require("express");
const multer = require("multer");

const router = express.Router();

const upload = multer({
    dest: "uploads/",

    limits: {
        fileSize: 10 * 1024 * 1024 * 1024, // 10GB
    },
});

const auth = require("../middleware_/authMiddleware");
const role = require("../middleware_/roleMiddleware");

const {
    uploadContent,
    uploadBrandContent,
    getGallery,
    watchContent,
    getAllContent,
    getMyContent,
    getContentById,
    updateContent,
    deleteContent,
    searchContent,
    getBrandGallery,
    deleteBrandVideo,uploadBrandGallery,uploadCreatorImages,
} = require("../controllers_/contentController");

/* =====================================================
   CREATOR VIDEO CONTENT
===================================================== */

router.post(
  "/upload",
  auth,
  upload.any(),
  uploadContent
);

/* =====================================================
   CREATOR IMAGE CONTENT
===================================================== */

router.post(
  "/upload-images",
  auth,
  upload.array("images", 20),
  uploadCreatorImages
);

/* =====================================================
   BRAND (ADMIN) CONTENT
===================================================== */

router.post(
  "/upload-brand",
  auth,
  role(["admin"]),
  (req, res, next) => {
    upload.fields([
      { name: "video", maxCount: 1 },
      { name: "preview", maxCount: 1 },
      { name: "thumbnail", maxCount: 1 },
    ])(req, res, (err) => {
      if (err) {
        console.error("MULTER ERROR:", err);
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }

      console.log("MULTER FINISHED");
      next();
    });
  },
  uploadBrandContent
);
router.post(
  "/upload-brand-gallery",
  auth,
  role(["admin"]),
  upload.array("images", 20),
  uploadBrandGallery
);
router.get(
    "/brand",
     auth,
        role(["admin"]),
    getBrandGallery
);
router.delete(
  "/brand/:id",
  auth,
  role(["admin"]),
  deleteBrandVideo
);
/* =====================================================
   GALLERY
===================================================== */

router.get(
    "/gallery",
    getGallery
);

router.get(
    "/watch/:id",
    auth,
    watchContent
);

/* =====================================================
   CONTENT
===================================================== */

router.get(
    "/",
    getAllContent
);

router.get(
    "/search",
    searchContent
);

router.get(
    "/my-content",
    auth,
    getMyContent
);

router.get(
    "/:id",
    getContentById
);

router.patch(
    "/:id",
    auth,
    updateContent
);

router.delete(
    "/:id",
    auth,
    deleteContent
);

module.exports = router;