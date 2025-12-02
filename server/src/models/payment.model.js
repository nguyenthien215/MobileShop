const sequelize = require('../../config/db');
const { DataTypes } = require('sequelize');



const Payment = sequelize.define('Payment', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    orderId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, unique: true },
    method: { type: DataTypes.ENUM('COD', 'bank', 'momo', 'zalopay', 'payos'), allowNull: false },
    amount: { type: DataTypes.FLOAT, allowNull: false },
    status: { type: DataTypes.ENUM('paid', 'unpaid', 'pending', 'failed', 'cancelled'), defaultValue: 'unpaid' },
    transactionId: { type: DataTypes.STRING, allowNull: true }
}, { tableName: 'payments' });

module.exports = Payment;