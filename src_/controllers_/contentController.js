const Content = require("../models_/content");
const cloudinary = require("../utils_/cloudinary");
const uploadToBunny = require("../utils_/bunny");

const { v4: uuid } = require("uuid");
const path = require("path");
const fs = require("fs");
const axios = require("axios");

exports.uploadContent = async (req, res) => {
    try {

        const video = req.files?.video?.[0];
        const thumbnail = req.files?.thumbnail?.[0];

        if (!video) {
            return res.status(400).json({
                error: "Video is required.",
            });
        }

        if (!thumbnail) {
            return res.status(400).json({
                error: "Thumbnail is required.",
            });
        }

        if (!req.body.title) {
            return res.status(400).json({
                error: "Title is required.",
            });
        }

        const videoExtension = path.extname(video.originalname);
        const videoName = `${uuid()}${videoExtension}`;

        const bunnyVideo = await uploadToBunny(
            video.path,
            videoName
        );

        const thumb = await cloudinary.uploader.upload(
            thumbnail.path,
            {
                folder: "bryson-tyler/thumbnails",
            }
        );

        fs.unlinkSync(video.path);
        fs.unlinkSync(thumbnail.path);

        const content = new Content({

            creatorId: req.user._id,

            title: req.body.title.trim(),

            description: req.body.description || "",

            category: req.body.category || "",

            tags: req.body.tags
                ? JSON.parse(req.body.tags)
                : [],

            visibility: req.body.visibility || "Free",

            price: Number(req.body.price || 0),

            releaseDate: req.body.releaseDate || null,

            releaseTime: req.body.releaseTime || null,

            status: req.body.status || "pending_review",

            type: "video",

            fileUrl: bunnyVideo.fileUrl,

            storageProvider: "bunny",

            storageKey: bunnyVideo.fileName,

            thumbnail: thumb.secure_url,

            thumbnailCloudinaryId: thumb.public_id,

            taggedCreators: req.body.taggedCreators
                ? JSON.parse(req.body.taggedCreators)
                : [],

            approvedCollaborators: [],

            protection: req.body.protection
                ? JSON.parse(req.body.protection)
                : {},

        });

        await content.save();

        console.log("CONTENT SAVED:", content);

        res.status(201).json({
            success: true,
            content,
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            error: error.message,
        });

    }
};

exports.getMyContent = async (req, res) => {

    try {

        const content = await Content.find({
            creatorId: req.user._id,
        })
        .populate("taggedCreators", "name")
        .sort({
            createdAt: -1,
        });

        console.log("MY CONTENT:", content);

        res.json({
            success: true,
            count: content.length,
            content,
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            error: error.message,
        });

    }

};

exports.getAllContent = async (req, res) => {
    try {

        const content = await Content.find()
            .populate("creatorId", "name")
            .populate("taggedCreators", "name")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: content.length,
            content,
        });

    } catch (error) {

        res.status(500).json({
            error: error.message,
        });

    }
};

exports.getContentById = async (req, res) => {
    try {

        const content = await Content.findById(req.params.id)
            .populate("creatorId", "name email")
            .populate("taggedCreators", "name");

        if (!content) {
            return res.status(404).json({
                error: "Content not found.",
            });
        }

        res.json({
            success: true,
            content,
        });

    } catch (error) {

        res.status(500).json({
            error: error.message,
        });

    }
};

exports.updateContent = async (req, res) => {
    try {

        const content = await Content.findById(req.params.id);

        if (!content) {
            return res.status(404).json({
                error: "Content not found.",
            });
        }

        if (
            content.creatorId.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                error: "Unauthorized.",
            });
        }

        if (req.body.title)
            content.title = req.body.title.trim();

        if (req.body.description)
            content.description = req.body.description;

        if (req.body.category)
            content.category = req.body.category;

        if (req.body.visibility)
            content.visibility = req.body.visibility;

        if (req.body.price)
            content.price = req.body.price;

        if (req.body.releaseDate)
            content.releaseDate =
                req.body.releaseDate;

        if (req.body.releaseTime)
            content.releaseTime =
                req.body.releaseTime;

        if (req.body.tags)
            content.tags = req.body.tags;

        await content.save();

        res.json({
            success: true,
            content,
        });

    } catch (error) {

        res.status(500).json({
            error: error.message,
        });

    }
};

exports.deleteContent = async (req, res) => {
    try {

        const content = await Content.findById(req.params.id);

        if (!content) {
            return res.status(404).json({
                error: "Content not found.",
            });
        }

        if (
            content.creatorId.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                error: "Unauthorized.",
            });
        }

        await axios.delete(
            `${process.env.BUNNY_STORAGE_HOST}/${process.env.BUNNY_STORAGE_ZONE}/${content.storageKey}`,
            {
                headers: {
                    AccessKey:
                        process.env.BUNNY_STORAGE_PASSWORD,
                },
            }
        );

        if (content.thumbnailCloudinaryId) {
            await cloudinary.uploader.destroy(
                content.thumbnailCloudinaryId
            );
        }

        await content.deleteOne();

        res.json({
            success: true,
            message: "Content deleted successfully.",
        });

    } catch (error) {

        res.status(500).json({
            error: error.message,
        });

    }
};

exports.searchContent = async (req, res) => {
    try {

        const { q } = req.query;

        const content = await Content.find({
            title: {
                $regex: q || "",
                $options: "i",
            },
        }).populate("creatorId", "name");

        res.json({
            success: true,
            count: content.length,
            content,
        });

    } catch (error) {

        res.status(500).json({
            error: error.message,
        });

    }
};