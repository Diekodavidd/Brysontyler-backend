const { AccessToken } = require('livekit-server-sdk');
const LiveSession = require("../models_/liveSession");

exports.createLiveSession = async (req, res) => {
    try {

        const { title } = req.body;

        if (!title) {
            return res.status(400).json({
                error: "Session title is required."
            });
        }

        const existingSession = await LiveSession.findOne({
            creatorId: req.user._id,
            isLive: true
        });

        if (existingSession) {
            return res.status(400).json({
                error: "You already have an active live session."
            });
        }

        const roomName = `bt-live-${Date.now()}`;

        const token = new AccessToken(
            process.env.LIVEKIT_API_KEY,
            process.env.LIVEKIT_API_SECRET,
            {
                identity: req.user.name
            }
        );

        token.addGrant({
            roomJoin: true,
            room: roomName,
            canPublish: true,
            canSubscribe: true
        });

        const jwt = await token.toJwt();

        const session = await LiveSession.create({
            creatorId: req.user._id,
            roomName,
            title
        });

        res.status(201).json({
            success: true,
            session,
            token: jwt,
            joinUrl: `${process.env.LIVEKIT_URL}/${roomName}`
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
};

exports.getLiveSessions = async (req, res) => {
    try {

        const sessions = await LiveSession.find({
            isLive: true
        })
        .populate("creatorId", "name");

        res.json({
            success: true,
            count: sessions.length,
            sessions
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
};

exports.getMySessions = async (req, res) => {
    try {

        const sessions = await LiveSession.find({
            creatorId: req.user._id
        })
        .sort({
            createdAt: -1
        });

        res.json({
            success: true,
            count: sessions.length,
            sessions
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
};

exports.getLiveSessionById = async (req, res) => {
    try {

        const session = await LiveSession.findById(req.params.id)
            .populate("creatorId", "name");

        if (!session) {
            return res.status(404).json({
                error: "Live session not found."
            });
        }

        res.json({
            success: true,
            session
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
};

exports.joinLiveSession = async (req, res) => {
    try {

        const session = await LiveSession.findById(req.params.id);

        if (!session) {
            return res.status(404).json({
                error: "Live session not found."
            });
        }

        if (!session.isLive) {
            return res.status(400).json({
                error: "This live session has ended."
            });
        }

        const token = new AccessToken(
            process.env.LIVEKIT_API_KEY,
            process.env.LIVEKIT_API_SECRET,
            {
                identity: req.user.name
            }
        );

        token.addGrant({
            roomJoin: true,
            room: session.roomName,
            canPublish: false,
            canSubscribe: true
        });

        session.viewers += 1;

        await session.save();

        res.json({
            success: true,
            token: await token.toJwt(),
            roomName: session.roomName
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
};

exports.leaveLiveSession = async (req, res) => {
    try {

        const session = await LiveSession.findById(req.params.id);

        if (!session) {
            return res.status(404).json({
                error: "Live session not found."
            });
        }

        if (session.viewers > 0) {
            session.viewers -= 1;
        }

        await session.save();

        res.json({
            success: true,
            message: "Left live session."
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
};

exports.endLiveSession = async (req, res) => {
    try {

        const session = await LiveSession.findById(req.params.id);

        if (!session) {
            return res.status(404).json({
                error: "Live session not found."
            });
        }

        if (session.creatorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                error: "Unauthorized."
            });
        }

        session.isLive = false;

        await session.save();

        res.json({
            success: true,
            message: "Live session ended."
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
};
