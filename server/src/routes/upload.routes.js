const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload.middleware');
const jwt = require('../middlewares/jwt.middleware');
const isAdmin = require('../middlewares/isAdmin.middleware');

// Upload ảnh sản phẩm (admin only)
router.post('/products', jwt, isAdmin, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Chưa chọn ảnh' });
    }

    const imageUrl = `/uploads/products/${req.file.filename}`;
    res.json({
        message: 'Upload thành công',
        imageUrl,
        filename: req.file.filename
    });
});

// Upload multiple ảnh
router.post('/products/multiple', jwt, isAdmin, upload.array('images', 5), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'Chưa chọn ảnh' });
    }

    const imageUrls = req.files.map(file => `/uploads/products/${file.filename}`);
    res.json({
        message: 'Upload thành công',
        imageUrls
    });
});

module.exports = router;