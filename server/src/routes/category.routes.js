const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const jwt = require('../middlewares/jwt.middleware');
const isAdmin = require('../middlewares/isAdmin.middleware');

router.get('/', categoryController.getAll);
router.post('/', jwt, isAdmin, categoryController.create);
// Cập nhật category theo ID (admin)
router.put('/:id', jwt, isAdmin, categoryController.update);
// Xóa category theo ID (admin)
router.delete('/:id', jwt, isAdmin, categoryController.delete);

module.exports = router;
