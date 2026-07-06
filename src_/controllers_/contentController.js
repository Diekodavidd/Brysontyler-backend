const Content = require("../models_/content");
const cloudinary = require("../utils_/cloudinary");
const uploadToBunny = require("../utils_/bunny");
const { v4: uuid } = require("uuid");
const path = require("path");
const fs = require("fs");
const axios = require("axios");

exports.uploadContent = async (req, res) => {

        console.log("=========== UPLOAD ===========");

        console.log("BODY");
        console.log(req.body);

        console.log("FILES");
        console.log(req.files);

        console.log("VIDEO");
        console.log(req.files?.video);

        console.log("PREVIEW");
        console.log(req.files?.preview);

        console.log("THUMBNAIL");
        console.log(req.files?.thumbnail);
    try {
        const video = req.files?.video?.[0];
        const preview = req.files?.preview?.[0];
        const thumbnail = req.files?.thumbnail?.[0];

        if (!video) {
            return res.status(400).json({
                error: "Video is required.",
            });
        }

        if (!preview) {
            return res.status(400).json({
                error: "Preview video is required.",
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

        /* -----------------------------
           Upload Full Video
        ------------------------------ */

        const videoExtension = path.extname(
            video.originalname
        );

        const videoName =
            `${uuid()}${videoExtension}`;

        const bunnyVideo =
            await uploadToBunny(
                video.path,
                videoName
            );

        /* -----------------------------
           Upload Preview
        ------------------------------ */

        const previewExtension = path.extname(
            preview.originalname
        );

        const previewName =
            `${uuid()}${previewExtension}`;

        const bunnyPreview =
            await uploadToBunny(
                preview.path,
                previewName
            );

        /* -----------------------------
           Upload Thumbnail
        ------------------------------ */

        const thumb =
            await cloudinary.uploader.upload(
                thumbnail.path,
                {
                    folder:
                        "bryson-tyler/thumbnails",
                }
            );

        if (fs.existsSync(thumbnail.path)) {
            fs.unlinkSync(thumbnail.path);
        }

        /* -----------------------------
           Create Content
        ------------------------------ */

        const content =
            await Content.create({

                creatorId: req.user._id,

                title: req.body.title.trim(),

                description:
                    req.body.description || "",

                category:
                    req.body.category || "General",

                tags: req.body.tags
                    ? JSON.parse(req.body.tags)
                    : [],

                visibility:
                    req.body.visibility || "free",

                membership:
                    req.body.membership || "free",

                price: Number(
                    req.body.price || 0
                ),

                releaseDate:
                    req.body.releaseDate || null,

                status:
                    req.body.status ||
                    "pending_review",

                featured:
                    req.body.featured === "true",

                allowComments:
                    req.body.allowComments !==
                    "false",

                duration: Number(
                    req.body.duration || 0
                ),
ownerType: "creator",

mediaType: req.body.type || "video",

                brandCollection:
                    req.body.brandCollection || "",

                fileUrl:
                    bunnyVideo.fileUrl,

                storageProvider:
                    "bunny",

                storageKey:
                    bunnyVideo.fileName,

                previewUrl:
                    bunnyPreview.fileUrl,

                previewStorageKey:
                    bunnyPreview.fileName,

                thumbnail:
                    thumb.secure_url,

                thumbnailCloudinaryId:
                    thumb.public_id,

                taggedCreators:
                    req.body.taggedCreators
                        ? JSON.parse(
                              req.body.taggedCreators
                          )
                        : [],

                approvedCollaborators: [],

                protection:
                    req.body.protection
                        ? JSON.parse(
                              req.body.protection
                          )
                        : {},
            });

        return res.status(201).json({
            success: true,
            message:
                "Content uploaded successfully.",
            content,
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
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

exports.uploadBrandContent = async (req, res) => {
   console.log("REQ.USER:", req.user);
    try {

        const video = req.files?.video?.[0];
        const preview = req.files?.preview?.[0];
        const thumbnail = req.files?.thumbnail?.[0];

        if (!video) {
            return res.status(400).json({
                error: "Video is required.",
            });
        }

        if (!preview) {
            return res.status(400).json({
                error: "Preview video is required.",
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

        /* -----------------------------
           Upload Full Video
        ----------------------------- */

        const videoExtension = path.extname(
            video.originalname
        );

        const videoName =
            `${uuid()}${videoExtension}`;

        const bunnyVideo =
            await uploadToBunny(
                video.path,
                videoName
            );

        /* -----------------------------
           Upload Preview
        ----------------------------- */

        const previewExtension = path.extname(
            preview.originalname
        );

        const previewName =
            `${uuid()}${previewExtension}`;

        const bunnyPreview =
            await uploadToBunny(
                preview.path,
                previewName
            );

        /* -----------------------------
           Upload Thumbnail
        ----------------------------- */

        const thumb =
            await cloudinary.uploader.upload(
                thumbnail.path,
                {
                    folder:
                        "bryson-tyler/thumbnails",
                }
            );

        if (fs.existsSync(thumbnail.path)) {
            fs.unlinkSync(thumbnail.path);
        }

        /* -----------------------------
           Save Content
        ----------------------------- */
console.log("TYPE RECEIVED:", req.body.type);
        const content =
            await Content.create({

                creatorId: req.user._id,

                title: req.body.title.trim(),

                description:
                    req.body.description || "",

                category:
                    req.body.category || "General",

                tags: req.body.tags
                    ? JSON.parse(req.body.tags)
                    : [],
geoBlocking: req.body.geoBlocking
    ? JSON.parse(req.body.geoBlocking)
    : {
          enabled: false,
          blockedCountries: [],
      },
                visibility:
                    req.body.visibility || "free",

                membership:
                    req.body.membership || "free",

                price: Number(
                    req.body.price || 0
                ),

                releaseDate:
                    req.body.releaseDate || null,

                status: "published",

                featured:
                    req.body.featured === "true",

                allowComments:
                    req.body.allowComments !== "false",

                duration: Number(
                    req.body.duration || 0
                ),

                ownerType: "brand",

mediaType: req.body.type || "video",

                brandCollection:
                    req.body.brandCollection || "Bryson Tyler Originals",

                fileUrl:
                    bunnyVideo.fileUrl,

                storageProvider: "bunny",

                storageKey:
                    bunnyVideo.fileName,

                previewUrl:
                    bunnyPreview.fileUrl,

                previewStorageKey:
                    bunnyPreview.fileName,

                thumbnail:
                    thumb.secure_url,

                thumbnailCloudinaryId:
                    thumb.public_id,

                taggedCreators:
                    req.body.taggedCreators
                        ? JSON.parse(
                              req.body.taggedCreators
                          )
                        : [],

                approvedCollaborators: [],

                protection:
                    req.body.protection
                        ? JSON.parse(
                              req.body.protection
                          )
                        : {},

            });

        return res.status(201).json({
            success: true,
            message: "Brand content uploaded successfully.",
            content,
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            error: error.message,
        });

    }
};

exports.getGallery = async (req, res) => {
    try {

        const videos = await Content.find({
            status: "published",
            type: "brand",
        })
        .sort({ createdAt: -1 });

        res.json({
            success: true,
            videos,
        });

    } catch (err) {

        res.status(500).json({
            error: err.message,
        });

    }
};

exports.watchContent = async (req, res) => {
    try {

        const content = await Content.findById(
            req.params.id
        );

        if (!content) {
            return res.status(404).json({
                success: false,
                error: "Video not found.",
            });
        }

        content.views += 1;
        await content.save();

        const userPlan =
            req.user?.membership?.plan?.toLowerCase() ||
            "free";

        const levels = {
            free: 1,
            vip: 2,
            elite: 3,
        };

        const required =
            levels[
                content.membership.toLowerCase()
            ];

        const current =
            levels[userPlan];

        const unlocked =
            current >= required;

        if (!unlocked) {

            return res.json({
                success: true,

                locked: true,

                membership:
                    content.membership,

                content: {
                    _id: content._id,
                    title: content.title,
                    description:
                        content.description,
                    thumbnail:
                        content.thumbnail,
                    duration:
                        content.duration,
                    previewUrl:
                        content.previewUrl,
                    views:
                        content.views,
                },
            });

        }

        return res.json({
            success: true,

            locked: false,

            content,
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            error: error.message,
        });

    }
};

exports.getBrandGallery = async (req, res) => {
  try {
    const videos = await Content.find({
      type: "brand",
    }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      videos,
    });

  } catch (err) {
    console.error("GET BRAND GALLERY ERROR:", err);

    res.status(500).json({
      success: false,
      error: err.message,
      stack: err.stack,
    });
  }
};

exports.deleteBrandVideo = async (req, res) => {
  try {
    const video = await Content.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        error: "Video not found.",
      });
    }

    await video.deleteOne();

    res.json({
      success: true,
      message: "Video deleted.",
    });

  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};