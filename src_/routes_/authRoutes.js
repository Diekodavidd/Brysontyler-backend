const express = require("express");
const multer = require("multer");

const router = express.Router();

const upload = multer({
    dest: "uploads/"
});

const auth = require("../middleware_/authMiddleware");

const {

    register,

    login,

    forgotPassword,

    resetPassword,

    changePassword,

    getMe,

    completeProfile,

    uploadProfileImage,

    uploadCoverImage,

    getOnboardingStatus,

    submitCreatorVerification,
    updateProfile

} = require("../controllers_/authController");

router.post("/register", register);

router.post("/login", login);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:token", resetPassword);

router.post(
    "/change-password",
    auth,
    changePassword
);

router.get(
    "/me",
    auth,
    getMe
);

router.post(
    "/complete-profile",
    auth,
    completeProfile
);

router.post(
    "/upload-profile-image",
    auth,
    upload.single("image"),
    uploadProfileImage
);

router.post(
    "/upload-cover-image",
    auth,
    upload.single("image"),
    uploadCoverImage
);

router.get(
    "/onboarding-status",
    auth,
    getOnboardingStatus
);

router.post(
    "/creator-verification",
    auth,
    submitCreatorVerification
);
router.patch(
    "/profile",
    auth,
    updateProfile
);


module.exports = router;