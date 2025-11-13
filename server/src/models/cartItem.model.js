const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const CartItem = sequelize.define('CartItem', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
    },
}, {
    timestamps: true,
    tableName: 'cart_items',
});

module.exports = CartItem;
