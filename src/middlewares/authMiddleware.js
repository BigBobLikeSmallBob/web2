const jwt = require('jsonwebtoken');

/**
 * Middleware xác thực Token JWT
 * Đảm bảo người dùng đã đăng nhập trước khi truy cập vào các tài nguyên được bảo vệ
 */
const protect = (req, res, next) => {
  let token;

  // Kiểm tra token trong header Authorization (Bearer <token>)
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
    // Xác thực token bằng secret key đã cấu hình trong .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Đính kèm thông tin user (id, username, role) vào req để các controller phía sau sử dụng
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