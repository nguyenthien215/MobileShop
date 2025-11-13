const Category = require('../models/category.model');

exports.getAll = async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { name, slug } = req.body;
        const category = await Category.create({ name, slug });
        res.status(201).json(category);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

// --- thêm update ---
exports.update = async (req, res) => {
    const { id } = req.params;
    try {
        const category = await Category.findByPk(id);
        if (!category) return res.status(404).json({ message: 'Category không tồn tại' });

        const { name, slug } = req.body;
        await category.update({ name, slug });

        res.json({ message: 'Cập nhật category thành công', category });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

// --- thêm delete ---
exports.delete = async (req, res) => {
    const { id } = req.params;
    try {
        const category = await Category.findByPk(id);
        if (!category) return res.status(404).json({ message: 'Category không tồn tại' });

        await category.destroy();
        res.json({ message: 'Xóa category thành công' });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};
