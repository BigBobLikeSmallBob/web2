const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, sequelize } = require('../models');

const register = async (req, res) => {
  try {
    const { email, password, confirmPassword, companyName, phoneNumber, location, role } = req.body;

    if (!email || !password || !companyName || !phoneNumber || !location) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ các trường bắt buộc (*)' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Mật khẩu phải có tối thiểu 8 ký tự' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email đã tồn tại' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const logoUrl = req.file?.path;
    const newUser = await User.create({
      username: email, 
      email,
      passwordHash,
      role: role || 'recruiter',
      companyName,
      phoneNumber,
      location,
      logoUrl
    });

    res.status(201).json({
      message: 'Đăng ký tài khoản thành công',
      user: { id: newUser.id, username: newUser.username, email: newUser.email, role: newUser.role }
    });
  } catch (err) {
    console.error('Lỗi đăng ký:', err);
    res.status(500).json({ message: 'Lỗi server khi đăng ký', error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne({ where: { username: username } });
    
    if (!user || !user.passwordHash) {
        return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
        return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        username: user.username,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server khi đăng nhập', error: err.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { 
      attributes: { exclude: ['passwordHash'] } 
    });
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

const updateMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    }

    const { companyName, phoneNumber, location, email } = req.body;
    const logoUrl = req.file?.path; // Lấy URL logo mới nếu có

    await user.update({ companyName, phoneNumber, location, email, ...(logoUrl && { logoUrl }) });

    res.json({ message: 'Cập nhật thông tin thành công.' });
  } catch (err) {
    console.error('Lỗi cập nhật thông tin:', err);
    res.status(500).json({ message: 'Lỗi server khi cập nhật', error: err.message });
  }
};

module.exports = { register, login, getMe, updateMe };