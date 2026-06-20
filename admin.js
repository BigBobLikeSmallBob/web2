document.addEventListener('DOMContentLoaded', function () {
    const loginShell = document.getElementById('login-shell');
    const dashboardShell = document.getElementById('dashboard-shell');
    const loginForm = document.getElementById('login-form');
    const loginBanner = document.getElementById('login-banner');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const currentUsername = document.getElementById('current-username');
    const currentRole = document.getElementById('current-role');

    const PAGE_SIZE = 5;
    let appPage = 1;

    // ---------- AUTH ----------
    function renderAuthState() {
        const session = Store.getSession();
        if (session) {
            loginShell.hidden = true;
            dashboardShell.hidden = false;
            currentUsername.textContent = session.username;
            currentRole.textContent = session.role;
            initDashboard();
        } else {
            loginShell.hidden = false;
            dashboardShell.hidden = true;
        }
    }

    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        loginBanner.classList.remove('show');
        const formData = new FormData(loginForm);
        const username = formData.get('username').trim();
        const password = formData.get('password');

        loginBtn.disabled = true;
        loginBtn.textContent = 'Đang đăng nhập...';

        try {
            Store.login(username, password);
            renderAuthState();
        } catch (err) {
            loginBanner.textContent = err.message;
            loginBanner.className = 'banner show banner-error';
        } finally {
            loginBtn.disabled = false;
            loginBtn.textContent = 'Đăng nhập';
        }
    });

    logoutBtn.addEventListener('click', function () {
        Store.logout();
        renderAuthState();
    });

    // ---------- TABS ----------
    const navBtns = document.querySelectorAll('.nav-btn');
    const tabs = {
        applications: document.getElementById('tab-applications'),
        'post-job': document.getElementById('tab-post-job'),
        company: document.getElementById('tab-company'),
        diagnostics: document.getElementById('tab-diagnostics')
    };

    navBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            Object.keys(tabs).forEach(key => {
                if (!tabs[key]) return;
                tabs[key].hidden = key !== btn.dataset.tab;
            });
            if (btn.dataset.tab === 'applications') renderApplications();
            if (btn.dataset.tab === 'post-job') renderJobList();
            if (btn.dataset.tab === 'company') renderCompanyForm();
        });
    });

    function getCurrentRecruiterId() {
        const session = Store.getSession();
        return session ? session.recruiterId : null;
    }

    function initDashboard() {
        populatePositionFilter();
        renderApplications();
        renderJobList();
        renderCompanyForm();
    }

    // ---------- APPLICATIONS TAB ----------
    const searchInput = document.getElementById('search-input');
    const positionFilter = document.getElementById('position-filter');
    const statusFilter = document.getElementById('status-filter');
    const refreshBtn = document.getElementById('refresh-btn');
    const tbody = document.getElementById('applications-tbody');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');

    const STATUS_LABEL = {
        pending: 'Chờ duyệt',
        reviewing: 'Đang xem xét',
        accepted: 'Đã nhận',
        rejected: 'Từ chối'
    };

    function populatePositionFilter() {
        const recruiterId = getCurrentRecruiterId();
        const myJobs = Store.getJobs().filter(j => j.recruiterId === recruiterId);
        const positions = [...new Set(myJobs.map(j => j.position))];
        positionFilter.innerHTML = '<option value="">Tất cả vị trí</option>' +
            positions.map(p => `<option value="${escapeHtml(p)}">${escapeHtml(p)}</option>`).join('');
    }

    function getFilteredApplications() {
        const recruiterId = getCurrentRecruiterId();
        const myJobIds = new Set(Store.getJobs().filter(j => j.recruiterId === recruiterId).map(j => j.id));
        let list = Store.getApplications().filter(a => myJobIds.has(a.jobId));

        const q = searchInput.value.trim().toLowerCase();
        if (q) {
            list = list.filter(a =>
                a.fullName.toLowerCase().includes(q) || a.email.toLowerCase().includes(q)
            );
        }
        if (positionFilter.value) {
            list = list.filter(a => a.position === positionFilter.value);
        }
        if (statusFilter.value) {
            list = list.filter(a => a.status === statusFilter.value);
        }
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return list;
    }

    function renderApplications() {
        const list = getFilteredApplications();
        const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
        if (appPage > totalPages) appPage = totalPages;
        const start = (appPage - 1) * PAGE_SIZE;
        const pageItems = list.slice(start, start + PAGE_SIZE);

        if (pageItems.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state">Không có ứng viên nào phù hợp.</div></td></tr>`;
        } else {
            tbody.innerHTML = pageItems.map(app => `
                <tr>
                    <td>${escapeHtml(app.fullName)}</td>
                    <td>${escapeHtml(app.position)}</td>
                    <td>${escapeHtml(app.email)}</td>
                    <td>${formatDate(app.createdAt)}</td>
                    <td>
                        <select class="status-select" data-id="${app.id}">
                            ${Object.entries(STATUS_LABEL).map(([val, label]) =>
                                `<option value="${val}" ${app.status === val ? 'selected' : ''}>${label}</option>`
                            ).join('')}
                        </select>
                    </td>
                    <td>
                        <button class="btn-danger" data-action="delete-app" data-id="${app.id}">Xoá</button>
                    </td>
                </tr>
            `).join('');
        }

        pageInfo.textContent = `${appPage} / ${totalPages}`;
        prevPageBtn.disabled = appPage <= 1;
        nextPageBtn.disabled = appPage >= totalPages;
    }

    tbody.addEventListener('change', function (e) {
        if (e.target.classList.contains('status-select')) {
            Store.updateApplicationStatus(e.target.dataset.id, e.target.value);
            renderApplications();
        }
    });

    tbody.addEventListener('click', function (e) {
        const btn = e.target.closest('[data-action="delete-app"]');
        if (!btn) return;
        if (confirm('Xoá hồ sơ ứng viên này khỏi danh sách?')) {
            Store.deleteApplication(btn.dataset.id);
            renderApplications();
        }
    });

    searchInput.addEventListener('input', () => { appPage = 1; renderApplications(); });
    positionFilter.addEventListener('change', () => { appPage = 1; renderApplications(); });
    statusFilter.addEventListener('change', () => { appPage = 1; renderApplications(); });
    refreshBtn.addEventListener('click', () => { appPage = 1; populatePositionFilter(); renderApplications(); });
    prevPageBtn.addEventListener('click', () => { if (appPage > 1) { appPage--; renderApplications(); } });
    nextPageBtn.addEventListener('click', () => { appPage++; renderApplications(); });

    // ---------- POST-JOB TAB ----------
    const jobListContainer = document.getElementById('job-list-container');
    const postJobForm = document.getElementById('post-job-form');
    const jobFormTitle = document.getElementById('job-form-title');
    const jobFormBanner = document.getElementById('job-form-banner');
    const jobEditIdInput = document.getElementById('job-edit-id');
    const postJobBtn = document.getElementById('post-job-btn');
    const cancelEditBtn = document.getElementById('job-cancel-edit-btn');

    function renderJobList() {
        const recruiterId = getCurrentRecruiterId();
        const myJobs = Store.getJobs()
            .filter(j => j.recruiterId === recruiterId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        if (myJobs.length === 0) {
            jobListContainer.innerHTML = '<div class="empty-state">Bạn chưa đăng tin tuyển dụng nào. Hãy tạo tin mới ở form dưới đây.</div>';
            return;
        }

        jobListContainer.innerHTML = myJobs.map(job => {
            const appCount = Store.getApplications().filter(a => a.jobId === job.id).length;
            const isOpen = job.status === 'open';
            return `
                <div class="job-list-item ${isOpen ? '' : 'closed'}">
                    <div class="job-list-info">
                        <h4>${escapeHtml(job.position)}</h4>
                        <div class="job-meta">
                            <span class="job-status-badge ${isOpen ? 'open' : 'closed'}">${isOpen ? 'Đang tuyển' : 'Đã gỡ'}</span>
                            <span>${escapeHtml(job.jobType || '')}</span>
                            <span>${escapeHtml(job.salary || 'Thỏa thuận')}</span>
                            <span>${appCount} ứng viên</span>
                            <span>Đăng ${formatDate(job.createdAt)}</span>
                        </div>
                    </div>
                    <div class="job-list-actions">
                        <button class="btn-ghost" data-action="edit-job" data-id="${job.id}">Sửa</button>
                        <button class="btn-ghost" data-action="toggle-job" data-id="${job.id}">${isOpen ? 'Gỡ tin' : 'Mở lại'}</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    jobListContainer.addEventListener('click', function (e) {
        const editBtn = e.target.closest('[data-action="edit-job"]');
        const toggleBtn = e.target.closest('[data-action="toggle-job"]');

        if (editBtn) {
            const job = Store.getJobById(editBtn.dataset.id);
            if (!job) return;
            jobEditIdInput.value = job.id;
            postJobForm.elements['position'].value = job.position;
            postJobForm.elements['jobType'].value = job.jobType;
            postJobForm.elements['salary'].value = job.salary;
            postJobForm.elements['description'].value = job.description;
            jobFormTitle.textContent = 'Chỉnh sửa tin tuyển dụng';
            postJobBtn.textContent = 'Lưu thay đổi';
            cancelEditBtn.hidden = false;
            postJobForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        if (toggleBtn) {
            Store.toggleJobStatus(toggleBtn.dataset.id);
            renderJobList();
            populatePositionFilter();
        }
    });

    function resetJobForm() {
        postJobForm.reset();
        jobEditIdInput.value = '';
        jobFormTitle.textContent = 'Đăng tin tuyển dụng mới';
        postJobBtn.textContent = 'Công khai bài đăng';
        cancelEditBtn.hidden = true;
    }

    cancelEditBtn.addEventListener('click', resetJobForm);

    postJobForm.addEventListener('submit', function (e) {
        e.preventDefault();
        jobFormBanner.classList.remove('show');

        const formData = new FormData(postJobForm);
        const payload = {
            position: formData.get('position').trim(),
            jobType: formData.get('jobType'),
            salary: formData.get('salary').trim(),
            description: formData.get('description').trim()
        };

        const editId = jobEditIdInput.value;
        try {
            if (editId) {
                Store.updateJob(editId, payload);
                jobFormBanner.textContent = 'Đã lưu thay đổi tin tuyển dụng.';
            } else {
                Store.createJob(Object.assign({ recruiterId: getCurrentRecruiterId() }, payload));
                jobFormBanner.textContent = 'Đã đăng tin tuyển dụng mới thành công.';
            }
            jobFormBanner.className = 'banner show banner-success';
            resetJobForm();
            renderJobList();
            populatePositionFilter();
        } catch (err) {
            jobFormBanner.textContent = err.message || 'Có lỗi xảy ra.';
            jobFormBanner.className = 'banner show banner-error';
        }
    });

    // ---------- COMPANY TAB ----------
    const companyForm = document.getElementById('company-form');
    const companyBanner = document.getElementById('company-banner');
    const companyLogoPreview = document.getElementById('company-logo-preview');

    function renderCompanyForm() {
        const company = Store.getCompany();
        if (!company) return;
        companyForm.elements['companyName'].value = company.companyName || '';
        companyForm.elements['phoneNumber'].value = company.phoneNumber || '';
        companyForm.elements['location'].value = company.location || '';
        companyForm.elements['email'].value = company.email || '';
        companyLogoPreview.src = company.logo || '';
        companyLogoPreview.style.display = company.logo ? 'block' : 'none';
    }

    function fileToDataURL(file) {
        return new Promise((resolve, reject) => {
            if (!file) { resolve(''); return; }
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    companyForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        companyBanner.classList.remove('show');
        const formData = new FormData(companyForm);
        const logoFile = formData.get('logo');
        const existing = Store.getCompany() || {};

        try {
            const logoDataUrl = logoFile && logoFile.size ? await fileToDataURL(logoFile) : existing.logo;
            Store.setCompany(Object.assign({}, existing, {
                companyName: formData.get('companyName').trim(),
                phoneNumber: formData.get('phoneNumber').trim(),
                location: formData.get('location').trim(),
                email: formData.get('email').trim(),
                logo: logoDataUrl
            }));
            companyBanner.textContent = 'Đã lưu thông tin công ty.';
            companyBanner.className = 'banner show banner-success';
            renderCompanyForm();
        } catch (err) {
            companyBanner.textContent = 'Có lỗi xảy ra khi lưu thông tin.';
            companyBanner.className = 'banner show banner-error';
        }
    });

    // ---------- DIAGNOSTICS TAB (mô phỏng, không gọi lệnh hệ thống) ----------
    const pingForm = document.getElementById('ping-form');
    const pingResult = document.getElementById('ping-result');

    if (pingForm) {
        pingForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const target = new FormData(pingForm).get('ip').trim();
            pingResult.textContent = `Đang kiểm tra kết nối tới ${target} ...`;
            setTimeout(() => {
                const lines = [];
                for (let i = 1; i <= 4; i++) {
                    const ms = (Math.random() * 40 + 10).toFixed(1);
                    lines.push(`Phản hồi từ ${target}: thời gian=${ms}ms`);
                }
                pingResult.textContent = lines.join('\n') +
                    `\n\n[Mô phỏng] Đây là dữ liệu minh hoạ phía giao diện, không phải kết quả ping thật.`;
            }, 600);
        });
    }

    // ---------- UTIL ----------
    function escapeHtml(str) {
        if (str == null) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function formatDate(iso) {
        try {
            const d = new Date(iso);
            return d.toLocaleDateString('vi-VN');
        } catch (e) {
            return '';
        }
    }

    renderAuthState();
});