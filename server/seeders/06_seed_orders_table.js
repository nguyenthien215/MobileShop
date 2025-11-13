'use strict';
module.exports = {
    async up(queryInterface, Sequelize) {
        const users = await queryInterface.sequelize.query(`SELECT id FROM users;`);
        const userRows = users[0];

        await queryInterface.bulkInsert('orders', [
            {
                orderNumber: 'ORDER001',
                userId: userRows[0].id,
                totalAmount: 5000,
                status: 'pending',
                shippingAddress: JSON.stringify({ city: 'Hanoi', street: '123 Street', phone: '0123456789' }),
                paymentMethod: 'COD',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('orders', null, {});
    }
};
