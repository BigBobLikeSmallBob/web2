const { Sequelize } = require('sequelize');

const isProduction = process.env.NODE_ENV === 'production';

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      // Đối với SQL Server, bạn có thể cần cấu hình dialectOptions cho SSL nếu server yêu cầu
      // dialectOptions: {
      //   ssl: { rejectUnauthorized: false } // Chỉ dùng cho dev/test, không khuyến khích cho production
      // },
      logging: false,
    })
  : new Sequelize(
      process.env.MSSQL_DATABASE || 'tuyendung_db',
      process.env.MSSQL_USER || 'sa',
      process.env.MSSQL_PASSWORD || 'your_sql_server_password',
      {
        host: process.env.MSSQL_HOST || 'localhost',
        // Nếu dùng Instance Name, port phải để undefined hoặc xóa đi để SQL Server Browser tự tìm cổng động
        port: process.env.MSSQL_PORT ? parseInt(process.env.MSSQL_PORT) : undefined,
        dialect: 'mssql',
        logging: false,
        dialectOptions: {
          options: {
            // Điền đúng tên instance (ví dụ: MSSQLSERVER01)
            instanceName: process.env.MSSQL_INSTANCE || undefined,
            trustServerCertificate: true, // Rất quan trọng khi chạy ở local
            encrypt: true
          }
        },
        pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
      }
    );

module.exports = sequelize;