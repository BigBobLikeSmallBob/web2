const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true cho port 465, false cho các port khác
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Kiểm tra kết nối SMTP khi khởi tạo
transporter.verify((error, success) => {
  if (error) {
    console.error('Lỗi cấu hình Mailer:', error);
  } else {
    console.log('Hệ thống gửi Mail đã sẵn sàng.');
  }
});

const sendMail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error('Gửi mail thất bại:', err);
  }
};

module.exports = { sendMail };