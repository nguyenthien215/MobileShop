const express = require('express');
const router = express.Router();
const payosController = require('../controllers/payos.controller');
const jwt = require('../middlewares/jwt.middleware');

// Tạo link thanh toán
router.post('/create-payment-link', jwt, payosController.createPaymentLink);

// Demo callback (không cần auth - trang demo tự gọi)
router.post('/demo-callback', payosController.handleDemoCallback);

module.exports = router;
