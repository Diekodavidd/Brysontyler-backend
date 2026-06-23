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
res.status(201).json({ token, user: { id: user._id, name: user.name, role: user.role } });
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
res.json({ token, user: { id: user._id, name: user.name, role: user.role } });
} catch (error) {
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
const resetLink = `${process.env.BACKEND_URL}/reset-password/${resetToken}`;

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
    res.json(req.user);
};