const jwt = require("jsonwebtoken");

const generateToken = (user) => {
    const secret = process.env.JWT_SECRET || "your_secret_key";
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
        },
        secret,
        { expiresIn: "7d" } // token sống 7 ngày
    );
};

module.exports = generateToken;
