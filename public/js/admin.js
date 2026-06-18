// Tự động chuyển đổi giữa localhost và server thật
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : `${window.location.origin}/api`; 
 
const state = {
  token: localStorage.getItem('token') || null,
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  page: 1,
  totalPages: 1,
  filters: { search: '', position: '', status: '' },
};
 
const STATUS_LABEL = {
  pending: 'Chờ duyệt',
  reviewing: 'Đang xem xét',
  accepted: 'Đã nhận',
  rejected: 'Từ chối',
};
 
function authHeaders() {
  return state.token ? { Authorization: `Bearer ${state.token}` } : {};
}
 
async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...(options.headers || {}), ...authHeaders() },
  }).catch(err => {
    console.error("Lỗi kết nối API:", err);
    throw new Error("Không thể kết nối tới máy chủ. Hãy đảm bảo Backend đang chạy.");
  });
 
  if (res.status === 401) {
    logout();
    throw new Error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
  }
 
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'Đã xảy ra lỗi');
  }
  return data;
}
 
/* ===== Auth ===== */
 
function showLogin() {
  document.getElementById('login-shell').hidden = false;
  document.getElementById('dashboard-shell').hidden = true;
}
 
function showDashboard() {
  document.getElementById('login-shell').hidden = true;
  document.getElementById('dashboard-shell').hidden = false;
  document.getElementById('current-username').textContent = state.user?.username || '-';
  document.getElementById('current-role').textContent =
    state.user?.role === 'admin' ? 'Quản trị viên' : 'Nhân viên';
 
  loadPositions();
  loadApplications();
}
 
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  state.token = null;
  state.user = null;
  showLogin();
}
 
function setupLogin() {
  const form = document.getElementById('login-form');
  const banner = document.getElementById('login-banner');
  const btn = document.getElementById('login-btn');
 
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    banner.className = 'banner';
    btn.disabled = true;
    btn.textContent = 'Đang đăng nhập...';
 
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username.value.trim(),
          password: form.password.value,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Đăng nhập thất bại');
 
      state.token = data.token;
      state.user = data.user;
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
 
      showDashboard();
    } catch (err) {
      banner.textContent = err.message;
      banner.className = 'banner show banner-error';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Đăng nhập';
    }
  });
 
  document.getElementById('logout-btn').addEventListener('click', logout);
}
 
/* ===== Tabs ===== */
 
function setupTabs() {
  const buttons = document.querySelectorAll('.nav-btn');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
 
      // Ẩn tất cả các tab trước
      document.querySelectorAll('.admin-main > div').forEach(tab => tab.hidden = true);
      // Hiển thị tab được chọn
      const activeTab = document.getElementById(`tab-${btn.dataset.tab}`);
      if (activeTab) activeTab.hidden = false;

      if (btn.dataset.tab === 'company') loadCompanyInfo();
    });
  });
}
 
/* ===== Applications ===== */
 
function escapeHtml(str = '') {
  return str.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}
 
