require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const apiRouter = require('./src/routes/api');
const { syncModels } = require('./src/models');

const app = express();

// Định nghĩa Middleware xử lý lỗi 404
const notFoundHandler = (req, res, next) => {
  res.status(404).json({ message: 'Đường dẫn không tồn tại' });
};

// Định nghĩa Middleware xử lý lỗi tập trung
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Lỗi hệ thống nội bộ',
  });
};

app.use(
  helmet({
    contentSecurityPolicy: false, // tranh chan inline script don gian cua public/js
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

// Phuc vu frontend tinh (landing page + dashboard)
app.use(express.static(path.join(__dirname, 'public')));

// API
app.use('/api', apiRouter);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Catch-all cho các route không tồn tại (bao gồm cả API và Static)
app.use(notFoundHandler);

// Middleware xử lý lỗi tập trung
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await syncModels();
    app.listen(PORT, () => {
      console.log(`Server đang chạy tại http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Không thể khởi động server:', err);
    process.exit(1);
  }
}

start();
module.exports = app;