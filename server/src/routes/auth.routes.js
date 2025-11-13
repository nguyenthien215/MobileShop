const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');

// router đăng nhập đăng ký

const router = express.Router();

router.post(
    '/register',
    [
        body('email').isEmail().withMessage('Email không hợp lệ'),
        body('password').isLength({ min: 6 }).withMessage('Mật khẩu phải ≥ 6 ký tự'),
        body('name').notEmpty().withMessage('Tên không được để trống'),
    ],
    authController.register
);

router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Email không hợp lệ'),
        body('password').isLength({ min: 6 }).withMessage('Mật khẩu phải ≥ 6 ký tự'),
    ],
    authController.login
);

//  PHẢI CÓ DÒNG NÀY
module.exports = router;
