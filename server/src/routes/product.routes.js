const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const jwt = require('../middlewares/jwt.middleware');
const isAdmin = require('../middlewares/isAdmin.middleware');

router.get('/', productController.getAll);
router.get('/:id', productController.getById);
router.post('/', jwt, isAdmin, productController.create);
router.put('/:id', jwt, isAdmin, productController.update);
router.delete('/:id', jwt, isAdmin, productController.delete);

module.exports = router;
