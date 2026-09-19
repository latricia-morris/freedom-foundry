/**
 * Base44-backed API client.
 *
 * Drop-in replacement for the Replit-era client: keeps the same surface
 * (auth, entities, admin, services, support, functions, integrations) so
 * the ported pages work unchanged, now backed by the Base44 SDK and entities.
 */
import { base44 } from '@/api/base44Client';

const baseEntities = base44.entities;

// ─── Current user (light cache to avoid a me() call per entity read) ─────────
let cachedMe = null;
let cachedMeAt = 0;
async function currentUser() {
  if (cachedMe && Date.now() - cachedMeAt < 30000) return cachedMe;
  cachedMe = await base44.auth.me();
  cachedMeAt = Date.now();
  return cachedMe;
}

// ─── Member-scoped entities ───────────────────────────────────────────────────
// Records that belong to a single member. Member pages previously relied on
// the Replit server to scope reads to the signed-in user; replicate that here
// (admins see everything).
const MEMBER_SCOPED = new Set([
  'UserProfile',
  'ChecklistTask',
  'BrandUpEntry',
  'BigPicture',
  'PersonalBrandProfile',
  'CorporateBrandProfile',
  'MediaKit',
  'BrandGuidelines',
  'BrandAsset',
  'IgniteOS',
  'WorkbookResponse',
  'LessonProgress',
  'ServiceRequestSubmission',
  'ShareLink',
]);

async function mergeOwnRecords(raw, me, ...args) {
  const [byCreator, byUser] = await Promise.all([
    raw.filter({ created_by_id: me.id }, ...args).catch(() => []),
    raw.filter({ user_id: me.id }, ...args).catch(() => []),
  ]);
  const seen = new Set();
  const merged = [];
  for (const record of [...(byCreator || []), ...(byUser || [])]) {
    if (record?.id && !seen.has(record.id)) {
      seen.add(record.id);
      merged.push(record);
    }
  }
  return merged;
}

function scopedEntity(name) {
  const raw = baseEntities[name];
  if (!MEMBER_SCOPED.has(name)) return raw;
  return {
    ...raw,
    filter: async (filterObj = {}, ...rest) => {
      if (filterObj && Object.keys(filterObj).length === 0) {
        try {
          const me = await currentUser();
          if (me.role !== 'admin') return mergeOwnRecords(raw, me, ...rest);
        } catch { /* fall through unscoped */ }
      }
      return raw.filter(filterObj, ...rest);
    },
    list: async (...args) => {
      try {
        const me = await currentUser();
        if (me.role !== 'admin') return mergeOwnRecords(raw, me, ...args);
      } catch { /* fall through unscoped */ }
      return raw.list(...args);
    },
  };
}

// The Replit server merged each user's profile into the user record; keep the
// same shape (first_name/last_name/account_type) for the admin roster.
async function usersWithProfiles() {
  const users = await baseEntities.User.list();
  let profiles = [];
  try { profiles = await baseEntities.UserProfile.list(); } catch { /* ignore */ }
  const byUser = new Map();
  for (const profile of profiles || []) {
    byUser.set(profile.user_id || profile.created_by_id, profile);
  }
  return users.map((user) => {
    const profile = byUser.get(user.id) || {};
    return {
      ...user,
      first_name: profile.first_name || '',
      last_name: profile.last_name || '',
      account_type: profile.account_type || 'free',
      headshot_image_url: profile.headshot_url || '',
    };
  });
}

const entityNames = [
  'User', 'UserProfile', 'PersonalBrandProfile', 'CorporateBrandProfile',
  'BrandGuidelines', 'BrandAsset', 'MediaKit', 'BigPicture', 'IgniteOS',
  'VaultItem', 'CourseModule', 'CourseLesson', 'LessonProgress',
  'WorkbookDefinition', 'WorkbookResponse', 'ChecklistTask', 'BrandUpPrompt',
  'BrandUpEntry', 'ServiceRequestSubmission', 'ShareLink', 'PortalContent',
];

const entities = {};
for (const name of entityNames) entities[name] = scopedEntity(name);
entities.User = { ...baseEntities.User, list: usersWithProfiles };

