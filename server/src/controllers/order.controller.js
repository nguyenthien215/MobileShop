const sequelize = require('../../config/db');
const Order = require('../models/order.model');
const OrderItem = require('../models/orderItem.model');
const Product = require('../models/product.model');
const Payment = require('../models/payment.model');

// Helper tạo orderNumber
function generateOrderNumber() {
    const date = new Date();
    const ymd = date.toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(10000 + Math.random() * 90000);
    return `ES-${ymd}-${rand}`;
}

// POST /api/orders  (Đơn nhiều sản phẩm)
exports.createOrder = async (req, res) => {
    const { items, shippingAddress, paymentMethod } = req.body;
    const userId = req.user.id;

    if (!items || !items.length) return res.status(400).json({ message: 'Giỏ hàng rỗng' });
    if (!paymentMethod || !['COD', 'bank'].includes(paymentMethod)) {
        return res.status(400).json({ message: 'Phương thức thanh toán không hợp lệ' });
    }

    const t = await sequelize.transaction();
    try {
        let totalAmount = 0;
        const orderItemsData = [];

        for (const item of items) {
            const product = await Product.findByPk(item.productId);
            if (!product) throw new Error(`Sản phẩm ID ${item.productId} không tồn tại`);
            const total = product.price * item.quantity;
            totalAmount += total;
            orderItemsData.push({
                productId: product.id,
                unitPrice: product.price,
                quantity: item.quantity,
                total,
            });
        }

        const order = await Order.create({
            orderNumber: generateOrderNumber(),
            userId,
            totalAmount,
            status: 'pending',
            shippingAddress,
            paymentMethod,
        }, { transaction: t });

        for (const item of orderItemsData) {
            await OrderItem.create({ ...item, orderId: order.id }, { transaction: t });
        }

        // Tạo payment (giống quickOrder)
        const paymentStatus = paymentMethod === 'bank' ? 'paid' : 'unpaid';
        await Payment.create({
            orderId: order.id,
            method: paymentMethod,
            amount: totalAmount,
            status: paymentStatus
        }, { transaction: t });

        await t.commit();

        // Trả về chi tiết order kèm payment
        const orderDetail = await Order.findByPk(order.id, {
            include: [
                { model: OrderItem, as: 'items', include: [Product] },
                { model: Payment, as: 'payment' }
            ]
        });

        res.status(201).json(orderDetail);

    } catch (error) {
        await t.rollback();
        res.status(500).json({ message: error.message });
    }
};

// GET /api/orders/my-orders
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            where: { userId: req.user.id },
            include: [
                { model: OrderItem, as: 'items', include: [Product] },
                { model: Payment, as: 'payment' }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/orders/admin
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            include: [{ model: OrderItem, as: 'items', include: [Product] }],
            order: [['createdAt', 'DESC']],
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/orders/admin/:id/status
exports.updateStatus = async (req, res) => {
    const { status } = req.body;
    const allowedStatus = ['pending', 'shipped', 'completed', 'cancelled'];
    if (!allowedStatus.includes(status)) return res.status(400).json({ message: 'Trạng thái không hợp lệ' });

    try {
        const order = await Order.findByPk(req.params.id);
        if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

        order.status = status;
        await order.save();

        const orderDetail = await Order.findByPk(order.id, {
            include: [{ model: OrderItem, as: 'items', include: [Product] }]
        });

        res.json(orderDetail);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/orders/quick (đơn 1 sản phẩm)
exports.quickOrder = async (req, res) => {
    const {
        productId,
        quantity,
        phone,
        address,
        paymentMethod,
        bankName,
        cardHolderName,
        accountNumber
    } = req.body;

    if (!productId || !quantity || quantity < 1) {
        return res.status(400).json({ message: 'Dữ liệu không hợp lệ' });
    }
    if (!paymentMethod || !['COD', 'bank'].includes(paymentMethod)) {
        return res.status(400).json({ message: 'Phương thức thanh toán không hợp lệ' });
    }

    const t = await sequelize.transaction();
    try {
        const userId = req.user.id;
        const product = await Product.findByPk(productId);
        if (!product) throw new Error('Sản phẩm không tồn tại');
        if (product.stock < quantity) throw new Error('Số lượng vượt quá tồn kho');

        const totalAmount = product.price * quantity;
        const orderNumber = generateOrderNumber();

        const order = await Order.create({
            orderNumber,
            userId,
            totalAmount,
            status: 'pending',
            shippingAddress: JSON.stringify({ phone, address }),
            paymentMethod
        }, { transaction: t });

        await OrderItem.create({
            orderId: order.id,
            productId: product.id,
            unitPrice: product.price,
            quantity,
            total: totalAmount
        }, { transaction: t });

        const paymentStatus = paymentMethod === 'bank' ? 'paid' : 'unpaid';

        await Payment.create({
            orderId: order.id,
            method: paymentMethod,
            amount: totalAmount,
            status: paymentStatus
        }, { transaction: t });

        await t.commit();

        const fullOrder = await Order.findByPk(order.id, {
            include: [
                { model: OrderItem, as: 'items', include: [Product] },
                { model: Payment, as: 'payment' }
            ]
        });

        res.status(201).json({ success: true, order: fullOrder });
    } catch (err) {
        await t.rollback();
        res.status(500).json({ message: err.message });
    }
};