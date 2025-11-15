'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert('categories', [
            {
                id: uuidv4(),
                name: 'Laptop',
                slug: 'laptop',
                image: 'uploads/products/laptop.jpg',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: uuidv4(),
                name: 'Điện thoại',
                slug: 'dien-thoai',
                image: 'uploads/products/dienthoai.jpg',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: uuidv4(),
                name: 'Phụ kiện',
                slug: 'phu-kien',
                image: 'uploads/products/phukien.jpg',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('categories', null, {});
    }
};