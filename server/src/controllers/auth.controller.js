const bcrypt = require('bcrypt');
const User = require('../models/user.model');
const generateToken = require('../utils/generateToken');

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password)
            return res.status(400).json({ message: "Thiếu thông tin" });

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser)
            return res.status(400).json({ message: "Email đã được sử dụng" });

        const hashed = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            passwordHash: hashed,
        });

        const token = generateToken(user);
        res.status(201).json({
            message: "Đăng ký thành công",
            user: { id: user.id, name: user.name, email: user.email },
            token,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi server" });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user)
            return res.status(404).json({ message: "Email không tồn tại" });

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid)
            return res.status(400).json({ message: "Sai mật khẩu" });

        const token = generateToken(user);
        res.json({
            message: "Đăng nhập thành công",
            user: { id: user.id, name: user.name, email: user.email },
            token,
        });
    } catch (err) {
        res.status(500).json({ message: "Lỗi server" });
    }
};
