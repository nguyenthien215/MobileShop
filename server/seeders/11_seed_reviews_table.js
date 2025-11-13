'use strict';
module.exports = {
    async up(queryInterface, Sequelize) {
        const users = await queryInterface.sequelize.query(`SELECT id FROM users;`);
        const products = await queryInterface.sequelize.query(`SELECT id FROM products;`);
        const userRows = users[0];
        const productRows = products[0];

        await queryInterface.bulkInsert('reviews', [
            { productId: productRows[0].id, userId: userRows[0].id, rating: 5, comment: 'Sản phẩm tuyệt vời', createdAt: new Date(), updatedAt: new Date() },
            { productId: productRows[1].id, userId: userRows[1].id, rating: 4, comment: 'Hài lòng', createdAt: new Date(), updatedAt: new Date() }
        ]);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('reviews', null, {});
    }
};