// ─── Auth ────────────────────────────────────────────────────────────────────
export const auth = {
  async me() {
    const user = await base44.auth.me();
    let profile = null;
    try {
      const profiles = await baseEntities.UserProfile.filter({ created_by_id: user.id }, '-updated_date', 1);
      profile = profiles?.[0] || null;
    } catch { /* profile optional */ }
    return {
      ...user,
      first_name: profile?.first_name || user.first_name || '',
      last_name: profile?.last_name || user.last_name || '',
      full_name: user.full_name || '',
      business_name: profile?.business_name || '',
      phone: profile?.phone || '',
      headshot_image_url: profile?.headshot_url || '',
      account_type: profile?.account_type || 'free',
      marketing_consent: profile?.marketing_consent ?? false,
      referral_only: false,
      referral_partner: null,
    };
  },
  login: (...args) => base44.auth.loginViaEmailPassword(...args),
  register: (...args) => base44.auth.register(...args),
  logout: (...args) => base44.auth.logout(...args),
  isAuthenticated: () => base44.auth.isAuthenticated(),
  loginViaEmailPassword: (...args) => base44.auth.loginViaEmailPassword(...args),
  loginWithProvider: (...args) => base44.auth.loginWithProvider(...args),
  setToken: (...args) => base44.auth.setToken(...args),
  verifyOtp: (...args) => base44.auth.verifyOtp(...args),
  resendOtp: (...args) => base44.auth.resendOtp(...args),
  resetPasswordRequest: (...args) => base44.auth.resetPasswordRequest(...args),
  resetPassword: (...args) => base44.auth.resetPassword(...args),
  updateMe: (data) => base44.auth.updateMe(data),
};

// ─── Backend functions ──────────────────────────────────────────────────────
export const functions = {
  async getSharedProfile(token) {
    const response = await base44.functions.invoke('get-shared-profile', { token });
    return response?.data ?? response;
  },
};

// ─── Support (bug reports) ───────────────────────────────────────────────────
export const support = {
  async createReport(data = {}) {
    const record = await baseEntities.BugReport.create({
      description: data.description,
      provider: data.provider || '',
      page_url: data.page_url || '',
      extra: data,
    });
    return { report: record };
  },
  async listReports() {
    const reports = await baseEntities.BugReport.list('-created_date', 100).catch(() => []);
    return { reports };
  },
};

// ─── Member services hub ────────────────────────────────────────────────────
const SERVICE_HUB_DEFAULT_CONFIG = {
  categories: [],
  pricing_text: '',
  trusted_support_disclaimer:
    'Trusted support may include independent specialists and partners. We will always be clear about who is involved before any work begins.',
};

export const services = {
  async getConfig() {
    return { config: SERVICE_HUB_DEFAULT_CONFIG };
  },
  async getContext() {
    const me = await base44.auth.me();
    const requests = await baseEntities.ServiceRequestSubmission
      .filter({ created_by_id: me.id }, '-created_date', 100)
      .catch(() => []);
    const last = requests?.[0] || null;
    return {
      returning_client: (requests || []).length > 0,
      request_count: (requests || []).length,
      last_request_at: last?.created_date || null,
      updated_at: last?.updated_date || last?.created_date || null,
    };
  },
  async listRequests() {
    const me = await base44.auth.me();
    const requests = await baseEntities.ServiceRequestSubmission
      .filter({ created_by_id: me.id }, '-created_date', 100)
      .catch(() => []);
    return { requests: requests || [] };
  },
  async createRequest(payload = {}) {
    const record = await baseEntities.ServiceRequestSubmission.create({
      request_kind: payload.request_kind || 'service_hub',
      category_key: payload.category_key || '',
      service_type: payload.service_type || 'Member services request',
      client_status: payload.client_status || 'new',
      objective: payload.objective || '',
      timeline: payload.timeline || '',
      recommendation: payload.recommendation || '',
      status: payload.save_for_later ? 'save_for_later' : 'submitted',
      save_for_later: !!payload.save_for_later,
      answers: payload.answers || {},
      details: payload.details || {},
      notes: payload.details?.message || payload.notes || '',
      user_id: (await base44.auth.me().catch(() => null))?.id || undefined,
    });
    return { ...record, created_at: record.created_date, requested_at: record.created_date };
  },
};

