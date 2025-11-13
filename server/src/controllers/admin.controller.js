const User = require('../models/user.model');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'name', 'email', 'role', 'createdAt']
        });
        res.status(200).json(users);
    } catch (err) {
        console.error('Lỗi khi lấy danh sách người dùng:', err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};
