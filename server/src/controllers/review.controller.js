const Review = require("../models/review.model");
const User = require("../models/user.model");
const Product = require("../models/product.model");

// Thêm đánh giá (cần token)
exports.addReview = async (req, res) => {
    try {
        const { productId, comment, rating } = req.body;
        const userId = req.user.id; // Lấy từ token

        if (!productId || !comment || !rating)
            return res.status(400).json({ message: "Thiếu thông tin đánh giá" });

        const review = await Review.create({ userId, productId, comment, rating });

        res.status(201).json({
            message: "Đã thêm đánh giá",
            review,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi server", error: err.message });
    }
};

// Lấy tất cả đánh giá của 1 sản phẩm
exports.getReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        const reviews = await Review.findAll({
            where: { productId },
            include: [User], // hiện tên user nếu cần
            order: [["createdAt", "DESC"]],
        });

        res.json(reviews);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi server" });
    }
};
