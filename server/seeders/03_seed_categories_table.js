'use strict';
const { v4: uuidv4 } = require('uuid');
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert('categories', [
            { id: uuidv4(), name: 'Laptop', slug: 'laptop', createdAt: new Date(), updatedAt: new Date() },
            { id: uuidv4(), name: 'Điện thoại', slug: 'dien-thoai', createdAt: new Date(), updatedAt: new Date() },
            { id: uuidv4(), name: 'Phụ kiện', slug: 'phu-kien', createdAt: new Date(), updatedAt: new Date() }
        ]);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('categories', null, {});
    }
};
