const sequelize = require('../config/db');
const User = require('./User');
const Job = require('./Job');
const Application = require('./Application');

const syncModels = async (force = false) => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force });
    console.log('Kết nối SQL Server & Đồng bộ Table thành công.');
  } catch (error) {
    console.error('Lỗi kết nối Database:', error);
    throw error;
  }
};

module.exports = {
  User,
  Job,
  Application,
  syncModels,
  sequelize,
};