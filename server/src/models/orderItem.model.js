const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const OrderItem = sequelize.define('OrderItem', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    productId: {
        type: DataTypes.CHAR(36),
        allowNull: false,
    },
    unitPrice: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    total: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
}, {
    timestamps: true,
    tableName: 'order_items',
});

module.exports = OrderItem;
