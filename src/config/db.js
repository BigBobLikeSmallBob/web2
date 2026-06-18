const { Sequelize } = require('sequelize');
const path = require('path');

// Cấu hình kết nối tới SQLite.
// Dữ liệu sẽ được lưu trong một file duy nhất, rất tiện lợi cho việc phát triển và di chuyển.
const storagePath = process.env.SQLITE_STORAGE || path.join(__dirname, '..', '..', 'database.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: storagePath, // Đường dẫn tới file database
  logging: false, // Tắt log SQL query ra console, có thể bật để debug
});

module.exports = sequelize;