Web server tiếp nhận CV ứng tuyển



Backend Node.js/Express + SQLite (Sequelize) cho landing page nộp CV và dashboard quản trị tuyển dụng. File CV được lưu trên Cloudinary để không mất dữ liệu khi server khởi động lại.



1\. Cài đặt local



bashnpm install

cp .env.example .env



Mở .env và điền các giá trị thật:





JWT_SECRET: một chuỗi bí mật ngẫu nhiên (ví dụ chạy openssl rand -hex 32).

CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET: lấy tại Cloudinary Dashboard sau khi tạo tài khoản miễn phí, ở mục "Account Details".

ADMIN_USERNAME, ADMIN_PASSWORD: tài khoản admin sẽ được tạo ở bước tiếp theo.





Tạo tài khoản admin đầu tiên:



bash npm run seed:admin



Chạy server ở chế độ phát triển (tự reload khi sửa code):



bashnpm run dev



Truy cập:





Landing page (ứng viên): http://localhost:5000

Dashboard quản trị: http://localhost:5000/dashboard.html





2\. Cấu trúc API



MethodEndpointQuyền truy cậpMô tảPOST/api/auth/loginPublicĐăng nhập, trả về JWTGET/api/auth/meCần tokenLấy thông tin user đang đăng nhậpGET/api/companyPublicLấy thông tin công tyPUT/api/companyAdminCập nhật thông tin công tyPOST/api/applicationsPublicNộp CV (multipart/form-data, field file là cv)GET/api/applicationsAdmin/StaffDanh sách ứng viên (hỗ trợ ?search=\&position=\&status=\&page=\&limit=)GET/api/applications/positionsAdmin/StaffDanh sách vị trí đã có để lọcGET/api/applications/:idAdmin/StaffChi tiết một hồ sơPATCH/api/applications/:id/statusAdmin/StaffĐổi trạng thái (pending/reviewing/accepted/rejected)DELETE/api/applications/:idAdminXóa hồ sơ (xóa cả file trên Cloudinary)



3\. Deploy lên Render (miễn phí)





Push code này lên một repository GitHub.

Vào render.com → New → Web Service → kết nối repository GitHub vừa tạo.

Cấu hình:



Build Command: npm install

Start Command: npm start







Vào tab Environment của service, khai báo các biến giống file .env (KHÔNG commit file .env thật lên GitHub — đã được loại trừ trong .gitignore).

Sau khi deploy lần đầu, mở Shell của Render (hoặc chạy tạm một Job) và chạy npm run seed:admin một lần để tạo tài khoản quản trị.

Mỗi lần push code mới lên nhánh chính, Render sẽ tự build và deploy lại.





Lưu ý về dữ liệu: ở gói miễn phí, ổ đĩa của Render là tạm thời (ephemeral) — file SQLite sẽ bị xóa mỗi khi service khởi động lại hoặc deploy lại. File CV vẫn an toàn trên Cloudinary, nhưng thông tin ứng viên/trạng thái trong DB sẽ mất. Đây hợp lý cho giai đoạn demo; khi vận hành thật, nên đổi sang Render Postgres (free tier) bằng cách thay dialect: 'sqlite' trong config/database.js thành postgres và dùng package pg.



4\. Bảo mật đã áp dụng





Helmet để thiết lập các HTTP header an toàn.

JWT cho xác thực, phân quyền Admin/Staff qua middleware.

Joi validate toàn bộ dữ liệu đầu vào.

Giới hạn loại file (PDF/DOC/DOCX) và dung lượng (5MB) khi upload CV.

Rate limit cho route nộp CV (tối đa 5 lần/15 phút/IP) để chống spam.
