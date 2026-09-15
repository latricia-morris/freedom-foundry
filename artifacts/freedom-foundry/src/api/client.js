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
    const profile = response?.profile;
    const referralPartner = profile?.referral_partner || user?.referral_partner;
    // Keep the imported app's snake_case user surface while Clerk's server
    // bridge returns a minimal modern profile.
    return {
      ...user,
      first_name: user?.first_name ?? profile?.first_name ?? user?.firstName ?? '',
      last_name: user?.last_name ?? profile?.last_name ?? user?.lastName ?? '',
      phone: user?.phone ?? profile?.phone ?? '',
      headshot_image_url: user?.headshot_image_url ?? profile?.headshot_url ?? '',
      referral_only: referralPartner?.referral_only ?? profile?.referral_only ?? user?.referral_only ?? false,
      referral_partner: referralPartner,
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
  async verifyCaptcha(token, purpose) {
    return apiFetch('/auth/captcha/verify', {
      method: 'POST',
      body: JSON.stringify({ token, purpose }),
    });
  },
  async updateMe(data) { return apiFetch('/auth/me', { method: 'PATCH', body: JSON.stringify(data) }); },
};

// ─── Functions ────────────────────────────────────────────────────────────────
export const functions = {
  async getSharedProfile(token) {
    return apiFetch(`/shared-profile/${encodeURIComponent(token)}`);
  },
};

export const admin = {
  async listReferralPartners() { return apiFetch('/admin/referrals/partners'); },
  async inviteReferralPartner(data) { return apiFetch('/admin/referrals/partners/invite', { method: 'POST', body: JSON.stringify(data) }); },
  async updateReferralPartner(id, data) { return apiFetch(`/admin/referrals/partners/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(data) }); },
  async resendReferralInvitation(id) { return apiFetch(`/admin/referrals/partners/${encodeURIComponent(id)}/resend-invitation`, { method: 'POST' }); },
  async listReferralSubmissions() { return apiFetch('/admin/referrals/submissions'); },
  async updateReferralSubmission(id, data) { return apiFetch(`/admin/referrals/submissions/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(data) }); },
  async inviteUser(email) {
    return apiFetch('/admin/invitations', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
  async getUserAccount(userId) {
    return apiFetch(`/admin/users/${encodeURIComponent(userId)}`);
  },
  async getUserPortalData(userId) {
    return apiFetch(`/admin/users/${encodeURIComponent(userId)}/portal-data`);
  },
  async updateUserAccount(userId, data) {
    return apiFetch(`/admin/users/${encodeURIComponent(userId)}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
  async addUserContent(userId, payload) {
    return apiFetch(`/admin/users/${encodeURIComponent(userId)}/portal-content`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  async listClientSetups() {
    return apiFetch('/admin/client-setups');
  },
  async createClientSetup(data) {
    return apiFetch('/admin/client-setups', { method: 'POST', body: JSON.stringify(data) });
  },
  async getClientSetup(id) {
    return apiFetch(`/admin/client-setups/${encodeURIComponent(id)}`);
  },
  async updateClientSetup(id, data) {
    return apiFetch(`/admin/client-setups/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(data) });
  },
  async importClientSetup(id, payload) {
    return apiFetch(`/admin/client-setups/${encodeURIComponent(id)}/import`, { method: 'POST', body: JSON.stringify({ payload }) });
  },
  async listClientSetupTemplates() {
    return apiFetch('/admin/client-setup-templates');
  },
  async createClientSetupTemplate(data) {
    return apiFetch('/admin/client-setup-templates', { method: 'POST', body: JSON.stringify(data) });
  },
  async applyClientSetupTemplate(id, templateId) {
    return apiFetch(`/admin/client-setups/${encodeURIComponent(id)}/apply-template`, { method: 'POST', body: JSON.stringify({ template_id: templateId }) });
  },
  async inviteClientSetup(id) {
    return apiFetch(`/admin/client-setups/${encodeURIComponent(id)}/invite`, { method: 'POST' });
  },
  async claimClientSetup(id) {
    return apiFetch(`/admin/client-setups/${encodeURIComponent(id)}/claim`, { method: 'POST' });
  },
  async updateClientSetupMembers(id, members) {
    return apiFetch(`/admin/client-setups/${encodeURIComponent(id)}/members`, {
      method: 'PATCH',
      body: JSON.stringify({ members }),
    });
  },
  async listSupportReports() {
    return apiFetch('/admin/support-reports');
  },
  async getSupportReport(id) {
    return apiFetch(`/admin/support-reports/${encodeURIComponent(id)}`);
  },
  async getServiceHubConfig() {
    return apiFetch('/admin/service-hub/config');
  },
  async updateServiceHubConfig(data) {
    return apiFetch('/admin/service-hub/config', { method: 'PATCH', body: JSON.stringify(data) });
  },
  async listServiceRequests() {
    return apiFetch('/admin/service-requests');
  },
  async updateServiceRequest(id, data) {
    return apiFetch(`/admin/service-requests/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(data) });
  },
  async listQuizAttempts() {
    return apiFetch('/admin/persona-quiz/attempts');
  },
};

export const support = {
  async listReports() {
    return apiFetch('/support/reports');
  },
  async createReport(data) {
    return apiFetch('/support/reports', { method: 'POST', body: JSON.stringify(data) });
  },
  async createProviderEvent(data) {
    return apiFetch('/support/provider-events', { method: 'POST', body: JSON.stringify(data) });
  },
};

export const services = {
  async getConfig() { return apiFetch('/service-hub/config'); },
  async getContext() { return apiFetch('/service-requests/context'); },
  async listRequests() { return apiFetch('/service-requests'); },
  async createRequest(data) { return apiFetch('/service-requests', { method: 'POST', body: JSON.stringify(data) }); },
};

export const referrals = {
  async getAccess() { return apiFetch('/referrals/access'); },
  async listSubmissions() { return apiFetch('/referrals/submissions'); },
  async createSubmission(data) { return apiFetch('/referrals/submissions', { method: 'POST', body: JSON.stringify(data) }); },
};

export const quiz = {
  async getDefinition() { return apiFetch('/persona-quiz/definition'); },
  async submitAttempt(data) { return apiFetch('/persona-quiz/complete', { method: 'POST', body: JSON.stringify(data) }); },
  async claimAttempt(token) { return apiFetch('/persona-quiz/claim', { method: 'POST', body: JSON.stringify({ token }) }); },
  async getHistory() { return apiFetch('/persona-quiz/history'); },
  async getLatest() { return apiFetch('/persona-quiz/latest'); },
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

const apiClient = { auth, admin, support, services, referrals, entities, integrations, quiz };
export default apiClient;

// Legacy compat
export function getToken() { return null; }
export function setToken() {}
