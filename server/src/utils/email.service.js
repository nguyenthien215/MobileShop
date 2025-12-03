const nodemailer = require('nodemailer');

// Cấu hình transporter với Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

/**
 * Gửi email xác nhận đơn hàng
 */
exports.sendOrderConfirmation = async (email, orderData) => {
    try {
        const { orderNumber, items, totalAmount, shippingAddress } = orderData;

        const itemsHtml = items.map(item => `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.Product?.name}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${item.unitPrice.toLocaleString('vi-VN')} đ</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${item.total.toLocaleString('vi-VN')} đ</td>
            </tr>
        `).join('');

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 5px; }
                    .content { padding: 20px 0; }
                    .order-info { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; }
                    .order-info p { margin: 8px 0; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th { background: #667eea; color: white; padding: 12px; text-align: left; }
                    .footer { text-align: center; color: #666; padding: 20px 0; border-top: 1px solid #ddd; margin-top: 20px; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>✓ Đơn hàng của bạn đã được xác nhận</h1>
                    </div>

                    <div class="content">
                        <p>Xin chào,</p>
                        <p>Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đã được xác nhận thành công.</p>

                        <div class="order-info">
                            <h3 style="margin-top: 0; color: #667eea;">Thông tin đơn hàng</h3>
                            <p><strong>Mã đơn hàng:</strong> ${orderNumber}</p>
                            <p><strong>Ngày đặt hàng:</strong> ${new Date().toLocaleString('vi-VN')}</p>
                        </div>

                        <h3 style="color: #667eea;">Chi tiết sản phẩm</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Sản phẩm</th>
                                    <th style="text-align: center;">Số lượng</th>
                                    <th style="text-align: right;">Giá</th>
                                    <th style="text-align: right;">Tổng</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHtml}
                            </tbody>
                        </table>

                        <div class="order-info" style="background: #e8f4f8;">
                            <h3 style="margin-top: 0; color: #667eea;">Địa chỉ giao hàng</h3>
                            <p>${shippingAddress?.phone}</p>
                            <p>${shippingAddress?.address}</p>
                        </div>

                        <div style="text-align: right; margin: 20px 0;">
                            <h3 style="color: #667eea;">
                                Tổng tiền: <span style="color: #e74c3c; font-size: 24px;">${totalAmount.toLocaleString('vi-VN')} đ</span>
                            </h3>
                        </div>

                        <p style="color: #666; margin-top: 30px;">
                            Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất để xác nhận chi tiết giao hàng.
                        </p>
                    </div>

                    <div class="footer">
                        <p>© 2025 Mobile City - Cửa hàng điện thoại di động</p>
                        <p>Email này được gửi tự động. Vui lòng không trả lời trực tiếp email này.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `✓ Xác nhận đơn hàng #${orderNumber}`,
            html: htmlContent
        };

        await transporter.sendMail(mailOptions);
        console.log(`[Email] Order confirmation sent to: ${email}`);
        return true;

    } catch (error) {
        console.error('[Email] Error sending order confirmation:', error);
        return false;
    }
};

/**
 * Gửi email xác nhận thanh toán
 */
exports.sendPaymentConfirmation = async (email, paymentData) => {
    try {
        const { orderNumber, amount, paymentMethod, transactionId } = paymentData;

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #27ae60 0%, #229954 100%); color: white; padding: 20px; text-align: center; border-radius: 5px; }
                    .content { padding: 20px 0; }
                    .payment-info { background: #d5f4e6; padding: 15px; border-left: 4px solid #27ae60; border-radius: 5px; margin: 20px 0; }
                    .payment-info p { margin: 8px 0; }
                    .footer { text-align: center; color: #666; padding: 20px 0; border-top: 1px solid #ddd; margin-top: 20px; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>✓ Thanh toán thành công</h1>
                    </div>

                    <div class="content">
                        <p>Xin chào,</p>
                        <p>Thanh toán của bạn đã được xử lý thành công!</p>

                        <div class="payment-info">
                            <h3 style="margin-top: 0; color: #27ae60;">Thông tin thanh toán</h3>
                            <p><strong>Mã đơn hàng:</strong> ${orderNumber}</p>
                            <p><strong>Số giao dịch:</strong> ${transactionId}</p>
                            <p><strong>Phương thức:</strong> ${paymentMethod === 'payos' ? 'PayOS Online' : paymentMethod}</p>
                            <p><strong>Số tiền:</strong> <span style="color: #27ae60; font-weight: bold;">${amount.toLocaleString('vi-VN')} đ</span></p>
                            <p><strong>Thời gian:</strong> ${new Date().toLocaleString('vi-VN')}</p>
                        </div>

                        <p style="color: #666; margin-top: 30px;">
                            Đơn hàng của bạn sẽ sớm được chuẩn bị và gửi đi. Vui lòng chú ý điện thoại để nhận hàng.
                        </p>

                        <p style="color: #666;">
                            Cảm ơn bạn đã mua hàng tại Mobile City!
                        </p>
                    </div>

                    <div class="footer">
                        <p>© 2025 Mobile City - Cửa hàng điện thoại di động</p>
                        <p>Email này được gửi tự động. Vui lòng không trả lời trực tiếp email này.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `✓ Xác nhận thanh toán #${orderNumber}`,
            html: htmlContent
        };

        await transporter.sendMail(mailOptions);
        console.log(`[Email] Payment confirmation sent to: ${email}`);
        return true;

    } catch (error) {
        console.error('[Email] Error sending payment confirmation:', error);
        return false;
    }
};
