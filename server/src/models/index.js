const User = require('./user.model');
const Order = require('./order.model');
const OrderItem = require('./orderItem.model');
const Product = require('./product.model');
const Category = require('./category.model');
const CartItem = require('./cartItem.model');
const Review = require('./review.model');
const Payment = require('./payment.model');

// ===================== ASSOCIATIONS =====================

// 🔹 User - Order
User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

// 🔹 Order - OrderItem
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

// ... sau phần Order - OrderItem
Order.hasOne(Payment, { foreignKey: 'orderId', as: 'payment' });
Payment.belongsTo(Order, { foreignKey: 'orderId' });

// 🔹 Product - OrderItem
Product.hasMany(OrderItem, { foreignKey: 'productId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

// 🔹 Category - Product
Category.hasMany(Product, { foreignKey: 'categoryId' });
Product.belongsTo(Category, { foreignKey: 'categoryId' });

// 🔹 User - Review
User.hasMany(Review, { foreignKey: 'userId' });
Review.belongsTo(User, { foreignKey: 'userId' });

// 🔹 Product - Review
Product.hasMany(Review, { foreignKey: 'productId' });
Review.belongsTo(Product, { foreignKey: 'productId' });

// 🔹 User - CartItem
User.hasMany(CartItem, { foreignKey: 'userId' });
CartItem.belongsTo(User, { foreignKey: 'userId' });

// 🔹 Product - CartItem
Product.hasMany(CartItem, { foreignKey: 'productId' });
CartItem.belongsTo(Product, { foreignKey: 'productId' });

// =========================================================

module.exports = {
    User,
    Order,
    OrderItem,
    Product,
    Category,
    CartItem,
    Review,
    Payment
};
