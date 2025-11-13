const jwt = require('jsonwebtoken');

function jwtMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Thiếu token' });

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Gắn thông tin user vào request
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token không hợp lệ' });
    }
}

module.exports = jwtMiddleware;
