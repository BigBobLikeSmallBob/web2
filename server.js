require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const apiRouter = require('./src/routes/api');
const { syncModels } = require('./src/models');
const PORT = 5000;
const HOST = '0.0.0.0';
const app = express();

const notFoundHandler = (req, res, next) => {
  res.status(404).json({ message: 'Đường dẫn không tồn tại' });
};

const errorHandler = (err, req, res, next) => {
  console.error(err); 
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Lỗi hệ thống nội bộ';

  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 400;
    const errors = err.errors.map(e => e.message);
    message = `Dữ liệu không hợp lệ: ${errors.join(', ')}`;
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token không hợp lệ hoặc đã bị thay đổi. Vui lòng đăng nhập lại.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
  } else if (err.name === 'MulterError') {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'Kích thước file vượt quá giới hạn cho phép.';
    } else {
      message = `Lỗi tải file: ${err.message}`;
    }
  }

  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

app.use(
  helmet({
    contentSecurityPolicy: false, 
  })
);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.static(path.join(__dirname, 'public')));


app.use('/api', apiRouter);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use(notFoundHandler);

app.use(errorHandler);


async function start() {
  try {
    await syncModels();
    app.listen(PORT, HOST, () => {
      console.log(`Server đang chạy tại http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Không thể khởi động server:', err);
    process.exit(1);
  }
}

start();
module.exports = app;