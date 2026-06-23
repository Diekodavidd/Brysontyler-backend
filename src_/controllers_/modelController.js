const Model = require('../models_/model');
const { sendEmail } = require('../utils_/mailer');

exports.addModel = async (req, res) => {
    try {

        const {
            fullName,
            stageName,
            email,
            photos,
            verificationDocuments,
            consentFormUrl
        } = req.body;

        if (!fullName || !email) {
            return res.status(400).json({
                error: "Full name and email are required."
            });
        }

        const model = await Model.create({
            creatorId: req.user._id,
            fullName,
            stageName,
            email: email.toLowerCase().trim(),
            photos,
            verificationDocuments,
            consentFormUrl
        });

        res.status(201).json({
            success: true,
            model
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
};

exports.getMyModels = async (req, res) => {
    try {

        const models = await Model.find({
            creatorId: req.user._id
        }).sort({
            createdAt: -1
        });

        res.json({
            success: true,
            count: models.length,
            models
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
};

exports.sendModelApprovalLink = async (req, res) => {
    try {

        const { modelId } = req.body;

        const model = await Model.findById(modelId);

        if (!model) {
            return res.status(404).json({
                error: "Model not found."
            });
        }

        if (model.creatorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                error: "Unauthorized."
            });
        }

        const approvalLink =
            `${process.env.BACKEND_URL}/api/models/approve/${modelId}`;

        await sendEmail({
            to: model.email,
            subject: "Approve Your Participation",
            html: `
                <p>Please review and approve your participation.</p>
                <a href="${approvalLink}">
                    Approve Participation
                </a>
            `
        });

        res.json({
            success: true,
            message: "Approval email sent."
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
};

exports.approveModel = async (req, res) => {
    try {

        const { modelId } = req.params;

        const model = await Model.findById(modelId);

        if (!model) {
            return res.status(404).json({
                error: "Model not found."
            });
        }

        model.approvalStatus = "approved";
        model.approvedByModel = true;

        await model.save();

        res.json({
            success: true,
            message: "Participation approved."
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
};



exports.getModelById = async (req, res) => {

    try {

        const model = await Model.findById(req.params.id);

        if (!model) {
            return res.status(404).json({
                error: "Model not found."
            });
        }

        if (model.creatorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                error: "Unauthorized."
            });
        }

        res.json({
            success: true,
            model
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};



exports.updateModel = async (req, res) => {

    try {

        const model = await Model.findById(req.params.id);

        if (!model) {
            return res.status(404).json({
                error: "Model not found."
            });
        }

        if (model.creatorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                error: "Unauthorized."
            });
        }

        Object.assign(model, req.body);

        await model.save();

        res.json({
            success: true,
            model
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};

exports.rejectModel = async (req, res) => {

    try {

        const model = await Model.findById(req.params.modelId);

        if (!model) {
            return res.status(404).json({
                error: "Model not found."
            });
        }

        model.approvalStatus = "rejected";
        model.approvedByModel = false;

        await model.save();

        res.json({
            success: true,
            message: "Participation rejected."
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};

exports.deleteModel = async (req, res) => {
    try {

        const model = await Model.findById(req.params.id);

        if (!model) {
            return res.status(404).json({
                error: "Model not found."
            });
        }

        if (model.creatorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                error: "Unauthorized."
            });
        }

        await Model.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: "Model deleted successfully."
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
};