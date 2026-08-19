/**
 * Freedom Foundry API client — replaces the base44 SDK
 * Provides entity-style CRUD methods that match the original base44 call patterns.
 */

const TOKEN_KEY = 'ff_auth_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

function getHeaders() {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function apiFetch(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: { ...getHeaders(), ...(options.headers || {}) },
  });
  if (!res.ok) {
    let err;
    try { err = await res.json(); } catch { err = { error: res.statusText }; }
    const e = new Error(err.error || 'API error');
    e.status = res.status;
    e.data = err;
    throw e;
  }
  if (res.status === 204) return null;
  return res.json();
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const auth = {
  async me() {
    return apiFetch('/auth/me');
  },
  async login(email, password) {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(data.token);
    return data.user;
  },
  async register(email, password, firstName, lastName) {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, first_name: firstName, last_name: lastName }),
    });
    setToken(data.token);
    return data.user;
  },
  async logout() {
    try { await apiFetch('/auth/logout', { method: 'POST' }); } catch {}
    setToken(null);
    window.location.href = '/login';
  },
  redirectToLogin(returnTo) {
    const url = returnTo ? `/login?returnTo=${encodeURIComponent(returnTo)}` : '/login';
    window.location.href = url;
  },
  async updateMe(data) {
    return apiFetch('/auth/me', { method: 'PATCH', body: JSON.stringify(data) });
  },
  isAuthenticated() {
    return !!getToken();
  },
  // Compatibility aliases for the original auth surface
  async loginViaEmailPassword(email, password) {
    return auth.login(email, password);
  },
  loginWithProvider() {
    alert('Google sign-in is not available yet. Please use email and password.');
  },
  setToken(token) {
    setToken(token);
  },
  async verifyOtp() {
    // Email verification is not required in this deployment; registration signs the user in directly.
    const user = await auth.me();
    return { access_token: getToken(), user };
  },
  async resendOtp() {
    return { success: true };
  },
  async resetPasswordRequest(email) {
    return apiFetch('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
  },
  async resetPassword({ resetToken, newPassword }) {
    return apiFetch('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token: resetToken, new_password: newPassword }) });
  },
};

// ─── Functions (replaces base44.functions.invoke) ────────────────────────────
export const functions = {
  async getSharedProfile(token) {
    return apiFetch(`/shared-profile/${encodeURIComponent(token)}`);
  },
};

// ─── Generic entity factory ───────────────────────────────────────────────────
function entity(basePath) {
  return {
    async list() {
      return apiFetch(basePath);
    },
    async get(id) {
      return apiFetch(`${basePath}/${id}`);
    },
    async filter(filterObj = {}, _sort, _limit) {
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(filterObj)) {
        if (v !== undefined && v !== null) params.set(k, String(v));
      }
      const qs = params.toString();
      return apiFetch(qs ? `${basePath}?${qs}` : basePath);
    },
    async create(data) {
      return apiFetch(basePath, { method: 'POST', body: JSON.stringify(data) });
    },
    async bulkCreate(items) {
      return Promise.all(items.map(item => this.create(item)));
    },
    async update(id, data) {
      return apiFetch(`${basePath}/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
    },
    async delete(id) {
      return apiFetch(`${basePath}/${id}`, { method: 'DELETE' });
    },
  };
}

// ─── Entities ─────────────────────────────────────────────────────────────────
export const entities = {
  User: entity('/users'),
  UserProfile: entity('/user-profiles'),
  PersonalBrandProfile: entity('/personal-brand-profiles'),
  CorporateBrandProfile: entity('/corporate-brand-profiles'),
  BrandGuidelines: entity('/brand-guidelines'),
  BrandAsset: entity('/brand-assets'),
  MediaKit: entity('/media-kits'),
  BigPicture: entity('/big-pictures'),
  IgniteOS: entity('/ignite-os'),
  VaultItem: entity('/vault-items'),
  CourseModule: entity('/course-modules'),
  CourseLesson: entity('/course-lessons'),
  LessonProgress: entity('/lesson-progress'),
  WorkbookDefinition: entity('/workbook-definitions'),
  WorkbookResponse: entity('/workbook-responses'),
  ChecklistTask: entity('/checklist-tasks'),
  BrandUpPrompt: entity('/brand-up-prompts'),
  BrandUpEntry: entity('/brand-up-entries'),
  ServiceRequestSubmission: entity('/service-requests'),
  ShareLink: entity('/share-links'),
};

// ─── Integrations stub ────────────────────────────────────────────────────────
export const integrations = {
  Core: {
    async UploadFile({ file }) {
      const form = new FormData();
      form.append('file', file);
      const token = getToken();
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });
      if (!res.ok) throw new Error('Upload failed');
      return res.json();
    },
    async UploadPrivateFile({ file }) {
      return integrations.Core.UploadFile({ file });
    },
    async CreateFileSignedUrl({ file_uri }) {
      return { signed_url: file_uri };
    },
  },
};

// ─── Default export matching base44 shape ────────────────────────────────────
const apiClient = { auth, entities, integrations };
export default apiClient;
