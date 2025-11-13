const express = require('express');
const jwtMiddleware = require('../middlewares/jwt.middleware');
const isAdmin = require('../middlewares/isAdmin.middleware');
const adminController = require('../controllers/admin.controller');

const router = express.Router();

// Route chỉ admin mới truy cập được
router.get('/users', jwtMiddleware, isAdmin, adminController.getAllUsers);

module.exports = router;
