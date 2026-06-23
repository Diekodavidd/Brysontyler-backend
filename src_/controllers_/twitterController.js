const Content = require("../models_/content");

exports.shareContent = async (req, res) => {

    try {

        const { contentId, message } = req.body;

        if (!contentId) {

            return res.status(400).json({
                error: "Content ID is required."
            });

        }

        const content = await Content.findById(contentId);

        if (!content) {

            return res.status(404).json({
                error: "Content not found."
            });

        }

        const tweetText = `${message || ""}

${process.env.FRONTEND_URL}/content/${contentId}`;

        const tweetUrl =
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

        res.json({

            success: true,

            tweetUrl

        });

    }

    catch(error){

        res.status(500).json({

            error:error.message

        });

    }

};

exports.shareProfile = async (req,res)=>{

    try{

        const url =
            `${process.env.FRONTEND_URL}/creator/${req.user._id}`;

        const tweet =
            `Check out my creator profile!

${url}`;

        res.json({

            success:true,

            tweetUrl:
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`

        });

    }

    catch(error){

        res.status(500).json({

            error:error.message

        });

    }

};

const LiveSession = require("../models_/liveSession");

exports.shareLiveSession = async (req,res)=>{

    try{

        const session = await LiveSession.findById(req.params.id);

        if(!session){

            return res.status(404).json({

                error:"Live session not found."

            });

        }

        const tweet =
`🔴 I'm LIVE!

Join now:

${process.env.FRONTEND_URL}/live/${session._id}`;

        res.json({

            success:true,

            tweetUrl:
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`

        });

    }

    catch(error){

        res.status(500).json({

            error:error.message

        });

    }

};

const User = require("../models_/user");

exports.shareCreator = async (req,res)=>{

    try{

        const creator = await User.findById(req.params.creatorId);

        if(!creator){

            return res.status(404).json({

                error:"Creator not found."

            });

        }

        const tweet =
`Check out ${creator.name}!

${process.env.FRONTEND_URL}/creator/${creator._id}`;

        res.json({

            success:true,

            tweetUrl:
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`

        });

    }

    catch(error){

        res.status(500).json({

            error:error.message

        });

    }

};

const Model = require("../models_/model");

exports.shareModel = async (req,res)=>{

    try{

        const model = await Model.findById(req.params.id);

        if(!model){

            return res.status(404).json({

                error:"Model not found."

            });

        }

        const tweet =
`Meet ${model.stageName || model.fullName}

${process.env.FRONTEND_URL}/models/${model._id}`;

        res.json({

            success:true,

            tweetUrl:
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`

        });

    }

    catch(error){

        res.status(500).json({

            error:error.message

        });

    }

};

