'use strict';
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert('roles', [
            { name: 'user', description: 'Người dùng bình thường', createdAt: new Date(), updatedAt: new Date() },
            { name: 'admin', description: 'Quản trị viên', createdAt: new Date(), updatedAt: new Date() }
        ]);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('roles', null, {});
    }
};
