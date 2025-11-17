const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const jwt = require('../middlewares/jwt.middleware');
const isAdmin = require('../middlewares/isAdmin.middleware');

// Tạo đơn hàng (User)
// router.post('/quick', jwt, orderController.quickOrder);
router.post('/', jwt, orderController.createOrder); // dùng cho nhiều sản phẩm

// Lấy đơn hàng của user
router.get('/my-orders', jwt, orderController.getMyOrders);

// Admin xem tất cả đơn hàng
router.get('/admin', jwt, isAdmin, orderController.getAllOrders);

// Admin cập nhật trạng thái đơn hàng
router.put('/admin/:id/status', jwt, isAdmin, orderController.updateStatus);

module.exports = router;
