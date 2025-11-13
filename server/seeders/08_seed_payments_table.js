'use strict';
module.exports = {
    async up(queryInterface, Sequelize) {
        const orders = await queryInterface.sequelize.query(`SELECT id FROM orders;`);
        const orderRows = orders[0];

        await queryInterface.bulkInsert('payments', [
            {
                orderId: orderRows[0].id,
                method: 'COD',
                amount: 5000,
                status: 'unpaid',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('payments', null, {});
    }
};
