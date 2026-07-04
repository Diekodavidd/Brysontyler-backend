const mongoose = require("mongoose");
require("dotenv").config();

const User = require("../src_/models_/user");

async function migrate() {
    try {

        await mongoose.connect(process.env.MONGO_URI);

        const users = await User.collection.find({}).toArray();

       for (const user of users) {

    await User.collection.updateOne(

        { _id: user._id },

        {

            $set: {

                creatorApplication: {

                    stageName:
                        user.creatorVerification?.stageName || "",

                    category:
                        user.creatorVerification?.category || "",

                    socialLinks:
                        user.creatorVerification?.socialLinks || [],

                    submittedAt:
                        user.createdAt,

                },

                creatorApproval: {

                    status:
                        user.role === "creator"
                            ? (
                                user.isVerifiedCreator
                                    ? "approved"
                                    : "pending"
                            )
                            : "not_submitted",

                    reviewedAt:
                        user.isVerifiedCreator
                            ? new Date()
                            : null,

                    reviewedBy: null,

                    rejectionReason: "",

                },

            },

            $unset: {

                creatorVerification: "",

                isVerifiedCreator: "",

            },

        }

    );

}
        console.log("Migration Complete.");

        process.exit();

    } catch (err) {

        console.error(err);

        process.exit(1);

    }
}

migrate();