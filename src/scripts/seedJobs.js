require('dotenv').config();
const { Job, syncModels, sequelize } = require('../models');

async function run() {
  await syncModels();

  const mockJobs = [
    {
      companyName: 'TechVision Global',
      position: 'Senior NodeJS Developer',
      salary: '25M - 45M',
      location: 'Hồ Chí Minh',
      jobType: 'Full-time',
      description: 'Phát triển hệ thống Microservices, tối ưu hóa hiệu năng Database...',
      contactEmail: 'hr@techvision.example.com'
    },
    {
      companyName: 'Creative Design Studio',
      position: 'UI/UX Designer',
      salary: '15M - 25M',
      location: 'Hà Nội',
      jobType: 'Remote',
      description: 'Thiết kế giao diện người dùng cho ứng dụng Mobile và Web...',
      contactEmail: 'talent@creativestudio.example.com'
    },
    {
      companyName: 'NextGen Solutions',
      position: 'Frontend Engineer (React)',
      salary: '20M - 35M',
      location: 'Đà Nẵng',
      jobType: 'Hybrid',
      description: 'Xây dựng giao diện hiện đại với ReactJS và Tailwind CSS...',
      contactEmail: 'jobs@nextgen.example.com'
    },
    {
      companyName: 'Global Logistics',
      position: 'HR Manager',
      salary: '30M - 50M',
      location: 'Toàn quốc',
      jobType: 'Full-time',
      description: 'Xây dựng quy trình tuyển dụng và văn hóa doanh nghiệp...',
      contactEmail: 'hr-dept@logistics.example.com'
    }
  ];

  await Job.bulkCreate(mockJobs);
  console.log('--- Đã khởi tạo dữ liệu công việc mẫu thành công! ---');
  await sequelize.close();
  process.exit(0);
}

run().catch(console.error);