// ─── Admin ────────────────────────────────────────────────────────────────────
async function profileFor(userId) {
  let profiles = [];
  try { profiles = await baseEntities.UserProfile.filter({ user_id: userId }, '-updated_date', 50); } catch { /* ignore */ }
  if (!profiles?.length) {
    try { profiles = await baseEntities.UserProfile.filter({ created_by_id: userId }, '-updated_date', 50); } catch { /* ignore */ }
  }
  return profiles?.[0] || null;
}

async function upsertProfile(userId, data) {
  const existing = await profileFor(userId);
  if (existing) return baseEntities.UserProfile.update(existing.id, data);
  return baseEntities.UserProfile.create({ ...data, user_id: userId });
}

async function ownedBy(name, userId, limit = 200) {
  const [byUser, byCreator] = await Promise.all([
    baseEntities[name].filter({ user_id: userId }, '-created_date', limit).catch(() => []),
    baseEntities[name].filter({ created_by_id: userId }, '-created_date', limit).catch(() => []),
  ]);
  const seen = new Set();
  const merged = [];
  for (const record of [...(byUser || []), ...(byCreator || [])]) {
    if (record?.id && !seen.has(record.id)) {
      seen.add(record.id);
      merged.push(record);
    }
  }
  return merged;
}

const BRAND_ASSET_FILE_TYPES = ['logo', 'design_asset', 'print_collateral', 'digital_asset', 'deliverable', 'other'];

