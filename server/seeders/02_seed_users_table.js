'use strict';
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

module.exports = {
    async up(queryInterface, Sequelize) {
        const saltRounds = 10;

        await queryInterface.bulkInsert('users', [
            {
                id: uuidv4(),
                name: 'Nguyen Van A',
                email: 'user1@example.com',
                passwordHash: bcrypt.hashSync('user1pass', saltRounds),
                role: 'user',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: uuidv4(),
                name: 'Nguyen Van B',
                email: 'user2@example.com',
                passwordHash: bcrypt.hashSync('user2pass', saltRounds),
                role: 'user',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: uuidv4(),
                name: 'Admin',
                email: 'admin@example.com',
                passwordHash: bcrypt.hashSync('Admin@123', saltRounds),
                role: 'admin',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('users', null, {});
    },
};
