const express = require("express");
const multer = require("multer");

const router = express.Router();

const upload = multer({
    dest: "uploads/",
});

const auth = require("../middleware_/authMiddleware");

const {
    uploadContent,
    getAllContent,
    getMyContent,
    getContentById,
    updateContent,
    deleteContent,
    searchContent,
} = require("../controllers_/contentController");

router.post(
    "/upload",
    auth,
    upload.fields([
        {
            name: "video",
            maxCount: 1,
        },
        {
            name: "thumbnail",
            maxCount: 1,
        },
    ]),
    uploadContent
);

router.get("/", getAllContent);

router.get("/search", searchContent);

router.get("/my-content", auth, getMyContent);

router.get("/:id", getContentById);

router.patch("/:id", auth, updateContent);

router.delete("/:id", auth, deleteContent);

module.exports = router;