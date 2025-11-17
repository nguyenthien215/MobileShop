const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const CartItem = sequelize.define('CartItem', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false },
    productId: { type: DataTypes.UUID, allowNull: false },
    quantity: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 1 }
}, { tableName: 'cart_items', timestamps: true });

module.exports = CartItem;