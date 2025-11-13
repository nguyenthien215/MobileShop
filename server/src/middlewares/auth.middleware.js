const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader)
            return res.status(401).json({ message: "Thiếu token xác thực" });

        const token = authHeader.split(" ")[1];
        if (!token)
            return res.status(401).json({ message: "Token không hợp lệ" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_secret_key");
        req.user = decoded; // lưu thông tin user vào req
        next();
    } catch (err) {
        console.error(err);
        res.status(403).json({ message: "Token không hợp lệ" });
    }
};

module.exports = verifyToken;
