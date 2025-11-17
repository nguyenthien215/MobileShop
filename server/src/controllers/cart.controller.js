const CartItem = require('../models/cartItem.model');
const Product = require('../models/product.model');
const { Op } = require('sequelize');

function buildResponse(items) {
    const total = items.reduce((s, it) => s + it.quantity * (it.Product?.price || 0), 0);
    const count = items.reduce((s, it) => s + it.quantity, 0);
    return { items, total, count };
}

exports.getCart = async (req, res) => {
    try {
        const items = await CartItem.findAll({
            where: { userId: req.user.id },
            include: [{ model: Product }]
        });
        res.json(buildResponse(items));
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

exports.add = async (req, res) => {
    const { productId, quantity = 1 } = req.body;
    if (!productId) return res.status(400).json({ message: 'Thiếu productId' });
    try {
        const existing = await CartItem.findOne({ where: { userId: req.user.id, productId } });
        if (existing) {
            existing.quantity += quantity;
            await existing.save();
        } else {
            await CartItem.create({ userId: req.user.id, productId, quantity });
        }
        const items = await CartItem.findAll({ where: { userId: req.user.id }, include: [Product] });
        res.status(201).json(buildResponse(items));
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

exports.updateQuantity = async (req, res) => {
    const { quantity } = req.body;
    if (quantity < 1) return res.status(400).json({ message: 'Số lượng phải >= 1' });
    try {
        const item = await CartItem.findOne({ where: { id: req.params.id, userId: req.user.id } });
        if (!item) return res.status(404).json({ message: 'Không tìm thấy item' });
        item.quantity = quantity;
        await item.save();
        const items = await CartItem.findAll({ where: { userId: req.user.id }, include: [Product] });
        res.json(buildResponse(items));
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

exports.remove = async (req, res) => {
    try {
        const item = await CartItem.findOne({ where: { id: req.params.id, userId: req.user.id } });
        if (!item) return res.status(404).json({ message: 'Không tìm thấy item' });
        await item.destroy();
        const items = await CartItem.findAll({ where: { userId: req.user.id }, include: [Product] });
        res.json(buildResponse(items));
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

exports.clear = async (req, res) => {
    try {
        await CartItem.destroy({ where: { userId: req.user.id } });
        res.json({ items: [], total: 0, count: 0 });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};