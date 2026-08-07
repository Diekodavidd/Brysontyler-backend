const { AccessToken } = require('livekit-server-sdk');
const User = require("../models_/user");
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
.populate(
    "creatorId",
    "name profileImage isVerifiedCreator"
)
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


exports.likeLive = async (req, res) => {
    const session = await LiveSession.findById(req.params.id);

    if (!session) {
        return res.status(404).json({
            success: false,
            message: "Live session not found",
        });
    }

const alreadyLiked = session.likedBy.some(
    id => id.toString() === req.user._id.toString()
);
    if (alreadyLiked) {
        return res.json({
            success: true,
            likes: session.likes,
            liked: true,
        });
    }

    session.likes += 1;
    session.likedBy.push(req.user._id);

    await session.save();

    res.json({
        success: true,
        likes: session.likes,
        liked: true,
    });
};

exports.tipLive = async (req, res) => {

    try {

        const { coinType, quantity } = req.body;

        const session = await LiveSession.findById(req.params.id);

        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Live session not found",
            });
        }

        const sender = await User.findById(req.user._id);

        const creator = await User.findById(session.creatorId);

        if (!creator) {
            return res.status(404).json({
                success: false,
                message: "Creator not found",
            });
        }

        if (!["gold", "silver", "ruby"].includes(coinType)) {
            return res.status(400).json({
                success: false,
                message: "Invalid coin type",
            });
        }

        if (sender.coinBalances[coinType] < quantity) {
            return res.status(400).json({
                success: false,
                message: `Not enough ${coinType} coins`,
            });
        }

        sender.coinBalances[coinType] -= quantity;

        creator.coinBalances[coinType] += quantity;

        session.tips += quantity;

        await Promise.all([
            sender.save(),
            creator.save(),
            session.save(),
        ]);

        res.json({
            success: true,
            tips: session.tips,
            coinBalances: sender.coinBalances,
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Server Error",
        });

    }

};