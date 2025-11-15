const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Category = sequelize.define('Category', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
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
    image: {                        // 👈 thêm trường này
        type: DataTypes.STRING,
        allowNull: true
    },
}, {
    timestamps: true,
    tableName: 'categories',
});

module.exports = Category;
