const express = require('express');
const router = express.Router();
const jwt = require('../middlewares/jwt.middleware');
const cartController = require('../controllers/cart.controller');

router.get('/', jwt, cartController.getCart);
router.post('/', jwt, cartController.add);
router.patch('/:id', jwt, cartController.updateQuantity);
router.delete('/:id', jwt, cartController.remove);
router.delete('/', jwt, cartController.clear);

module.exports = router;