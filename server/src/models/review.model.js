const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Review = sequelize.define('Review', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    // Đổi sang UUID để khớp với products.id (CHAR(36) migration)
    productId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1, max: 5 },
    },
    comment: {
        type: DataTypes.TEXT,
    },
    adminReply: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
    },
}, {
    timestamps: true,
    tableName: 'reviews',
    indexes: [
        {
            unique: true,
            fields: ['userId', 'productId'], // 1 người 1 sản phẩm chỉ 1 review (cập nhật nếu đánh giá lại)
        }
    ]
});

module.exports = Review;