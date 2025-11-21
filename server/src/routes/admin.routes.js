const express = require('express');
const jwt = require('../middlewares/jwt.middleware');
const isAdmin = require('../middlewares/isAdmin.middleware');
const adminController = require('../controllers/admin.controller');

const router = express.Router();

// Dashboard
router.get('/stats', jwt, isAdmin, adminController.getDashboardStats);

// Users
router.get('/users', jwt, isAdmin, adminController.getAllUsers);
router.put('/users/:id', jwt, isAdmin, adminController.updateUser);
router.delete('/users/:id', jwt, isAdmin, adminController.deleteUser);

// Categories
router.get('/categories', jwt, isAdmin, adminController.listCategories);
router.post('/categories', jwt, isAdmin, adminController.createCategory);
router.put('/categories/:id', jwt, isAdmin, adminController.updateCategory);
router.delete('/categories/:id', jwt, isAdmin, adminController.deleteCategory);

// Products
router.get('/products', jwt, isAdmin, adminController.listProducts);
router.post('/products', jwt, isAdmin, adminController.createProduct);
router.put('/products/:id', jwt, isAdmin, adminController.updateProduct);
router.delete('/products/:id', jwt, isAdmin, adminController.deleteProduct);

// Orders
router.get('/orders', jwt, isAdmin, adminController.listOrders);
router.put('/orders/:id/status', jwt, isAdmin, adminController.updateOrderStatus);
router.delete('/orders/:id', jwt, isAdmin, adminController.deleteOrder);

// Reviews
router.get('/reviews', jwt, isAdmin, adminController.listReviews);
router.delete('/reviews/:id', jwt, isAdmin, adminController.deleteReview);
router.put('/reviews/:id/reply', jwt, isAdmin, adminController.replyReview);

// Payments
router.get('/payments', jwt, isAdmin, adminController.listPayments);
router.put('/payments/:id/status', jwt, isAdmin, adminController.updatePaymentStatus);

module.exports = router;