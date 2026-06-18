require('dotenv').config();
const bcrypt = require('bcryptjs');
const { User, syncModels, sequelize } = require('./src/models');

async function run() {
  await syncModels();
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'admin123';

  const existing = await User.findOne({ where: { username } });
  if (existing) {
    console.log(`Tài khoản "${username}" đã tồn tại.`);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await User.create({ username, passwordHash, role: 'admin' });

  console.log(`Đã tạo tài khoản admin: ${username}`);
  await sequelize.close();
  process.exit(0);
}

run().catch(console.error);