// Tự động chuyển đổi giữa localhost và server thật
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : (window.location.origin.includes('github.io')
      ? 'https://your-backend-app.onrender.com/api' // Thay link backend thật vào đây
      : `${window.location.origin}/api`); 

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_EXT = ['.pdf', '.doc', '.docx'];

async function loadCompanyInfo() {
  try {
    const res = await fetch(`${API_BASE}/company`);
    if (!res.ok) {
        document.getElementById('company-name').textContent = 'Tuyển dụng';
        document.querySelector('.loading').textContent = 'Không thể tải danh sách việc làm lúc này.';
        return;
    }
    const info = await res.json();

    document.getElementById('company-name').textContent = info.name || 'Công ty';
    document.title = `Ứng tuyển - ${info.name || 'Công ty'}`;

    if (info.tagline) {
      document.getElementById('hero-tagline').textContent = info.tagline;
    }
    document.getElementById('company-description').textContent =
      info.description || 'Chúng tôi luôn tìm kiếm những đồng nghiệp phù hợp để cùng phát triển.';

    document.getElementById('footer-address').textContent = info.address || '';
    document.getElementById('footer-email').textContent = info.email || '';
    document.getElementById('footer-phone').textContent = info.phone || '';

    // Gọi API lấy danh sách việc làm thực tế
    const jobsRes = await fetch(`${API_BASE}/jobs`);
    if (jobsRes.ok) {
        const jobs = await jobsRes.json();
        renderJobs(jobs);
    }

  } catch (err) {
    document.getElementById('company-name').textContent = 'Tuyển dụng';
    const loadingEl = document.querySelector('.loading');
    if (loadingEl) loadingEl.textContent = 'Kết nối server thất bại. Vui lòng thử lại sau.';
    console.error('Không thể tải thông tin công ty', err);
  }
}

function showBanner(message, type) {
  const banner = document.getElementById('form-banner');
  banner.textContent = message;
  banner.className = `banner show banner-${type}`;
}

function hideBanner() {
  const banner = document.getElementById('form-banner');
  banner.className = 'banner';
}

function setupFileDrop() {
  const input = document.getElementById('cv');
  const label = document.getElementById('file-drop-label');
  const text = document.getElementById('file-drop-text');

  input.addEventListener('change', () => {
    if (input.files && input.files[0]) {
      label.classList.add('has-file');
      text.textContent = input.files[0].name;
    } else {
      label.classList.remove('has-file');
      text.textContent = 'Chọn file PDF, DOC hoặc DOCX (tối đa 5MB)';
    }
  });
}

function renderJobs(jobs) {
    const container = document.getElementById('job-cards-container');
    
    if (!jobs || jobs.length === 0) {
        container.innerHTML = '<div class="loading">Hiện chưa có vị trí nào đang tuyển dụng.</div>';
        return;
    }

    container.innerHTML = jobs.map(job => `
        <div class="job-card" onclick="openApplication('${job.position}', '${job.salary || 'Thỏa thuận'}', '${job.location || 'Toàn quốc'}')">
            <h3>${job.position}</h3>
            <span class="salary">${job.salary || 'Thỏa thuận'}</span>
            <div class="tags">
                <span class="tag">${job.jobType || 'Full-time'}</span>
                <span class="tag">${job.location || 'Toàn quốc'}</span>
            </div>
            <p style="color:var(--muted); font-size:14px; margin-top:15px">Click để xem chi tiết và ứng tuyển</p>
        </div>
    `).join('');
}

window.openApplication = (title, salary, location) => {
    // Hiển thị chi tiết JD trước
    document.getElementById('job-list-section').style.display = 'none';
    document.getElementById('job-detail-section').style.display = 'block';
    document.getElementById('jd-title').textContent = title;
    document.getElementById('jd-salary').textContent = salary;
    document.getElementById('jd-location').textContent = `📍 ${location}`;
    
    // Gán sự kiện cho nút ứng tuyển trong JD
    document.getElementById('apply-now-btn').onclick = () => {
        document.getElementById('job-detail-section').style.display = 'none';
        document.getElementById('application-section').style.display = 'block';
        document.getElementById('position').value = title;
    };
    window.scrollTo(0, 0);
};

window.backToJobList = () => {
    document.getElementById('job-list-section').style.display = 'block';
    document.getElementById('job-detail-section').style.display = 'none';
    window.scrollTo(0, 0);
};

window.backToJD = () => {
    document.getElementById('application-section').style.display = 'none';
    document.getElementById('job-detail-section').style.display = 'block';
    window.scrollTo(0, 0);
};

function validateClientSide(form) {
  const file = form.cv.files[0];
  if (!file) return 'Vui lòng chọn file CV';

  const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
  if (!ALLOWED_EXT.includes(ext)) return 'File CV phải là PDF, DOC hoặc DOCX';
  if (file.size > MAX_FILE_SIZE) return 'File CV vượt quá 5MB';

  if (!form.fullName.value.trim()) return 'Vui lòng nhập họ tên';
  if (!form.email.value.trim()) return 'Vui lòng nhập email';
  if (!form.position.value.trim()) return 'Vui lòng nhập vị trí ứng tuyển';

  return null;
}

function setupForm() {
  const form = document.getElementById('application-form');
  const submitBtn = document.getElementById('submit-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideBanner();

    const errorMsg = validateClientSide(form);
    if (errorMsg) {
      showBanner(errorMsg, 'error');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Đang gửi...';

    try {
      const formData = new FormData(form);
      const res = await fetch(`${API_BASE}/applications`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        const message = data.errors ? data.errors.join(', ') : data.message;
        throw new Error(message || 'Gửi hồ sơ thất bại');
      }

      showBanner('Nộp CV thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất có thể.', 'success');
      form.reset();
      document.getElementById('file-drop-label').classList.remove('has-file');
      document.getElementById('file-drop-text').textContent =
        'Chọn file PDF, DOC hoặc DOCX (tối đa 5MB)';
    } catch (err) {
      showBanner(err.message, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Gửi hồ sơ';
    }
  });
}

loadCompanyInfo();
setupFileDrop();
setupForm();