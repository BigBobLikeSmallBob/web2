require('dotenv').config();
const bcrypt = require('bcryptjs');
const { User, syncModels, sequelize } = require('../models');

async function run() {
  await syncModels();

  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const email = process.env.ADMIN_EMAIL || null;

  const existing = await User.findOne({ where: { username } });
  if (existing) {
    console.log(`Tài khoản "${username}" đã tồn tại, không tạo lại.`);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await User.create({ username, email, passwordHash, role: 'admin' });

  console.log(`Đã tạo tài khoản admin "${username}" thành công.`);
  console.log('Hãy đổi mật khẩu này ngay sau khi đăng nhập lần đầu.');
  await sequelize.close();
  process.exit(0);
}

run().catch((err) => {
  console.error('Lỗi khi tạo admin:', err);
  process.exit(1);
});