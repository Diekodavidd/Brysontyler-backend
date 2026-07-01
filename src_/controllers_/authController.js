const User = require('../models_/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../utils_/mailer');

exports.register = async (req, res) => {
try {
const { name, email, password, role } = req.body;

if (!name || !email || !password) {
    return res.status(400).json({
        error: "All fields are required"
    });
}

const cleanName = name.trim();
const cleanEmail = email.toLowerCase().trim();
const existingUser = await User.findOne({
    email: cleanEmail
});


if (existingUser) return res.status(400).json({ error: 'User already exists' });
if(password.length < 8){
   return res.status(400).json({
      error:"Password must be at least 8 characters."
   })
}
const hashedPassword = await bcrypt.hash(password, 10);

const user = new User({
    name: cleanName,
    email: cleanEmail,
    password: hashedPassword,
    role: role || "fan"
});
if (!name || !email || !password) {
    return res.status(400).json({
        error: "All fields are required"
    });
}
await user.save();

const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const safeUser = await User.findById(user._id).select("-password");

res.status(201).json({
    token,
    user: safeUser
});
} catch (error) {
res.status(500).json({ error: error.message });
}

};

exports.login = async (req, res) => {
try {
const { email, password } = req.body;

if (!email || !password) {
 
   return res.status(400).json({
      error:"Email and password required."
   })
}

const cleanEmail = email.toLowerCase().trim();

const user = await User.findOne({
    email: cleanEmail
});
if (!user) return res.status(400).json({ error: 'Invalid credentials' });

const isMatch = await bcrypt.compare(password, user.password);
if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const safeUser = await User.findById(user._id).select("-password");

res.json({
    token,
    user: safeUser
});} catch (error) {
res.status(500).json({ error: error.message });
}
};

exports.forgotPassword = async (req, res) => {
try {
const { email } = req.body;
const cleanEmail = email.toLowerCase().trim();

const user = await User.findOne({
    email: cleanEmail
});if (!user) return res.status(404).json({ error: 'User not found' });

const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
const resetLink =
`${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

await sendEmail({
to: email,
subject: "Reset Your Password",
html: `<p>Click to reset: <a href="${resetLink}">${resetLink}</a></p>`
});

res.json({ success: true, message: 'Reset link sent to email' });
} catch (error) {
res.status(500).json({ error: error.message });
}
};

exports.changePassword = async (req, res) => {
try {
const { currentPassword, newPassword } = req.body;
const user = await User.findById(req.user._id);
if(!user){
   return res.status(404).json({
      error:"User not found"
   })
}

if(!newPassword || newPassword.length < 8){
    return res.status(400).json({
        error:"Password must be at least 8 characters."
    });
}

const isMatch = await bcrypt.compare(currentPassword, user.password);
if (!isMatch) return res.status(400).json({ error: 'Current password incorrect' });

user.password = await bcrypt.hash(newPassword, 10);
await user.save();

res.json({ success: true, message: 'Password changed successfully' });
} catch (error) {
res.status(500).json({ error: error.message });
}
};

exports.resetPassword = async (req, res) => {
    try {

        const { token } = req.params;
        const { password } = req.body;

        if (!password || password.length < 8) {
            return res.status(400).json({
                error: "Password must be at least 8 characters."
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        user.password = await bcrypt.hash(password, 10);

        await user.save();

        res.json({
            success: true,
            message: "Password reset successful."
        });

    } catch (err) {

        res.status(400).json({
            error: "Invalid or expired reset token."
        });

    }
};

exports.getMe = async (req, res) => {

    const user = await User.findById(req.user._id)
        .select("-password");

    res.json(user);

};

exports.completeProfile = async (req, res) => {
    try {

        const {
            phoneNumber,
            dateOfBirth,
            gender,
            country,
            state,
            city,
            bio
        } = req.body;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        user.phoneNumber = phoneNumber;
        user.dateOfBirth = dateOfBirth;
        user.gender = gender;
        user.country = country;
        user.state = state;
        user.city = city;
        user.bio = bio;
        user.profileCompleted = true;

        await user.save();

        res.json({
            success: true,
            message: "Profile completed successfully."
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
};

const cloudinary = require("../utils_/cloudinary");

exports.uploadProfileImage = async (req, res) => {
    try {

        if (!req.file) {
            return res.status(400).json({
                error: "Image is required."
            });
        }

        const result = await cloudinary.uploader.upload(
            req.file.path,
            {
                folder: "brysontyler/profile-images"
            }
        );

        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                profileImage: result.secure_url
            },
            {
                new: true
            }
        );

        res.json({
            success: true,
            profileImage: user.profileImage
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
};

exports.uploadCoverImage = async (req, res) => {
    try {

        if (!req.file) {
            return res.status(400).json({
                error: "Image is required."
            });
        }

        const result = await cloudinary.uploader.upload(
            req.file.path,
            {
                folder: "brysontyler/cover-images"
            }
        );

        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                coverImage: result.secure_url
            },
            {
                new: true
            }
        );

        res.json({
            success: true,
            coverImage: user.coverImage
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
};

exports.getOnboardingStatus = async (req, res) => {

    try {

        const user = await User.findById(req.user._id);

        res.json({

            profileCompleted: user.profileCompleted,

            profileImageUploaded: !!user.profileImage,

            coverImageUploaded: !!user.coverImage,

            kycStatus: user.kyc?.status || "pending",

            creatorVerified:
                user.creatorVerification?.verified || false

        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};

exports.submitCreatorVerification = async (req, res) => {

    try {

        const {
            stageName,
            category,
            socialLinks
        } = req.body;

        const user = await User.findById(req.user._id);

        user.creatorVerification = {

            stageName,

            category,

            socialLinks,

            verified: false

        };

        await user.save();

        res.json({

            success: true,

            message:
                "Creator verification submitted."

        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};

exports.updateProfile = async (req, res) => {
    try {

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        user.name = req.body.name;
        user.phoneNumber = req.body.phoneNumber;
        user.bio = req.body.bio;
        user.country = req.body.country;
        user.state = req.body.state;
        user.city = req.body.city;

        user.creatorVerification.stageName =
            req.body.stageName;

        user.creatorVerification.socialLinks =
            req.body.socialLinks;

        await user.save();

        const updatedUser = await User.findById(user._id)
            .select("-password");

        res.json({
            success: true,
            user: updatedUser
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
};