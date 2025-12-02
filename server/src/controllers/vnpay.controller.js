const crypto = require('crypto');
const moment = require('moment');
const qs = require('qs');
const vnpayConfig = require('../../config/vnpay.config');
const Order = require('../models/order.model');
const Payment = require('../models/payment.model');

/**
 * Tạo URL thanh toán VNPay
 * Frontend sẽ redirect user đến URL này
 */
exports.createPaymentUrl = async (req, res) => {
    try {
        const { orderId, amount, orderInfo, bankCode } = req.body;

        // Validate
        if (!orderId || !amount) {
            return res.status(400).json({ message: 'Thiếu orderId hoặc amount' });
        }

        // Tìm order để kiểm tra
        const order = await Order.findByPk(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }

        if (order.userId !== req.user.id) {
            return res.status(403).json({ message: 'Không có quyền' });
        }

        // Thông tin giao dịch
        const date = new Date();
        const createDate = moment(date).format('YYYYMMDDHHmmss');
        const orderId_vnpay = moment(date).format('DDHHmmss'); // VNPay yêu cầu orderId unique

        // Địa chỉ IP của client
        const ipAddr = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;

        // Tạo object chứa các tham số
        let vnp_Params = {
            vnp_Version: '2.1.0',
            vnp_Command: 'pay',
            vnp_TmnCode: vnpayConfig.vnp_TmnCode,
            vnp_Locale: 'vn',
            vnp_CurrCode: 'VND',
            vnp_TxnRef: orderId_vnpay,
            vnp_OrderInfo: orderInfo || `Thanh toan don hang ${order.orderNumber}`,
            vnp_OrderType: 'other',
            vnp_Amount: amount * 100, // VNPay yêu cầu nhân 100
            vnp_ReturnUrl: vnpayConfig.vnp_ReturnUrl,
            vnp_IpAddr: ipAddr,
            vnp_CreateDate: createDate,
        };

        // Thêm bankCode nếu user chọn ngân hàng cụ thể
        if (bankCode) {
            vnp_Params['vnp_BankCode'] = bankCode;
        }

        // Sắp xếp params theo alphabet (VNPay yêu cầu)
        vnp_Params = this.sortObject(vnp_Params);

        // Tạo chuỗi query string
        const signData = qs.stringify(vnp_Params, { encode: false });

        // Tạo chữ ký bảo mật (HMAC SHA512)
        const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
        vnp_Params['vnp_SecureHash'] = signed;

        // Tạo URL thanh toán
        const paymentUrl = vnpayConfig.vnp_Url + '?' + qs.stringify(vnp_Params, { encode: false });

        // Lưu thông tin giao dịch tạm (optional)
        await Payment.update(
            {
                transactionId: orderId_vnpay,
                status: 'pending'
            },
            { where: { orderId: orderId } }
        );

        res.json({
            message: 'Tạo URL thanh toán thành công',
            paymentUrl: paymentUrl
        });

    } catch (error) {
        console.error('[VNPay] Error:', error);
        res.status(500).json({ message: 'Lỗi khi tạo URL thanh toán' });
    }
};

/**
 * VNPay Return URL - User được redirect về đây sau khi thanh toán
 */
exports.vnpayReturn = async (req, res) => {
    try {
        let vnp_Params = req.query;
        const secureHash = vnp_Params['vnp_SecureHash'];

        // Xóa các params không cần thiết
        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        // Sắp xếp params
        vnp_Params = this.sortObject(vnp_Params);

        // Tạo chữ ký để verify
        const signData = qs.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

        // Kiểm tra chữ ký
        if (secureHash === signed) {
            const orderId = vnp_Params['vnp_TxnRef'];
            const rspCode = vnp_Params['vnp_ResponseCode'];

            // Tìm payment record
            const payment = await Payment.findOne({
                where: { transactionId: orderId }
            });

            if (payment) {
                if (rspCode === '00') {
                    // Thanh toán thành công
                    await payment.update({ status: 'paid' });

                    // Cập nhật order status
                    await Order.update(
                        { status: 'pending' }, // hoặc 'confirmed'
                        { where: { id: payment.orderId } }
                    );

                    // Redirect về frontend - Trang thành công
                    return res.redirect(`http://localhost:5173/payment-success?orderId=${payment.orderId}`);
                } else {
                    // Thanh toán thất bại
                    await payment.update({ status: 'failed' });

                    // Redirect về frontend - Trang thất bại
                    return res.redirect(`http://localhost:5173/payment-failed?orderId=${payment.orderId}&code=${rspCode}`);
                }
            }

            res.redirect('http://localhost:5173/payment-error');
        } else {
            res.redirect('http://localhost:5173/payment-error?message=invalid-signature');
        }

    } catch (error) {
        console.error('[VNPay Return] Error:', error);
        res.redirect('http://localhost:5173/payment-error');
    }
};

/**
 * VNPay IPN (Instant Payment Notification)
 * VNPay gọi endpoint này để thông báo kết quả thanh toán
 */
exports.vnpayIPN = async (req, res) => {
    try {
        let vnp_Params = req.query;
        const secureHash = vnp_Params['vnp_SecureHash'];

        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        vnp_Params = this.sortObject(vnp_Params);

        const signData = qs.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

        if (secureHash === signed) {
            const orderId = vnp_Params['vnp_TxnRef'];
            const rspCode = vnp_Params['vnp_ResponseCode'];

            // Xử lý logic tương tự vnpayReturn
            // ...

            res.status(200).json({ RspCode: '00', Message: 'Success' });
        } else {
            res.status(200).json({ RspCode: '97', Message: 'Invalid signature' });
        }

    } catch (error) {
        console.error('[VNPay IPN] Error:', error);
        res.status(500).json({ RspCode: '99', Message: 'Unknown error' });
    }
};

/**
 * Helper: Sắp xếp object theo alphabet
 */
exports.sortObject = (obj) => {
    const sorted = {};
    const keys = Object.keys(obj).sort();
    keys.forEach(key => {
        sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, '+');
    });
    return sorted;
};