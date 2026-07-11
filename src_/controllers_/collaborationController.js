const Collaboration = require('../models_/collaboration');
const Content = require('../models_/content');

const User = require("../models_/user");
exports.sendCollaborationRequest = async (req, res) => {

  try {

    const {
      receiverId,
      message,
    } = req.body;

    if (!receiverId) {
      return res.status(400).json({
        error: "Receiver is required.",
      });
    }

    if (
      receiverId === req.user._id.toString()
    ) {
      return res.status(400).json({
        error: "You cannot collaborate with yourself.",
      });
    }

    const receiver =
      await User.findById(receiverId);

    if (!receiver) {
      return res.status(404).json({
        error: "Creator not found.",
      });
    }

    const exists =
      await Collaboration.findOne({

        senderId: req.user._id,

        receiverId,

        status: "pending",

      });

    if (exists) {

      return res.status(400).json({

        error:
          "You already have a pending request.",

      });

    }

    const collaboration =
      await Collaboration.create({

        senderId: req.user._id,

        receiverId,

        message,

        status: "pending",

      });

    res.status(201).json({

      success: true,

      collaboration,

    });

  }

  catch (error) {

    res.status(500).json({

      error: error.message,

    });

  }

};

exports.respondToCollaboration = async (req, res) => {
    try {

        const { requestId, status } = req.body;

        if (!requestId || !["accepted", "rejected"].includes(status)) {
            return res.status(400).json({
                error: "Invalid request."
            });
        }

        const request = await Collaboration.findById(requestId);

        if (!request) {
            return res.status(404).json({
                error: "Collaboration request not found."
            });
        }

        if (request.receiverId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                error: "You are not authorized to respond to this request."
            });
        }

        request.status = status;

        await request.save();

        res.json({
            success: true,
            request
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
};

exports.tagCollaborator = async (req, res) => {
    try {

        const { contentId, collaboratorId } = req.body;

        if (!contentId || !collaboratorId) {
            return res.status(400).json({
                error: "Content and collaborator are required."
            });
        }

        const content = await Content.findById(contentId);

        if (!content) {
            return res.status(404).json({
                error: "Content not found."
            });
        }

        if (content.creatorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                error: "You can only tag collaborators on your own content."
            });
        }

        const collaborator = await User.findById(collaboratorId);

        if (!collaborator) {
            return res.status(404).json({
                error: "Collaborator not found."
            });
        }

        if (!content.taggedCreators.includes(collaboratorId)) {

            content.taggedCreators.push(collaboratorId);

            await content.save();

        }

        res.json({
            success: true,
            message: "Collaborator tagged successfully."
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
};

exports.getMyRequests = async (req, res) => {
    try {

        const requests = await Collaboration.find({
            senderId: req.user._id
        })
        .populate("receiverId", "name email")
        .populate("contentId", "title")
        .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: requests.length,
            requests
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
};

exports.getIncomingRequests = async (req, res) => {
    try {

        const requests = await Collaboration.find({
            receiverId: req.user._id
        })
        .populate("senderId", "name email")
        .populate("contentId", "title")
        .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: requests.length,
            requests
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
};

exports.getCollaborationById = async (req, res) => {
    try {

        const request = await Collaboration.findById(req.params.id)
            .populate("senderId", "name email")
            .populate("receiverId", "name email")
            .populate("contentId", "title");

        if (!request) {
            return res.status(404).json({
                error: "Collaboration request not found."
            });
        }

        if (
            request.senderId._id.toString() !== req.user._id.toString() &&
            request.receiverId._id.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                error: "Unauthorized."
            });
        }

        res.json({
            success: true,
            request
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
};

exports.cancelCollaborationRequest = async (req, res) => {
    try {

        const request = await Collaboration.findById(req.params.id);

        if (!request) {
            return res.status(404).json({
                error: "Collaboration request not found."
            });
        }

        if (request.senderId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                error: "Only the sender can cancel this request."
            });
        }

        if (request.status !== "pending") {
            return res.status(400).json({
                error: "Only pending requests can be cancelled."
            });
        }

        await request.deleteOne();

        res.json({
            success: true,
            message: "Collaboration request cancelled."
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
};

exports.discoverCreators = async (req, res) => {
  try {

    const creators = await User.find({
      role: "creator",
      _id: { $ne: req.user._id },
    })
    .select(
      "name email profilePic bio creatorApplication isVerifiedCreator"
    )
    .sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      count: creators.length,
      creators,
    });

  } catch (error) {

    res.status(500).json({
      error: error.message,
    });

  }
};