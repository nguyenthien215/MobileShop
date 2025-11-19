const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Category = sequelize.define('Category', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: { type: DataTypes.STRING, allowNull: false },
    slug: { type: DataTypes.STRING, allowNull: false, unique: true },
    image: { type: DataTypes.STRING, allowNull: true }
}, {
    timestamps: true,
    tableName: 'categories'
});

module.exports = Category;