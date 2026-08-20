/**
 * Freedom Foundry API client
 * Auth is now Clerk (cookie-based on web). No manual token handling needed.
 */

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE}/api${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
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

// ─── Auth (compatibility surface — real auth is Clerk) ────────────────────────
export const auth = {
  async me() {
    const response = await apiFetch('/auth/me');
    const user = response?.user ?? response;
    // Keep the imported app's snake_case user surface while Clerk's server
    // bridge returns a minimal modern profile.
    return {
      ...user,
      first_name: user?.first_name ?? user?.firstName ?? '',
      last_name: user?.last_name ?? user?.lastName ?? '',
    };
  },
  // These are no-ops / compatibility stubs. Clerk handles registration & login.
  async login() { return null; },
  async register() { return null; },
  async logout() { window.location.href = `${BASE}/`; },
  isAuthenticated() { return false; }, // use useUser() from @clerk/react instead
  async loginViaEmailPassword() { return null; },
  loginWithProvider() {},
  setToken() {},
  async verifyOtp() { return {}; },
  async resendOtp() { return {}; },
  async resetPasswordRequest() { return {}; },
  async resetPassword() { return {}; },
  async updateMe(data) { return apiFetch('/auth/me', { method: 'PATCH', body: JSON.stringify(data) }); },
};

// ─── Functions ────────────────────────────────────────────────────────────────
export const functions = {
  async getSharedProfile(token) {
    return apiFetch(`/shared-profile/${encodeURIComponent(token)}`);
  },
};

// ─── Generic entity factory ───────────────────────────────────────────────────
function entity(basePath) {
  return {
    async list() { return apiFetch(basePath); },
    async get(id) { return apiFetch(`${basePath}/${id}`); },
    async filter(filterObj = {}) {
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(filterObj)) {
        if (v !== undefined && v !== null) params.set(k, String(v));
      }
      const qs = params.toString();
      return apiFetch(qs ? `${basePath}?${qs}` : basePath);
    },
    async create(data) { return apiFetch(basePath, { method: 'POST', body: JSON.stringify(data) }); },
    async bulkCreate(items) { return Promise.all(items.map(item => this.create(item))); },
    async update(id, data) { return apiFetch(`${basePath}/${id}`, { method: 'PATCH', body: JSON.stringify(data) }); },
    async delete(id) { return apiFetch(`${basePath}/${id}`, { method: 'DELETE' }); },
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

// ─── Integrations ─────────────────────────────────────────────────────────────
export const integrations = {
  Core: {
    async UploadFile({ file }) {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`${BASE}/api/upload`, {
        method: 'POST',
        credentials: 'include',
        body: form,
      });
      if (!res.ok) throw new Error('Upload failed');
      return res.json();
    },
    async UploadPrivateFile({ file }) { return integrations.Core.UploadFile({ file }); },
    async CreateFileSignedUrl({ file_uri }) { return { signed_url: file_uri }; },
  },
};

const apiClient = { auth, entities, integrations };
export default apiClient;

// Legacy compat
export function getToken() { return null; }
export function setToken() {}
