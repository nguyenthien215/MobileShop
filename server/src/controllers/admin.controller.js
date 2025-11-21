const { Op } = require('sequelize');
const User = require('../models/user.model');
const Product = require('../models/product.model');
const Category = require('../models/category.model');
const Order = require('../models/order.model');
const OrderItem = require('../models/orderItem.model');
const Review = require('../models/review.model');
const Payment = require('../models/payment.model');

// DASHBOARD
exports.getDashboardStats = async (req, res) => {
    try {
        const [usersCount, productsCount, ordersCount, revenuePaid] = await Promise.all([
            User.count(),
            Product.count(),
            Order.count(),
            Payment.sum('amount', { where: { status: 'paid' } })
        ]);
        res.json({
            users: usersCount,
            products: productsCount,
            orders: ordersCount,
            revenue: revenuePaid || 0
        });
    } catch (err) {
        console.error('Dashboard error:', err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// USERS
exports.getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const result = await User.findAndCountAll({
            attributes: ['id', 'name', 'email', 'role', 'createdAt'],
            order: [['createdAt', 'DESC']],
            offset: parseInt(offset),
            limit: parseInt(limit)
        });

        res.json(result);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, role } = req.body;
        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });
        if (role && !['admin', 'user'].includes(role)) {
            return res.status(400).json({ message: 'Role không hợp lệ' });
        }
        await user.update({ name: name ?? user.name, role: role ?? user.role });
        res.json({ message: 'Cập nhật user thành công', user });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });
        await user.destroy();
        res.json({ message: 'Đã xóa user' });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// CATEGORIES
exports.listCategories = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const result = await Category.findAndCountAll({
            order: [['createdAt', 'DESC']],
            offset: parseInt(offset),
            limit: parseInt(limit)
        });

        res.json(result);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const { name, slug, image } = req.body;
        if (!name) return res.status(400).json({ message: 'Thiếu tên' });
        const finalSlug = slug || name.trim().toLowerCase().replace(/\s+/g, '-');
        const exists = await Category.findOne({ where: { slug: finalSlug } });
        if (exists) return res.status(400).json({ message: 'Slug đã tồn tại' });
        const cat = await Category.create({ name, slug: finalSlug, image });
        res.status(201).json({ message: 'Tạo danh mục thành công', category: cat });
    } catch (err) {
        if (err.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Slug đã tồn tại' });
        }
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { name, slug, image } = req.body;
        const category = await Category.findByPk(req.params.id);
        if (!category) return res.status(404).json({ message: 'Không tìm thấy danh mục' });
        const finalSlug = slug || (name ? name.trim().toLowerCase().replace(/\s+/g, '-') : category.slug);
        if (finalSlug !== category.slug) {
            const exists = await Category.findOne({ where: { slug: finalSlug } });
            if (exists) return res.status(400).json({ message: 'Slug đã tồn tại' });
        }
        await category.update({
            name: name ?? category.name,
            slug: finalSlug,
            image: image ?? category.image
        });
        res.json({ message: 'Cập nhật thành công', category });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) return res.status(404).json({ message: 'Không tìm thấy danh mục' });
        await category.destroy();
        res.json({ message: 'Đã xóa danh mục' });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// PRODUCTS