export const admin = {
  async listQuizAttempts() {
    const rows = await baseEntities.PersonaQuizAttempt.list('-created_date', 200).catch(() => []);
    return (rows || []).map((row) => ({
      id: row.id,
      email: row.email,
      first_name: row.first_name,
      marketing_consent: row.marketing_consent,
      primary_archetype: row.primary_archetype,
      primary_score: row.primary_score,
      secondary_archetype: row.secondary_archetype,
      secondary_score: row.secondary_score,
      status: row.status,
      expires_at: row.expires_at,
      claimed_at: row.claimed_at,
      created_at: row.created_date,
    }));
  },
  async inviteUser(email) {
    await base44.users.inviteUser(email, 'user');
    return { email };
  },
  async createClient({ email, first_name = '', last_name = '', business_name = '', phone = '' }) {
    const cleanEmail = String(email || '').trim().toLowerCase();
    if (!cleanEmail) throw new Error('An email address is required.');
    const users = await baseEntities.User.list().catch(() => []);
    const fields = {};
    if (first_name) fields.first_name = first_name;
    if (last_name) fields.last_name = last_name;
    if (business_name) fields.business_name = business_name;
    if (phone) fields.phone = phone;

    const existing = (users || []).find((u) => (u.email || '').toLowerCase() === cleanEmail);
    if (existing) {
      if (Object.keys(fields).length) await upsertProfile(existing.id, fields);
      return { ...existing, first_name, last_name, business_name, phone };
    }

    await base44.users.inviteUser(cleanEmail, 'user');
    let created = null;
    for (let attempt = 0; attempt < 5 && !created; attempt += 1) {
      const rows = await baseEntities.User.list().catch(() => []);
      created = (rows || []).find((u) => (u.email || '').toLowerCase() === cleanEmail);
      if (!created) await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    if (!created) {
      throw new Error('The invite was sent, but the client has not appeared in the roster yet. Refresh in a moment and select them from the list.');
    }
    if (Object.keys(fields).length) await upsertProfile(created.id, fields);
    return { ...created, first_name, last_name, business_name, phone };
  },
  async getUserAccount(userId) {
    const user = await baseEntities.User.get(userId);
    const profile = await profileFor(userId);
    return {
      user: {
        ...user,
        created_at: user.created_date,
        first_name: profile?.first_name || '',
        last_name: profile?.last_name || '',
      },
      profile,
    };
  },
  async getUserPortalData(userId) {
    const [
      bigPictures, personalBrandProfiles, corporateBrandProfiles, mediaKits,
      brandAssets, workbookDefinitions, workbookResponses, checklistTasks,
      brandUpEntries, serviceRequests,
    ] = await Promise.all([
      ownedBy('BigPicture', userId),
      ownedBy('PersonalBrandProfile', userId),
      ownedBy('CorporateBrandProfile', userId),
      ownedBy('MediaKit', userId),
      ownedBy('BrandAsset', userId),
      baseEntities.WorkbookDefinition.list('-created_date', 200).catch(() => []),
      ownedBy('WorkbookResponse', userId),
      ownedBy('ChecklistTask', userId),
      ownedBy('BrandUpEntry', userId),
      ownedBy('ServiceRequestSubmission', userId),
    ]);
    return {
      bigPictures,
      personalBrandProfiles,
      corporateBrandProfiles,
      mediaKits,
      brandAssets,
      workbookDefinitions,
      workbookResponses,
      checklistTasks,
      brandUpEntries,
      serviceRequests,
    };
  },
  async updateUserAccount(userId, data = {}) {
    let user = null;
    if (data.role) {
      user = await baseEntities.User.update(userId, { role: data.role });
    } else {
      user = await baseEntities.User.get(userId).catch(() => null);
    }
    const profileFields = {};
    if (data.account_type !== undefined) profileFields.account_type = data.account_type;
    if (data.brand_power_moves_unlocked !== undefined) profileFields.brand_power_moves_unlocked = data.brand_power_moves_unlocked;
    if (data.notes !== undefined) profileFields.notes = data.notes;
    const profile = Object.keys(profileFields).length
      ? await upsertProfile(userId, profileFields)
      : await profileFor(userId);
    return {
      user: {
        ...(user || {}),
        created_at: user?.created_date,
        first_name: profile?.first_name || '',
        last_name: profile?.last_name || '',
      },
      profile,
    };
  },
  async getClientBrandData(userId) {
    const [personal, corporate, guidelines, mediaKit] = await Promise.all([
      ownedBy('PersonalBrandProfile', userId, 5),
      ownedBy('CorporateBrandProfile', userId, 5),
      ownedBy('BrandGuidelines', userId, 5),
      ownedBy('MediaKit', userId, 5),
    ]);
    return {
      personal: personal[0] || null,
      corporate: corporate[0] || null,
      guidelines: guidelines[0] || null,
      mediaKit: mediaKit[0] || null,
    };
  },
  async applyClientImport(userId, draft = {}) {
    const results = {};
    const clean = (fields) => Object.fromEntries(
      Object.entries(fields || {}).filter(([, value]) => value !== '' && value != null && !(Array.isArray(value) && !value.length))
    );
    const linkRows = (rows, requiredKey) => (rows || []).filter((row) => row && row[requiredKey] && String(row[requiredKey]).trim());
    const upsertRecord = async (name, fields, label) => {
      const cleaned = clean(fields);
      if (!Object.keys(cleaned).length) { results[label] = 'skipped'; return; }
      const existing = (await ownedBy(name, userId, 5))[0] || null;
      if (existing) {
        await baseEntities[name].update(existing.id, cleaned);
        results[label] = 'updated';
      } else {
        await baseEntities[name].create({ ...cleaned, user_id: userId });
        results[label] = 'created';
      }
    };

    const personal = { ...(draft.personal || {}) };
    personal.book_links = linkRows(personal.book_links, 'title');
    personal.has_books = personal.book_links.length > 0;
    await upsertRecord('PersonalBrandProfile', personal, 'personal');

    const corporate = { ...(draft.corporate || {}) };
    corporate.colors = linkRows(corporate.colors, 'name');
    await upsertRecord('CorporateBrandProfile', corporate, 'corporate');

    await upsertRecord('BrandGuidelines', draft.guidelines || {}, 'guidelines');

    const mediaKit = { ...(draft.media_kit || {}) };
    mediaKit.social_links = linkRows(mediaKit.social_links, 'url');
    mediaKit.feature_links = linkRows(mediaKit.feature_links, 'url');
    mediaKit.book_links = linkRows(mediaKit.book_links, 'url');
    mediaKit.has_books = mediaKit.book_links.length > 0;
    await upsertRecord('MediaKit', mediaKit, 'media_kit');

    const assets = (draft.assets || []).filter((asset) => asset && asset.file_url);
    if (assets.length) {
      await baseEntities.BrandAsset.bulkCreate(assets.map((asset) => ({
        title: asset.title || 'Brand file',
        description: asset.description || '',
        file_url: asset.file_url,
        file_type: BRAND_ASSET_FILE_TYPES.includes(asset.file_type) ? asset.file_type : 'other',
        user_id: userId,
        uploaded_by: 'Admin import',
      })));
      results.assets = assets.length;
    }
    return results;
  },
  async addUserContent(userId, { kind, data = {} }) {
    if (kind === 'checklist_task') {
      const item = await baseEntities.ChecklistTask.create({ ...data, user_id: userId });
      return { item };
    }
    if (kind === 'brand_up_entry') {
      const item = await baseEntities.BrandUpEntry.create({ response_text: data.response, user_id: userId });
      return { item };
    }
    if (kind === 'service_request') {
      const item = await baseEntities.ServiceRequestSubmission.create({
        service_type: data.service_type,
        notes: typeof data.details === 'string' ? data.details : '',
        details: typeof data.details === 'string' ? { message: data.details } : (data.details || {}),
        user_id: userId,
      });
      return { item };
    }
    if (kind === 'brand_asset') {
      const item = await baseEntities.BrandAsset.create({
        title: data.title,
        description: data.description || '',
        file_url: data.file_url || 'pending',
        file_type: BRAND_ASSET_FILE_TYPES.includes(data.file_type) ? data.file_type : 'other',
        user_id: userId,
      });
      return { item };
    }
    throw new Error('Unknown content kind');
  },
};

// ─── Brand persona quiz ──────────────────────────────────────────────────────
function quizResult(row) {
  if (!row) return null;
  return {
    id: row.id,
    brandView: row.brand_view,
    primaryArchetype: row.primary_archetype,
    primaryScore: row.primary_score,
    secondaryArchetype: row.secondary_archetype,
    secondaryScore: row.secondary_score,
    scores: row.scores,
    createdAt: row.created_date,
  };
}

export const quiz = {
  async getDefinition() {
    const response = await base44.functions.invoke('persona-quiz', { action: 'definition' });
    return response?.data ?? response;
  },
  async submitAttempt(payload) {
    const response = await base44.functions.invoke('persona-quiz', { action: 'submit', payload });
    return response?.data ?? response;
  },
  async claimAttempt(token) {
    const response = await base44.functions.invoke('persona-quiz', { action: 'claim', payload: { token } });
    return response?.data ?? response;
  },
  async getLatest() {
    const me = await base44.auth.me().catch(() => null);
    if (!me) return null;
    const rows = await baseEntities.PersonaQuizAttempt.filter({ user_id: me.id }, '-created_date', 1).catch(() => []);
    return quizResult((rows || [])[0]);
  },
  async getLatestForView(view) {
    const me = await base44.auth.me().catch(() => null);
    if (!me) return null;
    const rows = await baseEntities.PersonaQuizAttempt.filter({ user_id: me.id }, '-created_date', 25).catch(() => []);
    const match = (rows || []).find((row) => row.brand_view === view || row.brand_view === 'one_and_the_same') || null;
    return quizResult(match);
  },
  async getHistory() {
    const me = await base44.auth.me().catch(() => null);
    if (!me) return [];
    const rows = await baseEntities.PersonaQuizAttempt.filter({ user_id: me.id }, '-created_date', 50).catch(() => []);
    return (rows || []).map(quizResult);
  },
};

// ─── Integrations (Base44 Core package) ─────────────────────────────────────
export const integrations = { Core: base44.integrations.Core };

// ─── Google Drive (connector-backed browsing) ────────────────────────────────
export const drive = {
  async browse(folderId = '') {
    const response = await base44.functions.invoke('drive-browse', { action: 'browse', folderId });
    return response?.data ?? response;
  },
  async getFile(fileId) {
    const response = await base44.functions.invoke('drive-browse', { action: 'file', fileId });
    return response?.data ?? response;
  },
};

const apiClient = { auth, admin, support, services, entities, integrations, functions, quiz, drive };
export default apiClient;