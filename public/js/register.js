const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : `${window.location.origin}/api`;

document.addEventListener('DOMContentLoaded', () => {
  const regForm = document.getElementById('register-form');
  const regBanner = document.getElementById('register-banner');
  const regBtn = document.getElementById('register-btn');

  regForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Reset banner
    regBanner.textContent = '';
    regBanner.className = 'banner';

    const password = regForm.password.value;
    const confirmPassword = regForm.confirmPassword.value;

    if (password !== confirmPassword) {
      regBanner.textContent = 'Mật khẩu nhập lại không khớp!';
      regBanner.className = 'banner show banner-error';
      return;
    }

    regBtn.disabled = true;
    regBtn.textContent = 'Đang đăng ký...';

    try {
      const formData = new FormData(regForm);
      
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        body: formData // Sử dụng FormData để gửi file logo
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Đăng ký thất bại');

      alert('Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.');
      window.location.href = 'dashboard.html';
    } catch (err) {
      regBanner.textContent = err.message;
      regBanner.className = 'banner show banner-error';
    } finally {
      regBtn.disabled = false;
      regBtn.textContent = 'Hoàn tất đăng ký';
    }
  });
});