const express = require("express");
const multer = require("multer");

const router = express.Router();

const upload = multer({
    dest: "uploads/",
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
    deleteBrandVideo,
} = require("../controllers_/contentController");

/* =====================================================
   CREATOR CONTENT
===================================================== */

router.post(
  "/upload",
  auth,
  upload.any(),
  uploadContent
);

/* =====================================================
   BRAND (ADMIN) CONTENT
===================================================== */

router.post(
    "/upload-brand",
 auth,
    role(["admin"]),
    upload.fields([
        {
            name: "video",
            maxCount: 1,
        },
        {
            name: "preview",
            maxCount: 1,
        },
        {
            name: "thumbnail",
            maxCount: 1,
        },
    ]),
    uploadBrandContent
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