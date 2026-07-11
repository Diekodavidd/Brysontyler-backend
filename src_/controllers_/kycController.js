const axios = require ("axios");

exports.startKYC = async (req, res) => {
    try {

        if (!req.user) {
            return res.status(401).json({
                error: "Unauthorized"
            });
        }

        if (req.user.isKYCVerified) {
            return res.status(400).json({
                error: "User already verified."
            });
        }

        // Default callback is onboarding
        // Restart KYC can override this
        const callback =
            req.body.callback ||
            `${process.env.FRONTEND_URL}/kyc-complete`;

        const response = await axios.post(
            "https://verification.didit.me/v3/session/",
            {
                workflow_id: process.env.DIDIT_WORKFLOW_ID,

                vendor_data: req.user._id.toString(),

                callback,

                callback_method: "both",

                language: "en",

                metadata: {
                    userId: req.user._id
                },

                contact_details: {
                    email: req.user.email,
                    send_notification_emails: false
                }
            },
            {
                headers: {
                    "x-api-key": process.env.DIDIT_API_KEY,
                    "Content-Type": "application/json"
                }
            }
        );

        const user = await User.findById(req.user._id);

        user.didit.workflowId = process.env.DIDIT_WORKFLOW_ID;
        user.didit.sessionId = response.data.session_id;
        user.didit.sessionToken = response.data.token || "";
        user.didit.verificationUrl = response.data.url;
        user.didit.status = "pending";

        await user.save();

        return res.json({
            success: true,
            sessionId: response.data.session_id,
            verificationUrl: response.data.url
        });

    } catch (error) {

        console.error(error.response?.data || error);

        return res.status(500).json({
            error: error.response?.data || error.message
        });

    }
};
const User = require("../models_/user");

exports.diditWebhook = async (req, res) => {
    try {

        console.log("DIDIT WEBHOOK RECEIVED");
        console.log(req.body);

        const status = (
            req.body.status ||
            req.body.decision?.status ||
            ""
        ).toLowerCase();

        const userId =
            req.body.metadata?.userId ||
            req.body.vendor_data;

        if (!userId) {
            return res.status(400).json({
                error: "Missing userId."
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                error: "User not found."
            });
        }

        user.didit.status = status;

        if (status === "approved") {

            user.isKYCVerified = true;
            user.kycStatus = "approved";
            user.didit.verifiedAt = new Date();

            // user.creatorApplication.verified = true;
            // user.isVerifiedCreator = true;

        }

        if (status === "rejected") {

            user.isKYCVerified = false;
            user.kycStatus = "rejected";

            // user.creatorApplication.verified = false;
            // user.isVerifiedCreator = false;

        }

        await user.save();
        console.log(user);

        console.log("UPDATED USER:", user.didit.status);

        res.sendStatus(200);

    } catch (err) {

        console.error(err);

        res.sendStatus(500);

    }
};

exports.getKYCStatus = async (req, res) => {

    try {

        const user = await User.findById(req.user._id);

        res.json({

            success: true,

            isKYCVerified: user.isKYCVerified,

            kycStatus: user.kycStatus,

            didit: user.didit,

            creatorApplication:
user.creatorApplication,

creatorApproval:
user.creatorApproval,

        });

    }

    catch (error) {

        res.status(500).json({

            error: error.message

        });

    }

};

// exports.restartKYC = async (req, res) => {

//     try {

//         if (req.user.isKYCVerified) {
//             return res.status(400).json({
//                 error: "KYC already completed."
//             });
//         }

//         const verificationUrl =
//             `${process.env.DIDIT_KYC_URL}?userId=${req.user._id}`;

//         res.json({
//             success: true,
//             verificationUrl
//         });

//     } catch (error) {

//         res.status(500).json({
//             error: error.message
//         });

//     }

// };


exports.restartKYC = async (req, res) => {
    return exports.startKYC(req, res);
};

exports.updateCreatorProfile = async (req, res) => {

    const user = await User.findById(req.user._id);

    user.creatorApplication.stageName =
        req.body.stageName;

    user.creatorApplication.category =
        req.body.category;

    user.creatorApplication.socialLinks =
        req.body.socialLinks;

    await user.save();

    res.json({
        success: true,
        creatorApplication:
            user.creatorApplication
    });

};