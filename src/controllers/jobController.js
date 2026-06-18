const { Job, User } = require('../models');

// Lấy danh sách việc làm (cho cả Ứng viên và Nhà tuyển dụng)
const getJobList = async (req, res) => {
  try {
    const jobs = await Job.findAll({ order: [['createdAt', 'DESC']] });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: 'Không thể tải danh sách việc làm', error: err.message });
  }
};

// Lấy chi tiết một việc làm
const getJobById = async (req, res) => {
    try {
        const job = await Job.findByPk(req.params.id);
        if (!job) return res.status(404).json({ message: 'Không tìm thấy tin tuyển dụng' });
        res.json(job);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

// Nhà tuyển dụng tạo bài đăng mới
const createJob = async (req, res) => {
  try {
    const { position, description, contactEmail, salary, location, jobType } = req.body;
    
    // Lấy thông tin công ty từ User đang đăng nhập (đã qua middleware protect)
    const user = await User.findByPk(req.user.id);
    
    const newJob = await Job.create({
      companyName: user.companyName || 'Công ty chưa đặt tên',
      logoUrl: user.logoUrl,
      position,
      description,
      contactEmail: contactEmail || user.email,
      salary,
      location: location || user.location,
      jobType
    });

    res.status(201).json(newJob);
  } catch (err) {
    res.status(400).json({ message: 'Không thể tạo bài đăng', error: err.message });
  }
};

// Nhà tuyển dụng cập nhật bài đăng
const updateJob = async (req, res) => {
    try {
        const job = await Job.findByPk(req.params.id);
        if (!job) {
            return res.status(404).json({ message: 'Không tìm thấy tin tuyển dụng' });
        }

        // Chỉ cho phép người tạo ra job hoặc admin được sửa (sẽ thêm logic này sau)
        await job.update(req.body);

        res.json({ message: 'Cập nhật tin tuyển dụng thành công', data: job });
    } catch (err) {
        res.status(400).json({ message: 'Không thể cập nhật bài đăng', error: err.message });
    }
};

// Lấy thông tin công ty (Dùng cho Landing Page)
const getCompanyInfo = async (req, res) => {
  try {
    // Lấy thông tin từ bài đăng mới nhất hoặc một bản ghi cấu hình
    const job = await Job.findOne({ order: [['createdAt', 'DESC']] });
    if (!job) {
      return res.json({ name: "Hệ thống Tuyển dụng", description: "Đang cập nhật..." });
    }
    res.json({
      name: job.companyName,
      logoUrl: job.logoUrl,
      description: job.description,
      email: job.contactEmail
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Cập nhật thông tin công ty (Admin Dashboard)
const updateCompanyInfo = async (req, res) => {
  try {
    // Logic cập nhật thông tin công ty tùy thuộc vào cách bạn lưu trữ (ở đây giả định cập nhật job hiện tại)
    const { name, description } = req.body;
    await Job.update({ companyName: name, description }, { where: {} }); 
    res.json({ message: 'Cập nhật thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi cập nhật' });
  }
};

module.exports = { getJobList, getJobById, createJob, updateJob, getCompanyInfo, updateCompanyInfo };