exports.listProducts = async (req, res) => {
    try {
        const { search, page = 1, limit = 20 } = req.query;
        const where = {};
        if (search) where.name = { [Op.like]: `%${search}%` };
        const result = await Product.findAndCountAll({
            where,
            include: [{ model: Category, attributes: ['id', 'name', 'slug'] }],
            order: [['createdAt', 'DESC']],
            offset: (page - 1) * limit,
            limit: parseInt(limit)
        });
        // Debug log
        if (result.rows.length > 0) {
            console.log('[Admin listProducts] Sample product images:', result.rows[0].images);
            console.log('[Admin listProducts] Images type:', typeof result.rows[0].images);
            console.log('[Admin listProducts] Is array:', Array.isArray(result.rows[0].images));
        }
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const { name, slug, description, price, stock, images, specs, brand, categoryId } = req.body;
        console.log('[Admin createProduct] Received images:', images);
        console.log('[Admin createProduct] Images type:', typeof images);
        console.log('[Admin createProduct] Is array:', Array.isArray(images));
        if (!name || !price || !categoryId) return res.status(400).json({ message: 'Thiếu dữ liệu bắt buộc' });
        const finalSlug = slug || name.trim().toLowerCase().replace(/\s+/g, '-');
        const exists = await Product.findOne({ where: { slug: finalSlug } });
        if (exists) return res.status(400).json({ message: 'Slug đã tồn tại' });
        const product = await Product.create({
            name,
            slug: finalSlug,
            description,
            price,
            stock: stock || 0,
            images: images || [],
            specs: specs || {},
            brand,
            categoryId
        });
        console.log('[Admin createProduct] Created product images:', product.images);
        res.status(201).json({ message: 'Tạo sản phẩm thành công', product });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        const { name, slug, images } = req.body;
        let finalSlug = slug;
        if (!finalSlug && name) finalSlug = name.trim().toLowerCase().replace(/\s+/g, '-');
        if (finalSlug && finalSlug !== product.slug) {
            const exists = await Product.findOne({ where: { slug: finalSlug } });
            if (exists) return res.status(400).json({ message: 'Slug đã tồn tại' });
        }
        await product.update({ ...req.body, slug: finalSlug || product.slug, images: images ?? product.images });
        res.json({ message: 'Cập nhật sản phẩm thành công', product });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        await product.destroy();
        res.json({ message: 'Đã xóa sản phẩm' });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// ORDERS
exports.listOrders = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const result = await Order.findAndCountAll({
            include: [
                { model: User, attributes: ['id', 'name', 'email'] },
                { model: OrderItem, as: 'items', include: [Product] },
                { model: Payment, as: 'payment' }
            ],
            order: [['createdAt', 'DESC']],
            offset: parseInt(offset),
            limit: parseInt(limit)
        });

        console.log('[Admin listOrders] Page:', page, 'Limit:', limit);
        console.log('[Admin listOrders] Total count:', result.count);
        console.log('[Admin listOrders] Rows returned:', result.rows.length);

        res.json(result);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const allowed = ['pending', 'shipped', 'completed', 'cancelled'];
        if (!allowed.includes(status)) return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
        const order = await Order.findByPk(req.params.id);
        if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        order.status = status;
        await order.save();
        const full = await Order.findByPk(order.id, {
            include: [
                { model: OrderItem, as: 'items', include: [Product] },
                { model: Payment, as: 'payment' }
            ]
        });
        res.json({ message: 'Cập nhật trạng thái thành công', order: full });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Delete order
exports.deleteOrder = async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }

        // Xóa order (OrderItems và Payments sẽ tự động xóa theo CASCADE)
        await order.destroy();

        res.json({ message: 'Đã xóa đơn hàng thành công' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// REVIEWS
exports.listReviews = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const result = await Review.findAndCountAll({
            include: [
                { model: User, attributes: ['id', 'name', 'email'] },
                { model: Product, attributes: ['id', 'name'] }
            ],
            order: [['createdAt', 'DESC']],
            offset: parseInt(offset),
            limit: parseInt(limit)
        });

        res.json(result);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findByPk(req.params.id);
        if (!review) return res.status(404).json({ message: 'Không tìm thấy review' });
        await review.destroy();
        res.json({ message: 'Đã xóa review' });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Reply to review
exports.replyReview = async (req, res) => {
    try {
        const { adminReply } = req.body;
        const review = await Review.findByPk(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Không tìm thấy review' });
        }

        review.adminReply = adminReply;
        await review.save();

        res.json({
            message: 'Đã phản hồi đánh giá thành công',
            review
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// PAYMENTS
exports.listPayments = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const result = await Payment.findAndCountAll({
            include: [{ model: Order, attributes: ['id', 'orderNumber', 'paymentMethod', 'status'] }],
            order: [['createdAt', 'DESC']],
            offset: parseInt(offset),
            limit: parseInt(limit)
        });

        res.json(result);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.updatePaymentStatus = async (req, res) => {
    try {
        const payment = await Payment.findByPk(req.params.id);
        if (!payment) return res.status(404).json({ message: 'Không tìm thấy payment' });
        const { status } = req.body;
        if (!['paid', 'unpaid'].includes(status)) return res.status(400).json({ message: 'Trạng thái payment không hợp lệ' });
        payment.status = status;
        await payment.save();
        res.json({ message: 'Cập nhật trạng thái payment thành công', payment });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};