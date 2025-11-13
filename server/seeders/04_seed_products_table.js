'use strict';
const { v4: uuidv4 } = require('uuid');
module.exports = {
    async up(queryInterface, Sequelize) {
        const categories = await queryInterface.sequelize.query(`SELECT id, name FROM categories;`);
        const categoryRows = categories[0];

        await queryInterface.bulkInsert('products', [
            {
                id: uuidv4(),
                name: 'MacBook Pro 16',
                slug: 'macbook-pro-16',
                description: 'Laptop cao cấp của Apple',
                price: 5000,
                stock: 10,
                images: JSON.stringify(['img1.jpg', 'img2.jpg']),
                specs: JSON.stringify({ CPU: 'M1', RAM: '16GB' }),
                brand: 'Apple',
                categoryId: categoryRows.find(c => c.name === 'Laptop').id,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: uuidv4(),
                name: 'iPhone 14',
                slug: 'iphone-14',
                description: 'Điện thoại Apple mới nhất',
                price: 1200,
                stock: 20,
                images: JSON.stringify(['iphone1.jpg', 'iphone2.jpg']),
                specs: JSON.stringify({ RAM: '6GB', Storage: '128GB' }),
                brand: 'Apple',
                categoryId: categoryRows.find(c => c.name === 'Điện thoại').id,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('products', null, {});
    }
};