function formatDate(iso) {
  return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
 
function renderApplications(list) {
  const tbody = document.getElementById('applications-tbody');
 
  if (!list.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Chưa có hồ sơ nào phù hợp</td></tr>';
    return;
  }
 
  tbody.innerHTML = list.map((app) => `
    <tr data-id="${app.id}">
      <td>${escapeHtml(app.fullName)}</td>
      <td>${escapeHtml(app.position)}</td>
      <td>${escapeHtml(app.email)}<br><span style="color:var(--muted);font-size:13px">${escapeHtml(app.phone || '')}</span></td>
      <td>${formatDate(app.createdAt)}</td>
      <td>
        <select class="status-select" data-id="${app.id}">
          ${Object.entries(STATUS_LABEL).map(([val, label]) =>
            `<option value="${val}" ${val === app.status ? 'selected' : ''}>${label}</option>`
          ).join('')}
        </select>
      </td>
      <td class="row-actions">
        <a href="${app.cvUrl}" target="_blank" rel="noopener" class="btn-ghost">Xem CV</a>
        <button class="btn-danger" data-action="delete" data-id="${app.id}">Xóa</button>
      </td>
    </tr>
  `).join('');
 
  tbody.querySelectorAll('.status-select').forEach((select) => {
    select.addEventListener('change', () => updateStatus(select.dataset.id, select.value));
  });
 
  tbody.querySelectorAll('[data-action="delete"]').forEach((btn) => {
    btn.addEventListener('click', () => deleteApplication(btn.dataset.id));
  });
}
 
async function loadApplications() {
  const tbody = document.getElementById('applications-tbody');
  tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Đang tải...</td></tr>';
 
  const params = new URLSearchParams({
    page: state.page,
    limit: 10,
    ...(state.filters.search ? { search: state.filters.search } : {}),
    ...(state.filters.position ? { position: state.filters.position } : {}),
    ...(state.filters.status ? { status: state.filters.status } : {}),
  });
 
  try {
    const data = await apiFetch(`/applications?${params.toString()}`);
    state.totalPages = data.totalPages || 1;
    renderApplications(data.applications || []);
    document.getElementById('page-info').textContent = `${data.page} / ${state.totalPages || 1}`;
  } catch (err) {
    console.error(err);
  }
}
 
async function loadPositions() {
  try {
    const positions = await apiFetch('/applications/positions');
    const select = document.getElementById('position-filter');
    const current = select.value;
    select.innerHTML = '<option value="">Tất cả vị trí</option>' +
      positions.map((p) => `<option value="${escapeHtml(p)}">${escapeHtml(p)}</option>`).join('');
    select.value = current;
  } catch (err) {
    console.error(err);
  }
}
 
async function updateStatus(id, status) {
  try {
    await apiFetch(`/applications/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
  } catch (err) {
    alert(err.message);
    loadApplications();
  }
}
 
async function deleteApplication(id) {
  if (!confirm('Xóa hồ sơ này? Hành động không thể hoàn tác.')) return;
  try {
    await apiFetch(`/applications/${id}`, { method: 'DELETE' });
    loadApplications();
  } catch (err) {
    alert(err.message);
  }
}
 
function setupApplicationsTab() {
  let searchTimer;
  document.getElementById('search-input').addEventListener('input', (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.filters.search = e.target.value.trim();
      state.page = 1;
      loadApplications();
    }, 350);
  });
 
  document.getElementById('position-filter').addEventListener('change', (e) => {
    state.filters.position = e.target.value;
    state.page = 1;
    loadApplications();
  });
 
  document.getElementById('status-filter').addEventListener('change', (e) => {
    state.filters.status = e.target.value;
    state.page = 1;
    loadApplications();
  });
 
  document.getElementById('refresh-btn').addEventListener('click', () => {
    loadPositions();
    loadApplications();
  });
 
  document.getElementById('prev-page').addEventListener('click', () => {
    if (state.page > 1) { state.page -= 1; loadApplications(); }
  });
  document.getElementById('next-page').addEventListener('click', () => {
    if (state.page < state.totalPages) { state.page += 1; loadApplications(); }
  });
}
 
/* ===== Post/Edit Job ===== */

function setupJobPostTab() {
    const form = document.getElementById('post-job-form');
    const actionSelect = document.getElementById('job-action-select');
    const jobSelectContainer = document.getElementById('job-select-container');
    const jobSelect = document.getElementById('job-select');
    const formTitle = document.getElementById('job-form-title');
    const submitBtn = document.getElementById('post-job-btn');
    const banner = document.getElementById('job-form-banner');

    // Tải danh sách các job đã đăng
    async function loadPostedJobs() {
        try {
            const jobs = await apiFetch('/jobs');
            jobSelect.innerHTML = jobs.map(job => 
                `<option value="${job.id}">${job.position}</option>`
            ).join('');
            // Tự động điền form với job đầu tiên
            if (jobs.length > 0) {
                jobSelect.dispatchEvent(new Event('change'));
            }
        } catch (err) {
            console.error("Lỗi tải danh sách job:", err);
        }
    }

    // Chuyển đổi giao diện giữa Đăng mới và Chỉnh sửa
    actionSelect.addEventListener('change', (e) => {
        const isEditing = e.target.value === 'edit';
        jobSelectContainer.hidden = !isEditing;
        formTitle.textContent = isEditing ? 'Chỉnh sửa tin tuyển dụng' : 'Đăng tin tuyển dụng mới';
        submitBtn.textContent = isEditing ? 'Lưu thay đổi' : 'Công khai bài đăng';
        form.reset();
        if (isEditing) {
            loadPostedJobs();
        }
    });

    // Khi chọn một job khác để sửa
    jobSelect.addEventListener('change', async (e) => {
        try {
            const job = await apiFetch(`/jobs/${e.target.value}`);
            form.position.value = job.position || '';
            form.jobType.value = job.jobType || 'Full-time';
            form.salary.value = job.salary || '';
            form.description.value = job.description || '';
        } catch (err) {
            console.error("Lỗi tải chi tiết job:", err);
        }
    });

    // Xử lý submit form
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        submitBtn.disabled = true;
        banner.className = 'banner';

        const isEditing = actionSelect.value === 'edit';
        const url = isEditing ? `/jobs/${jobSelect.value}` : '/jobs';
        const method = isEditing ? 'PUT' : 'POST';

        try {
            const formData = new FormData(form);
            const body = Object.fromEntries(formData.entries());
            
            await apiFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            
            banner.textContent = isEditing ? 'Cập nhật tin thành công!' : 'Đăng tin mới thành công!';
            banner.className = 'banner show banner-success';
        } catch (err) {
            banner.textContent = err.message;
            banner.className = 'banner show banner-error';
        } finally {
            submitBtn.disabled = false;
        }
    });
}

/* ===== Company info ===== */
 
async function loadCompanyInfo() {
  try {
    // Lấy thông tin của chính user đang đăng nhập
    const info = await apiFetch('/auth/me');
    const form = document.getElementById('company-form');
    const logoPreview = document.getElementById('company-logo-preview');

    form.companyName.value = info.companyName || '';
    form.phoneNumber.value = info.phoneNumber || '';
    form.location.value = info.location || '';
    form.email.value = info.email || '';

    if (info.logoUrl) {
        logoPreview.src = info.logoUrl;
        logoPreview.hidden = false;
    } else {
        logoPreview.hidden = true;
    }

  } catch (err) {
    console.error(err);
    document.getElementById('company-banner').textContent = 'Không thể tải thông tin công ty.';
    document.getElementById('company-banner').className = 'banner show banner-error';
  }
}
 
function setupCompanyTab() {
  const form = document.getElementById('company-form');
  const banner = document.getElementById('company-banner');
  const saveBtn = document.getElementById('company-save-btn');
 
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    banner.className = 'banner';
    saveBtn.disabled = true;
    try {
      const formData = new FormData(form);
      await apiFetch('/auth/me', { method: 'PUT', body: formData });
      banner.textContent = 'Đã lưu thông tin công ty';
      banner.className = 'banner show banner-success';
    } catch (err) {
      banner.textContent = err.message;
      banner.className = 'banner show banner-error';
    }
  });

  saveBtn.disabled = false;
}
 
/* ===== Init ===== */
 
setupLogin();
setupTabs();
setupApplicationsTab();
setupJobPostTab();
setupCompanyTab();
 
if (state.token && state.user) {
  showDashboard();
} else {
  showLogin();
}