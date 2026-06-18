const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('admin', 'staff', 'recruiter', 'candidate'),
    defaultValue: 'candidate',
  },
  companyName: {
    type: DataTypes.STRING, // Chỉ dùng cho role 'recruiter'
  },
  logoUrl: {
    type: DataTypes.STRING, // URL từ Cloudinary, chỉ dùng cho role 'recruiter'
  },
  phoneNumber: {
    type: DataTypes.STRING, // Chỉ dùng cho role 'recruiter'
  },
  location: {
    type: DataTypes.STRING, // Chỉ dùng cho role 'recruiter'
  },
});

module.exports = User;