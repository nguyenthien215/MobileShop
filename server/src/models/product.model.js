const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const { v4: uuidv4 } = require('uuid');

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, // ✅ Tự sinh UUID
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    description: {
        type: DataTypes.TEXT,
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    images: {
        type: DataTypes.JSON,
    },
    specs: {
        type: DataTypes.JSON,
    },
    brand: {
        type: DataTypes.STRING,
    },
    categoryId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'categories',
            key: 'id',
        },
    },
}, {
    timestamps: true,
    tableName: 'products',
});

module.exports = Product;
