require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../src_/models_/user"); // <-- adjust path if necessary

async function createCreator() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Check if already exists
    const exists = await User.findOne({
      email: "lammerrobinson@gmail.com",
    });

    if (exists) {
      console.log("Creator already exists.");
      process.exit();
    }

    const hashedPassword = await bcrypt.hash(
      "Creator@123",
      10
    );

    const creator = await User.create({
      // ======================
      // BASIC
      // ======================

      name: "Lammer Robinson",

      email: "lammerrobinson@gmail.com",

      password: hashedPassword,

      role: "creator",

      // ======================
      // PROFILE
      // ======================

      phoneNumber: "+2348108892355",

      dateOfBirth: new Date("2005-04-07"),

      profileCompleted: true,

      // ======================
      // MEMBERSHIP
      // ======================

      membership: {
        plan: "FREE",
        status: "active",
        startDate: new Date(),
        endDate: null,
      },

      // ======================
      // CREATOR APPLICATION
      // ======================

      creatorApplication: {
        stageName: "Varabigdk",
        category: "",
        socialLinks: [],
        submittedAt: new Date(),
      },

      creatorApproval: {
        status: "pending",
        reviewedAt: null,
        reviewedBy: null,
        rejectionReason: "",
      },

      // ======================
      // KYC
      // ======================

      isKYCVerified: true,

      kycStatus: "approved",

      kycVerifiedAt: new Date(),

      // ======================
      // COINS
      // ======================

      coinBalance: 0,

      // ======================
      // SETTINGS
      // ======================

      preferences: {
        darkMode: true,
        autoplay: true,
        emailNotifications: true,
        pushNotifications: true,
      },

      // ======================
      // DIDIT
      // ======================

      didit: {
        status: "verified",
        verifiedAt: new Date(),
      },
    });

    console.log("✅ Creator created successfully");
    console.log(creator);

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

createCreator();