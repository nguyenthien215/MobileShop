'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
    async up(queryInterface) {
        const [categoryRows] = await queryInterface.sequelize.query('SELECT id, name FROM categories;');

        const catId = (name) => {
            const c = categoryRows.find(r => r.name === name);
            if (!c) throw new Error(`Không tìm thấy category: ${name}`);
            return c.id;
        };

        const now = new Date();

        await queryInterface.bulkInsert('products', [
            // Điện thoại
            {
                id: uuidv4(),
                name: 'iPhone 17 Pro Max – 2TB',
                slug: 'iphone-17-pro-max-2tb',
                description: 'iPhone 17 Pro Max 2TB - Chính hãng',
                price: 55000000,
                stock: 10,
                images: JSON.stringify([
                    '/uploads/products/iphone17pro-1.webp',
                    '/uploads/products/iphone17pro-2.webp',
                    '/uploads/products/iphone17pro-3.webp'
                ]),
                specs: JSON.stringify({ chip: 'A17', ram: '2TB' }),
                brand: 'Apple',
                categoryId: catId('Điện thoại'),
                createdAt: now,
                updatedAt: now
            },
            {
                id: uuidv4(),
                name: 'iPhone 17 – 1TB',
                slug: 'iphone-17-1tb',
                description: 'iPhone 17 1TB - Chính hãng',
                price: 42000000,
                stock: 5,
                images: JSON.stringify([
                    '/uploads/products/iphone17-1.webp',
                    '/uploads/products/iphone17-2.webp',
                    '/uploads/products/iphone17-3.webp'
                ]),
                specs: JSON.stringify({ chip: 'A17', ram: '1TB' }),
                brand: 'Apple',
                categoryId: catId('Điện thoại'),
                createdAt: now,
                updatedAt: now
            },
            {
                id: uuidv4(),
                name: 'iPhone Air – 512GB',
                slug: 'iphone-air-512gb',
                description: 'iPhone Air 512GB - Chính hãng',
                price: 39000000,
                stock: 5,
                images: JSON.stringify([
                    '/uploads/products/iphoneair-1.webp',
                    '/uploads/products/iphoneair-2.webp',
                    '/uploads/products/iphoneair-3.webp'
                ]),
                specs: JSON.stringify({ chip: 'A17', ram: '512GB' }),
                brand: 'Apple',
                categoryId: catId('Điện thoại'),
                createdAt: now,
                updatedAt: now
            },
            {
                id: uuidv4(),
                name: 'iPhone 16 Pro Max – 1TB',
                slug: 'iphone-16-pro-max-1tb',
                description: 'iPhone 16 Pro Max 1TB - Chính hãng',
                price: 35000000,
                stock: 6,
                images: JSON.stringify([
                    '/uploads/products/iphone16prm-1.webp',
                    '/uploads/products/iphone16prm-2.webp',
                    '/uploads/products/iphone16prm-3.webp'
                ]),
                specs: JSON.stringify({ chip: 'A16', ram: '1TB' }),
                brand: 'Apple',
                categoryId: catId('Điện thoại'),
                createdAt: now,
                updatedAt: now
            },
            {
                id: uuidv4(),
                name: 'iPhone 16 – 256GB',
                slug: 'iphone-16-256gb',
                description: 'iPhone 16 256GB - Chính hãng',
                price: 29000000,
                stock: 4,
                images: JSON.stringify([
                    '/uploads/products/iphone16-1.webp',
                    '/uploads/products/iphone16-2.webp',
                    '/uploads/products/iphone16-3.webp'
                ]),
                specs: JSON.stringify({ chip: 'A16', ram: '256GB' }),
                brand: 'Apple',
                categoryId: catId('Điện thoại'),
                createdAt: now,
                updatedAt: now
            },
            {
                id: uuidv4(),
                name: 'iPhone 14 Pro Max – 1TB',
                slug: 'iphone-14-pro-max-1tb',
                description: 'iPhone 14 Pro Max 1TB - Chính hãng',
                price: 25000000,
                stock: 6,
                images: JSON.stringify([
                    '/uploads/products/iphone14prm-1.webp',
                    '/uploads/products/iphone14prm-2.webp',
                    '/uploads/products/iphone14prm-3.webp'
                ]),
                specs: JSON.stringify({ chip: 'A14', ram: '1TB' }),
                brand: 'Apple',
                categoryId: catId('Điện thoại'),
                createdAt: now,
                updatedAt: now
            },

            // Laptop
            {
                id: uuidv4(),
                name: 'MacBook Air 13" M4 16GB/256GB',
                slug: 'macbook-air-m4-16gb-256gb',
                description: 'MacBook Air 13 inch M4 16GB/256GB - Chính hãng',
                price: 42000000,
                stock: 8,
                images: JSON.stringify([
                    '/uploads/products/macbookM4.jpg',
                    '/uploads/products/macbookM4-2.jpg',
                    '/uploads/products/macbookM4-3.jpg'
                ]),
                specs: JSON.stringify({ chip: 'M4', ram: '16GB', storage: '256GB' }),
                brand: 'Apple',
                categoryId: catId('Laptop'),
                createdAt: now,
                updatedAt: now
            },
            {
                id: uuidv4(),
                name: 'MacBook Air 13" M2 16GB/256GB',
                slug: 'macbook-air-m2-16gb-256gb',
                description: 'MacBook Air 13 inch M2 16GB/256GB - Chính hãng',
                price: 36000000,
                stock: 8,
                images: JSON.stringify([
                    '/uploads/products/macbookM2.jpg',
                    '/uploads/products/macbookM2-2.jpg',
                    '/uploads/products/macbookM2-3.jpg'
                ]),
                specs: JSON.stringify({ chip: 'M2', ram: '16GB', storage: '256GB' }),
                brand: 'Apple',
                categoryId: catId('Laptop'),
                createdAt: now,
                updatedAt: now
            },
            {
                id: uuidv4(),
                name: 'MacBook Air 13" M1 16GB/256GB',
                slug: 'macbook-air-m1-16gb-256gb',
                description: 'MacBook Air 13 inch M1 16GB/256GB - Chính hãng',
                price: 20000000,
                stock: 7,
                images: JSON.stringify([
                    '/uploads/products/macbookM1.jpg',
                    '/uploads/products/macbookM1-2.jpg',
                    '/uploads/products/macbookM1-3.jpg'
                ]),
                specs: JSON.stringify({ chip: 'M1', ram: '16GB', storage: '256GB' }),
                brand: 'Apple',
                categoryId: catId('Laptop'),
                createdAt: now,
                updatedAt: now
            },

            // Phụ kiện
            {
                id: uuidv4(),
                name: 'Củ sạc Baseus Super SI 20W + Cáp USB-C',
                slug: 'cu-sac-baseus-super-si-20w',
                description: 'Củ sạc Baseus Super SI 1 cổng 20W kèm cáp USB-C - Chính hãng',
                price: 1100000,
                stock: 3,
                images: JSON.stringify([
                    '/uploads/products/sac-1.webp',
                    '/uploads/products/sac-2.webp',
                    '/uploads/products/sac-3.webp'
                ]),
                specs: JSON.stringify({ watt: '20W', port: 'USB-C' }),
                brand: 'Baseus',
                categoryId: catId('Phụ kiện'),
                createdAt: now,
                updatedAt: now
            },
            {
                id: uuidv4(),
                name: 'Module Light Mode cho GoPro Hero 8',
                slug: 'module-light-mode-gopro-hero-8',
                description: 'Phụ kiện mở rộng Light Mode cho GoPro Hero 8 - Chính hãng',
                price: 1500000,
                stock: 2,
                images: JSON.stringify([
                    '/uploads/products/camera-1.webp',
                    '/uploads/products/camera-2.webp',
                    '/uploads/products/camera-3.webp'
                ]),
                specs: JSON.stringify({ mode: 'Light', version: 'GoPro Hero 8' }),
                brand: 'GoPro',
                categoryId: catId('Phụ kiện'),
                createdAt: now,
                updatedAt: now
            },
            {
                id: uuidv4(),
                name: 'AirPods 4 MXP63',
                slug: 'airpods-4-mxp63',
                description: 'AirPods 4 MXP63 - Chính hãng',
                price: 2200000,
                stock: 4,
                images: JSON.stringify([
                    '/uploads/products/tainghe-1.jpg',
                    '/uploads/products/tainghe-2.jpg',
                    '/uploads/products/tainghe-3.jpg'
                ]),
                specs: JSON.stringify({ chargingPort: 'Type-C', technology: 'Voice Isolation' }),
                brand: 'Apple',
                categoryId: catId('Phụ kiện'),
                createdAt: now,
                updatedAt: now
            }
        ]);
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('products', null, {});
    }
};