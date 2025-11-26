const { Op } = require('sequelize');
const Review = require("../models/review.model");
const User = require("../models/user.model");
const Order = require("../models/order.model");
const OrderItem = require("../models/orderItem.model");
const Payment = require("../models/payment.model");

// Quy tắc:
// - Thanh toán ngân hàng: được đánh giá nếu payment.status === 'paid' (có thể vẫn cho nếu thiếu payment nhưng paymentMethod='bank')
// - COD: chỉ khi order.status === 'completed'
// 
// FIX: Kiểm tra TẤT CẢ các đơn hàng có sản phẩm này, chỉ cần 1 đơn đủ điều kiện là cho phép đánh giá
async function canReview(userId, productId) {
    // Lấy TẤT CẢ OrderItem của sản phẩm này từ user
    const orderItems = await OrderItem.findAll({
        where: { productId },
        include: [{
            model: Order,
            where: { userId, status: { [Op.not]: 'cancelled' } },
            include: [{ model: Payment, as: 'payment', required: false }]
        }]
    });

    if (!orderItems || orderItems.length === 0) return false;

    // Kiểm tra từng đơn hàng, chỉ cần 1 đơn đủ điều kiện là return true
    for (const orderItem of orderItems) {
        const order = orderItem.Order;
        if (!order) continue;

        // Trường hợp thanh toán ngân hàng
        if (order.paymentMethod === 'bank') {
            // Nếu có payment record và status = 'paid' → eligible
            if (order.payment && order.payment.status === 'paid') {
                return true;
            }
            // Fallback: đơn cũ chưa có payment record nhưng paymentMethod là bank → cho phép
            if (!order.payment) {
                return true;
            }
        }

        // Trường hợp COD: chỉ khi đơn hàng completed
        if (order.paymentMethod === 'COD' && order.status === 'completed') {
            return true;
        }
    }

    return false;
}

exports.addReview = async (req, res) => {
    try {
        const { productId, comment, rating } = req.body;
        const userId = req.user.id;

        // Chặn admin không được đánh giá
        if (req.user.role === 'admin') {
            return res.status(403).json({ message: 'Tài khoản Admin không thể đánh giá sản phẩm' });
        }

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

