const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Đăng ký tài khoản mới
 */
const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // 1. Kiểm tra thông tin đầu vào cơ bản
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ tên đăng nhập, email và mật khẩu' });
    }

    // 2. Kiểm tra xem username hoặc email đã tồn tại chưa
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại' });
    }

    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email đã tồn tại' });
    }

    // 3. Mã hóa mật khẩu
    const passwordHash = await bcrypt.hash(password, 10);

    // 4. Tạo người dùng mới
    const newUser = await User.create({
      username,
      email,
      passwordHash,
      role: role || 'candidate' // Mặc định là ứng viên nếu không chỉ định
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

    // 1. Tìm user
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
    }

    // 2. Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
    }

    // 3. Tạo JWT Token
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

// Lấy thông tin user hiện tại (kiểm tra token)
const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: ['username', 'role', 'email'] });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

module.exports = { register, login, getMe };