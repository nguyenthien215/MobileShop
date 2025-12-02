const express = require("express");
const cors = require('cors');
const sequelize = require("./config/db");
require("dotenv").config();
const authRoutes = require("./src/routes/auth.routes");
const adminRoutes = require('./src/routes/admin.routes');
const bcrypt = require("bcrypt");
const User = require("./src/models/user.model");
const categoryRoutes = require("./src/routes/category.routes"); // ✅ thêm
const productRoutes = require("./src/routes/product.routes");
const reviewRoutes = require("./src/routes/review.routes");
const path = require('path');
const uploadRoutes = require('./src/routes/upload.routes');
const orderRoutes = require("./src/routes/order.routes");
const cartRoutes = require('./src/routes/cart.routes');
const userRoutes = require('./src/routes/user.routes');
const vnpayRoutes = require('./src/routes/vnpay.routes');
const payosRoutes = require('./src/routes/payos.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Thêm dòng này để Sequelize biết có model User
// require("./src/models/user.model"); // <-- dòng này rất quan trọng
require("./src/models/index");

// Middleware CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json()); // 👈 để đọc body JSON
app.use(express.urlencoded({ extended: true }));
// ✅ Kết nối route
app.use("/api/auth", authRoutes); // → /api/auth/register / login

app.use('/api/admin', adminRoutes);

app.use("/api/categories", categoryRoutes); // ✅ hoạt động
app.use("/api/products", productRoutes);    // ✅ hoạt động

app.use("/api/reviews", reviewRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/vnpay', vnpayRoutes);

// Upload routes
app.use('/api/upload', uploadRoutes);
// Kiểm tra kết nối MySQL

app.use('/api/cart', cartRoutes);

app.use("/api/orders", orderRoutes);

app.use('/api/user', userRoutes);

app.use('/api/payos', payosRoutes);

sequelize
  .authenticate()
  .then(() => {
    console.log("✅ MySQL connection successful!");
  })
  .catch((err) => {
    console.error("❌ Unable to connect to MySQL:", err);
  });

// Test route
app.get("/", (req, res) => {
  res.send("🚀 Server is running successfully!");
});

// ✅ Đồng bộ cơ sở dữ liệu (tạo bảng nếu chưa có)
sequelize
  .sync()
  .then(() => console.log("🧩 Database synced"))
  .catch((err) => console.error("❌ Sync error:", err));

// Khởi động server
app.listen(PORT, () => {
  console.log(`🌐 Server running at http://localhost:${PORT}`);
});

module.exports = app;