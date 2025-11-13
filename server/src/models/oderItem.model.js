const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const OrderItem = sequelize.define('OrderItem', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    orderId: { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.UUID, allowNull: false },
    unitPrice: { type: DataTypes.FLOAT, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    total: { type: DataTypes.FLOAT, allowNull: false },
}, { timestamps: false, tableName: 'order_items' });

module.exports = OrderItem;
