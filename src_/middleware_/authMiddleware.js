const jwt = require("jsonwebtoken");
const User = require("../models_/user");

const authMiddleware = async (req, res, next) => {
  try {

    const authHeader = req.header("Authorization");

    console.log("AUTH HEADER:", authHeader);

    const token = authHeader?.replace("Bearer ", "");

    console.log("TOKEN:", token);

    if (!token) {
      return res.status(401).json({
        error: "No token provided",
      });
    }

    console.log("JWT SECRET:", process.env.JWT_SECRET);

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    console.log("DECODED:", decoded);

    const user = await User.findById(decoded.id)
      .select("-password");

    console.log("FOUND USER:", user);

    if (!user) {
      return res.status(401).json({
        error: "User not found",
      });
    }

    req.user = user;

    next();

  } catch (error) {

    console.error("AUTH ERROR:");
    console.error(error);

    return res.status(401).json({
      error: error.message,
    });

  }
};

module.exports = authMiddleware;