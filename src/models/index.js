const sequelize = require('../config/db');
const User = require('./User');
const Job = require('./Job');
const Application = require('./Application');

const syncModels = async (force = false) => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force });
    console.log('Đồng bộ cơ sở dữ liệu thành công.');
  } catch (error) {
    console.error('Lỗi đồng bộ cơ sở dữ liệu:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  User,
  Job,
  Application,
  syncModels,
};