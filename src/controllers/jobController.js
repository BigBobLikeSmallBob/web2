const { Job, User } = require('../models');

const getJobList = async (req, res) => {
  try {
    const jobs = await Job.findAll({ order: [['createdAt', 'DESC']] });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: 'Không thể tải danh sách việc làm', error: err.message });
  }
};

const getJobById = async (req, res) => {
    try {

        const job = await Job.findByPk(req.params.id);
        if (!job) return res.status(404).json({ message: 'Không tìm thấy tin tuyển dụng' });
        res.json(job);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

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

const updateJob = async (req, res) => {
    try {
        const job = await Job.findByPk(req.params.id);
        if (!job) {
            return res.status(404).json({ message: 'Không tìm thấy tin tuyển dụng' });
        }

        await job.update(req.body);

        res.json({ message: 'Cập nhật tin tuyển dụng thành công', data: job });
    } catch (err) {
        res.status(400).json({ message: 'Không thể cập nhật bài đăng', error: err.message });
    }
};

const getCompanyInfo = async (req, res) => {
  try {
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

const updateCompanyInfo = async (req, res) => {
  try {
    const { name, description } = req.body;
    await Job.update({ companyName: name, description }, { where: {} }); 
    res.json({ message: 'Cập nhật thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi cập nhật' });
  }
};

module.exports = { getJobList, getJobById, createJob, updateJob, getCompanyInfo, updateCompanyInfo };