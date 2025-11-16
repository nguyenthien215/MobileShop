const Product = require('../models/product.model');
const Category = require('../models/category.model');
const { Op } = require('sequelize');

exports.getAll = async (req, res) => {
    try {
        const {
            search,
            category,         // categoryId (tùy chọn)
            categorySlug,     // slug category
            priceMin,
            priceMax,
            page = 1,
            limit = 10
        } = req.query;

        const where = {};

        if (search) {
            where.name = { [Op.like]: `%${search}%` };
        }

        // Lọc giá
        if (priceMin || priceMax) {
            where.price = {};
            if (priceMin) where.price[Op.gte] = Number(priceMin);
            if (priceMax) where.price[Op.lte] = Number(priceMax);
        }

        let include = [{ model: Category, attributes: ['id', 'name', 'slug'] }];

        // Ưu tiên categorySlug trước, nếu không có mới dùng categoryId
        if (categorySlug) {
            include = [{
                model: Category,
                attributes: ['id', 'name', 'slug'],
                where: { slug: categorySlug }
            }];
        } else if (category) {
            where.categoryId = category;
        }

        const products = await Product.findAndCountAll({
            where,
            include,
            offset: (page - 1) * limit,
            limit: parseInt(limit)
        });

        res.json(products);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};
exports.getById = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id, {
            include: [{ model: Category, attributes: ['id', 'name'] }],
        });
        if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { name, slug, description, price, stock, images, specs, brand, categoryId } = req.body;

        const product = await Product.create({
            name,
            slug,
            description,
            price,
            stock,
            images: JSON.stringify(images || []),
            specs: JSON.stringify(specs || {}),
            brand,
            categoryId
        });

        res.status(201).json({ message: 'Sản phẩm đã được thêm', product });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};


exports.update = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        await product.update(req.body);
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        await product.destroy();
        res.json({ message: 'Đã xóa sản phẩm' });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};
