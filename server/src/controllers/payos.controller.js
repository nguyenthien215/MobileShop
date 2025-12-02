const payos = require('../../config/payos.config');
const Order = require('../models/order.model');
const Payment = require('../models/payment.model');

/**
 * Tạo link thanh toán PayOS (giả lập cho test)
 */
exports.createPaymentLink = async (req, res) => {
    try {
        const { orderId, amount, orderInfo } = req.body;

        if (!orderId || !amount) {
            return res.status(400).json({ message: 'Missing orderId or amount' });
        }

        const order = await Order.findByPk(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Tạo orderCode unique (timestamp)
        const orderCode = Date.now();

        // ===== CHẾ ĐỘ GIẢ LẬP (DEMO) =====
        // Thay vì gọi PayOS thật, tạo URL giả lập
        const demoUrl = `${process.env.CLIENT_URL}/payment-demo?` +
            `orderCode=${orderCode}&` +
            `amount=${amount}&` +
            `orderId=${orderId}&` +
            `description=${encodeURIComponent(orderInfo || `Thanh toán đơn hàng #${orderId}`)}`;

        // Cập nhật payment với transactionId (không tạo mới)
        const payment = await Payment.findOne({ where: { orderId } });
        if (payment) {
            await payment.update({
                transactionId: String(orderCode),
                status: 'pending'
            });
        } else {
            // Nếu chưa có, tạo mới
            await Payment.create({
                orderId,
                method: 'payos',
                amount: parseFloat(amount),
                status: 'pending',
                transactionId: String(orderCode)
            });
        }

        res.json({
            success: true,
            checkoutUrl: demoUrl,
            orderCode,
            message: 'Demo mode - Thanh toán giả lập'
        });

    } catch (error) {
        console.error('[PayOS] Create payment error:', error);
        res.status(500).json({
            message: 'Lỗi khi tạo link thanh toán',
            error: error.message
        });
    }
};

/**
 * Xử lý callback từ trang demo
 */
exports.handleDemoCallback = async (req, res) => {
    console.log('[PayOS Demo] Callback received');
    console.log('[PayOS Demo] Request body:', req.body);

    try {
        const { orderCode, status } = req.body;

        if (!orderCode) {
            console.error('[PayOS Demo] Missing orderCode');
            return res.status(400).json({ message: 'Missing orderCode' });
        }

        console.log('[PayOS Demo] Processing:', { orderCode, status });

        // Tìm payment theo transactionId
        const payment = await Payment.findOne({
            where: { transactionId: String(orderCode) }
        });

        if (!payment) {
            console.error('[PayOS Demo] Payment not found for orderCode:', orderCode);
            return res.status(404).json({ message: 'Payment not found' });
        }

        console.log('[PayOS Demo] Found payment:', payment.id);

        // Cập nhật payment status
        if (status === 'success') {
            await payment.update({ status: 'paid' });
            console.log('[PayOS Demo] Payment marked as paid:', orderCode);
        } else {
            await payment.update({ status: 'failed' });
            console.log('[PayOS Demo] Payment marked as failed:', orderCode);
        }

        res.json({ success: true, message: 'Payment updated' });

    } catch (error) {
        console.error('[PayOS Demo] Callback error:', error);
        console.error('[PayOS Demo] Error stack:', error.stack);
        res.status(500).json({
            message: 'Lỗi xử lý callback',
            error: error.message
        });
    }
};
