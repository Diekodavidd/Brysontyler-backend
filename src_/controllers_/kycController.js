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
console.log("DIDIT WEBHOOK RECEIVED");
console.log(req.body);

    try {

        const sessionId = req.body.session_id;

        const status =
            req.body.review?.status ||
            req.body.status;

        const user = await User.findOne({
            "didit.sessionId": sessionId
        });

        if (!user) {

            return res.status(404).json({
                error: "User not found."
            });

        }

        if (status === "approved") {

            user.isKYCVerified = true;

            user.kycStatus = "approved";

            user.didit.status = "approved";

            user.didit.verifiedAt = new Date();

            user.creatorVerification.verified = true;

            user.isVerifiedCreator = true;

        }

        if (status === "rejected") {

            user.isKYCVerified = false;

            user.kycStatus = "rejected";

            user.didit.status = "rejected";

            user.creatorVerification.verified = false;

            user.isVerifiedCreator = false;

        }

        await user.save();

        res.sendStatus(200);

    }

    catch (error) {

        console.error(error);

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

            creatorVerification: user.creatorVerification,

            isVerifiedCreator: user.isVerifiedCreator

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

    user.creatorVerification.stageName =
        req.body.stageName;

    user.creatorVerification.category =
        req.body.category;

    user.creatorVerification.socialLinks =
        req.body.socialLinks;

    await user.save();

    res.json({
        success: true,
        creatorVerification:
            user.creatorVerification
    });

};