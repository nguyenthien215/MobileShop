const express = require('express');
const router = express.Router();
const vnpayController = require('../controllers/vnpay.controller');
const jwt = require('../middlewares/jwt.middleware');

// Tạo URL thanh toán VNPay
router.post('/create-payment-url', jwt, vnpayController.createPaymentUrl);

// VNPay callback sau khi thanh toán
router.get('/return', vnpayController.vnpayReturn);

// Webhook từ VNPay (IPN - Instant Payment Notification)
router.get('/ipn', vnpayController.vnpayIPN);

module.exports = router;