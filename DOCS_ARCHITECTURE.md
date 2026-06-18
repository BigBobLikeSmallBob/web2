# Tài liệu Đặc tả Kiến trúc Chức năng: Hệ thống Tuyển dụng Tinh gọn

## 1. Sơ đồ Cấu trúc Cây Tổng thể (Overall Tree Architecture)

```text
Hệ thống Tuyển dụng & Tìm việc làm tinh gọn
├── Cổng khởi đầu (Chung)
│   ├── Landing Page (Giới thiệu & Danh sách việc làm)
│   └── Login Form (Phân quyền: Candidate / Recruiter)
├── Phân nhánh 1: Vai trò Ứng viên (Candidate)
│   ├── Dashboard việc làm (UI: Card tin tuyển dụng)
│   ├── Trang chi tiết JD (Mô tả, Quyền lợi, Yêu cầu)
│   ├── Khung nộp hồ sơ (Form điền thông tin cá nhân)
│   └── Module đính kèm CV (Hỗ trợ PDF/Word)
└── Phân nhánh 2: Vai trò Nhà tuyển dụng (Recruiter)
    ├── Form đăng tin trực quan (Logo, JD, Contact Email)
    └── Dashboard Tiến trình (Giao diện Kanban)
        ├── Cột: Đang duyệt (Pending)
        ├── Cột: Hẹn phỏng vấn (Reviewing)
        └── Cột: Đã tuyển thành công (Accepted/Hired)
```

---

## 2. Chi tiết Thành phần & Luồng Dữ liệu (Component Breakdown)

### A. Module Cổng chung (General Access)
- **UI/UX Components:** Giao diện tối giản, tập trung vào khung tìm kiếm và nút Đăng nhập nổi bật.
- **Behavioral Flow:** Người dùng truy cập -> Xem danh sách việc làm -> Chọn đăng nhập nếu cần quyền quản trị.
- **Backend Action:** Sử dụng JWT để xác thực và phân quyền (Middleware `authMiddleware`).

### B. Phân hệ Ứng viên (Candidate Branch)
- **UI/UX Components:**
    - **Job Cards:** Hiển thị vị trí, tên công ty và tag trạng thái.
    - **Application Form:** Các trường input `fullName`, `email`, `phone`, `position`.
    - **File Dropzone:** Khu vực kéo thả file CV trực quan.
- **Behavioral Flow:**
    1. Xem JD -> Click "Ứng tuyển".
    2. Điền Form -> Tải CV lên hệ thống.
    3. Nhận thông báo "Gửi thành công" trên giao diện.
- **Backend Integration:**
    - **API Upload:** Tiếp nhận `multipart/form-data` qua Multer.
    - **Secure Storage:** Lưu trữ file CV lên Cloudinary (đã cấu hình trong code).
    - **Mail Service (SMTP):** Kích hoạt gửi email xác nhận tự động tới ứng viên sau khi DB lưu hồ sơ thành công.

### C. Phân hệ Nhà tuyển dụng (Recruiter Branch)
- **UI/UX Components:**
    - **Post Form:** Form cấu hình thông tin công ty và mô tả công việc (JD).
    - **Kanban Dashboard:** Bảng điều khiển với các thẻ hồ sơ có thể chuyển đổi trạng thái.
- **Behavioral Flow:**
    1. Đăng nhập -> Vào Dashboard quản trị.
    2. Theo dõi danh sách hồ sơ mới đổ về.
    3. Cập nhật trạng thái (Ví dụ: Từ "Pending" sang "Reviewing").
- **Backend Integration:**
    - **Real-time Status:** Khi HR thay đổi trạng thái trong `admin.js`, API `PATCH /applications/:id/status` sẽ cập nhật DB.
    - **Real-time Notify:** (Yêu cầu bổ sung) Cập nhật trạng thái ngay lập tức trên giao diện mà không cần reload trang (Sử dụng pooling hoặc WebSockets).

---

## 3. Gợi ý Thực thể Cơ sở dữ liệu (Database Schema)

Dựa trên yêu cầu blueprint, cấu trúc DB (SQLite/Postgres) được thiết lập như sau:

### Table: `Users` (Quản lý tài khoản)
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Khóa chính |
| `username` | String | Tên đăng nhập |
| `passwordHash`| String | Mật khẩu mã hóa Bcrypt |
| `role` | Enum | 'admin' hoặc 'staff' |

### Table: `Company` (Thông tin nhà tuyển dụng)
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | Int | Khóa chính |
| `name` | String | Tên công ty |
| `logoUrl` | String | Link ảnh logo |
| `description` | Text | Mô tả công ty/JD |
| `contactEmail`| String | Email nhận thông báo |

### Table: `Applications` (Hồ sơ ứng viên)
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Khóa chính |
| `fullName` | String | Tên ứng viên |
| `email` | String | Email liên hệ |
| `cvUrl` | String | Đường dẫn file tĩnh (Cloudinary) |
| `status` | Enum | 'pending', 'reviewing', 'accepted', 'rejected' |
| `createdAt` | DateTime | Ngày nộp hồ sơ |

---

## 4. Ràng buộc Kỹ thuật (Constraints)
- **Bảo mật:** Toàn bộ CV phải được quét định dạng `.pdf`, `.doc`, `.docx`.
- **Hiệu năng:** API nộp hồ sơ phải có giới hạn (Rate Limit) để tránh spam SMTP.
- **Trải nghiệm:** Phải có thông báo (Banner/Toast) phản hồi ngay khi nộp hoặc cập nhật thành công.