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

        const response = await axios.post(
            "https://verification.didit.me/v3/session/",
            {

                workflow_id: process.env.DIDIT_WORKFLOW_ID,

                vendor_data: req.user._id.toString(),

                callback: `${process.env.FRONTEND_URL}/kyc-complete`,

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

        return res.json({

            success: true,

            sessionId: response.data.session_id,

            verificationUrl: response.data.url

        });

    }

    catch(error){

        console.error(error.response?.data || error);

        return res.status(500).json({

            error:error.response?.data || error.message

        });

    }

};
const User = require("../models_/user");

exports.diditWebhook = async (req, res) => {
    try {

        const { userId, status } = req.body;

        if (!userId || !status) {
            return res.status(400).json({
                error: "Missing webhook data."
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                error: "User not found."
            });
        }

        if (status === "approved") {

            user.isKYCVerified = true;

        } else if (status === "rejected") {

            user.isKYCVerified = false;

        }

        await user.save();

        res.sendStatus(200);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
};

exports.getKYCStatus = async (req, res) => {

    try {

        res.json({
            success: true,
            isKYCVerified: req.user.isKYCVerified
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};

exports.restartKYC = async (req, res) => {

    try {

        if (req.user.isKYCVerified) {
            return res.status(400).json({
                error: "KYC already completed."
            });
        }

        const verificationUrl =
            `${process.env.DIDIT_KYC_URL}?userId=${req.user._id}`;

        res.json({
            success: true,
            verificationUrl
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};