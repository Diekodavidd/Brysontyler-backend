const Content = require('../models_/content');
const cloudinary = require('../utils_/cloudinary');

exports.uploadContent = async (req, res) => {
    try {

        if (!req.file) {
            return res.status(400).json({
                error: "Please upload a file."
            });
        }

        if (!req.body.title) {
            return res.status(400).json({
                error: "Title is required."
            });
        }

        const protection = JSON.parse(req.body.protection || "{}");

        const result = await cloudinary.uploader.upload(
            req.file.path,
            {
                folder: "bryson-tyler/content",
                resource_type: "auto"
            }
        );

      const content = new Content({

    title: req.body.title.trim(),

    fileUrl: result.secure_url,

    cloudinaryId: result.public_id,

    creatorId: req.user._id,

    protection

});
        res.status(201).json({
            success: true,
            content
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
};

exports.getMyContent = async (req, res) => {
    try {

        const content = await Content.find({
            creatorId: req.user._id
        })
        .populate("taggedCreators", "name")
        .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: content.length,
            content
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
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
            content
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
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
                error: "Content not found."
            });
        }

        res.json({
            success: true,
            content
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
};

exports.updateContent = async (req, res) => {
    try {

        const content = await Content.findById(req.params.id);

        if (!content) {
            return res.status(404).json({
                error: "Content not found."
            });
        }

        if (content.creatorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                error: "Unauthorized."
            });
        }

        if (req.body.title) {
            content.title = req.body.title.trim();
        }

        if (req.body.protection) {
            content.protection = req.body.protection;
        }

        await content.save();

        res.json({
            success: true,
            content
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
};

exports.deleteContent = async (req, res) => {
    try {

        const content = await Content.findById(req.params.id);

        if (!content) {
            return res.status(404).json({
                error: "Content not found."
            });
        }

        if (content.creatorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                error: "Unauthorized."
            });
        }

await cloudinary.uploader.destroy(content.cloudinaryId);

await content.deleteOne();
        res.json({
            success: true,
            message: "Content deleted successfully."
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
};

exports.searchContent = async (req, res) => {
    try {

        const { q } = req.query;

        const content = await Content.find({
            title: {
                $regex: q || "",
                $options: "i"
            }
        })
        .populate("creatorId", "name");

        res.json({
            success: true,
            count: content.length,
            content
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
};

