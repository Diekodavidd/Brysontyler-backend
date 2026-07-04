require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../src_/models_/user");

async function seedAdmin() {
    try {

        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB Connected");

        const existingAdmin = await User.findOne({
            email: "admin@brysontyler.com",
        });

        if (existingAdmin) {
            console.log("Admin already exists.");
            process.exit();
        }

        const hashedPassword = await bcrypt.hash(
            "Admin@12345",
            10
        );

        const admin = await User.create({

            // ==========================
            // BASIC ACCOUNT
            // ==========================

            name: "Bryson Tyler",

            email: "admin@brysontyler.com",

            password: hashedPassword,

            role: "admin",

            // ==========================
            // PROFILE
            // ==========================

            profileCompleted: true,

            profileImage: "",

            coverImage: "",

            phoneNumber: "",

            country: "",

            state: "",

            city: "",

            bio: "Platform Administrator",

            // ==========================
            // MEMBERSHIP
            // ==========================

            membership: {
                plan: "Elite",
                status: "active",
            },

            // ==========================
            // CREATOR
            // ==========================

            creatorApplication: {
                stageName: "",
                category: "",
                socialLinks: [],
            },

            creatorApproval: {
                status: "approved",
                reviewedAt: new Date(),
                rejectionReason: "",
            },

            // ==========================
            // KYC
            // ==========================

            isKYCVerified: true,

            kycStatus: "approved",

            kycVerifiedAt: new Date(),

            // ==========================
            // DIDIT
            // ==========================

            didit: {
                status: "approved",
                verifiedAt: new Date(),
            },

            // ==========================
            // COINS
            // ==========================

            coinBalance: 0,

        });

        console.log("=================================");
        console.log("Admin account created successfully");
        console.log("=================================");
        console.log("Email:", admin.email);
        console.log("Password: Admin@12345");
        console.log("=================================");

        process.exit();

    } catch (err) {

        console.error(err);
        process.exit(1);

    }
}

seedAdmin();