'use strict';
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert('promotions', [
            { code: 'DISCOUNT10', discountType: 'percent', discountValue: 10, startDate: new Date(), endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), status: 'active', createdAt: new Date(), updatedAt: new Date() },
            { code: 'FIXED50', discountType: 'fixed', discountValue: 50, startDate: new Date(), endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), status: 'active', createdAt: new Date(), updatedAt: new Date() }
        ]);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('promotions', null, {});
    }
};
