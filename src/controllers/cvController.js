const { Application } = require('../models');
const { sendMail } = require('../config/mailer');
const path = require('path');

// Ứng viên nộp CV
const submitApplication = async (req, res) => {
  try {
    const { fullName, email, phone, position } = req.body;
    
    // req.file được cung cấp bởi Multer middleware trong routes
    // Chuyển CV sang chuỗi Base64
    let cvUrl = null;
    if (req.file) {
      cvUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    } else {
      return res.status(400).json({ message: 'Vui lòng đính kèm file CV (PDF/Word)' });
    }

    // 1. Lưu hồ sơ vào DB
    const app = await Application.create({
      fullName,
      email,
      phone,
      position,
      cvUrl, // Chuỗi Base64 lưu trong MongoDB
      status: 'pending'
    });

    // 2. Kích hoạt gửi Gmail phản hồi (Async)
    const mailContent = `
      <h3>Xác nhận hồ sơ ứng tuyển</h3>
      <p>Chào <b>${fullName}</b>,</p>
      <p>Chúng tôi đã nhận được hồ sơ của bạn cho vị trí <b>${position}</b>.</p>
      <p>Bộ phận HR sẽ xem xét và phản hồi bạn trong thời gian sớm nhất.</p>
      <br/>
      <p>Trân trọng,</p>
      <p>Đội ngũ Tuyển dụng</p>
    `;
    
    sendMail(email, 'Hồ sơ của bạn đã được tiếp nhận', mailContent);

    res.status(201).json({ message: 'Nộp hồ sơ thành công!', data: app });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi xử lý hồ sơ', error: err.message });
  }
};

// Nhà tuyển dụng lấy danh sách (cho Kanban Board)
const getApplications = async (req, res) => {
  try {
    const apps = await Application.findAll({ order: [['createdAt', 'DESC']] });
    res.json({ applications: apps });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi tải hồ sơ' });
  }
};

// Cập nhật trạng thái (Real-time update logic)
const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const app = await Application.findByPk(id);
    if (!app) return res.status(404).json({ message: 'Không tìm thấy hồ sơ' });

    app.status = status;
    await app.save();

    // Ở đây bạn có thể thêm logic gửi mail thông báo cho ứng viên khi trạng thái đổi thành "Hẹn phỏng vấn"

    res.json({ message: 'Cập nhật trạng thái thành công', data: app });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi cập nhật' });
  }
};

module.exports = { 
  submitApplication, 
  getApplications, 
  updateStatus 
};