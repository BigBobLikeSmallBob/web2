require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const apiRouter = require('./routes/api');
const { notFoundHandler, errorHandler } = require('./middlewares/errorMiddleware');
const { syncModels } = require('./models');

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: false, // tranh chan inline script don gian cua public/js
  })
);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN === '*' ? true : process.env.CORS_ORIGIN,
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

app.use('/api', notFoundHandler);
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