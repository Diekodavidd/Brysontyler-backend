const express = require('express');
const router = express.Router();
const {
    uploadContent,
    getAllContent,
    getMyContent,
    getContentById,
    updateContent,
    deleteContent,
    searchContent
} = require("../controllers_/contentController");
const auth = require('../middleware_/authMiddleware');
const upload = require('multer')({ dest: 'uploads/' });

router.post("/upload", auth, upload.single("file"), uploadContent);

router.get("/", getAllContent);

router.get("/search", searchContent);

router.get("/my-content", auth, getMyContent);

router.get("/:id", getContentById);

router.patch("/:id", auth, updateContent);

router.delete("/:id", auth, deleteContent);


module.exports = router;