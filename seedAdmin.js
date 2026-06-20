require('dotenv').config();
const bcrypt = require('bcryptjs');
const { User, syncModels, sequelize } = require('./src/models');

async function run() {
  await syncModels();
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  // Bổ sung thêm biến email (đọc từ .env hoặc lấy mặc định)
  const email = process.env.ADMIN_EMAIL || 'admin@local.host'; 

  const existing = await User.findOne({ where: { username } });
  if (existing) {
    console.log(`Tài khoản "${username}" đã tồn tại.`);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  
  // Bổ sung thêm 'email' vào hàm create
  await User.create({ username, email, passwordHash, role: 'admin' });

  console.log(`Đã tạo tài khoản admin: ${username} (Email: ${email})`);
  await sequelize.close();
  process.exit(0);
}

run().catch(console.error);