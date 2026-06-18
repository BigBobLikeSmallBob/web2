const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Job = sequelize.define('Job', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  companyName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  logoUrl: {
    type: DataTypes.TEXT,
  },
  position: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  salary: {
    type: DataTypes.STRING,
  },
  location: {
    type: DataTypes.STRING,
  },
  jobType: {
    type: DataTypes.STRING,
  },
  description: {
    type: DataTypes.TEXT,
  },
  contactEmail: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Job;