const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const jwt = require('../middlewares/jwt.middleware');
const isAdmin = require('../middlewares/isAdmin.middleware');

console.log('[order.routes] loaded');

router.get('/debug', (req, res) => res.json({ ok: true }));

// Tạo đơn hàng nhanh (User)
router.post('/quick', jwt, (req, res, next) => {
    console.log('[order.routes] hit /quick');
    next();
}, orderController.quickOrder);

// Đặt nhiều sản phẩm (nếu dùng)
router.post('/', jwt, orderController.createOrder);

// Lấy đơn hàng của user
router.get('/my-orders', jwt, orderController.getMyOrders);

// Hủy đơn hàng
router.put('/:id/cancel', jwt, orderController.cancelOrder);

// Admin xem tất cả đơn hàng
router.get('/admin', jwt, isAdmin, orderController.getAllOrders);

// Admin cập nhật trạng thái đơn hàng
router.put('/admin/:id/status', jwt, isAdmin, orderController.updateStatus);

module.exports = router;