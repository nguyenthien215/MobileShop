const { Op } = require('sequelize');
const Review = require("../models/review.model");
const User = require("../models/user.model");
const Order = require("../models/order.model");
const OrderItem = require("../models/orderItem.model");
const Payment = require("../models/payment.model");

// Kiểm tra người dùng đã mua & đã thanh toán hoặc đơn đã completed
async function hasPurchasedAndPaidOrCompleted(userId, productId) {
    const orderItem = await OrderItem.findOne({
        where: { productId },
        include: [{
            model: Order,
            where: { userId, status: { [Op.not]: 'cancelled' } },
            include: [{ model: Payment, as: 'payment', required: false }]
        }]
    });

    if (!orderItem) return false;
    const order = orderItem.Order;
    const paid = order?.payment?.status === 'paid';
    const completed = order?.status === 'completed';
    return paid || completed;
}

// Upsert đánh giá (tạo mới hoặc cập nhật nếu đã tồn tại)
exports.addReview = async (req, res) => {
    try {
        const { productId, comment, rating } = req.body;
        const userId = req.user.id;

        if (!productId || !rating) {
            return res.status(400).json({ message: "Thiếu productId hoặc rating" });
        }
        if (Number(rating) < 1 || Number(rating) > 5) {
            return res.status(400).json({ message: "Rating phải từ 1 đến 5" });
        }

        const eligible = await hasPurchasedAndPaidOrCompleted(userId, productId);
        if (!eligible) {
            return res.status(403).json({ message: "Bạn chưa đủ điều kiện đánh giá (chưa mua hoặc chưa thanh toán hoàn tất)" });
        }

        const existing = await Review.findOne({ where: { userId, productId } });
        let review;
        if (existing) {
            existing.rating = rating;
            existing.comment = comment ?? existing.comment;
            await existing.save();
            review = existing;
        } else {
            review = await Review.create({ userId, productId, rating, comment });
        }

        res.status(201).json({
            message: existing ? "Đã cập nhật đánh giá" : "Đã thêm đánh giá",
            review,
        });
    } catch (err) {
        console.error(err);
        // Xử lý trường hợp unique constraint (userId, productId) race condition
        if (err.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: 'Bạn đã đánh giá sản phẩm này, hãy gửi lại để cập nhật.' });
        }
        res.status(500).json({ message: "Lỗi server", error: err.message });
    }
};

// Lấy danh sách đánh giá của một sản phẩm
exports.getReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        const reviews = await Review.findAll({
            where: { productId },
            include: [{ model: User, attributes: ['id', 'name'] }],
            order: [["createdAt", "DESC"]],
        });
        res.json(reviews);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi server" });
    }
};

// Kiểm tra eligibility + trả về review hiện có (nếu đã đánh giá)
exports.getEligibility = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user.id;
        const eligible = await hasPurchasedAndPaidOrCompleted(userId, productId);
        let review = null;
        if (eligible) {
            review = await Review.findOne({ where: { userId, productId } });
        }
        res.json({ eligible, review });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi server" });
    }
};