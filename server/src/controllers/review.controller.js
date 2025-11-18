const { Op } = require('sequelize');
const Review = require("../models/review.model");
const User = require("../models/user.model");
const Order = require("../models/order.model");
const OrderItem = require("../models/orderItem.model");
const Payment = require("../models/payment.model");

// Quy tắc:
// - Thanh toán ngân hàng: được đánh giá nếu payment.status === 'paid' (có thể vẫn cho nếu thiếu payment nhưng paymentMethod='bank')
// - COD: chỉ khi order.status === 'completed'
async function canReview(userId, productId) {
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
    if (!order) return false;

    if (order.paymentMethod === 'bank') {
        if (!order.payment) return true; // fallback đơn cũ chưa có payment
        return order.payment.status === 'paid';
    }
    if (order.paymentMethod === 'COD') {
        return order.status === 'completed';
    }
    return false;
}

exports.addReview = async (req, res) => {
    try {
        const { productId, comment, rating } = req.body;
        const userId = req.user.id;

        if (!productId || !rating) return res.status(400).json({ message: "Thiếu productId hoặc rating" });
        if (rating < 1 || rating > 5) return res.status(400).json({ message: "Rating phải từ 1 đến 5" });

        const eligible = await canReview(userId, productId);
        if (!eligible) return res.status(403).json({ message: "Chưa đủ điều kiện đánh giá" });

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
            review
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi server", error: err.message });
    }
};

exports.getEligibility = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user.id;
        const eligible = await canReview(userId, productId);
        const review = eligible
            ? await Review.findOne({ where: { userId, productId } })
            : null;
        res.json({ eligible, review });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi server" });
    }
};

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