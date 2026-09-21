import { base44 } from '@/api/base44Client';

// Portal sections the AI assistant can view and edit for a client.
export const PORTAL_SECTIONS = [
  { entity: 'PortalContent', label: 'Portal content' },
  { entity: 'BigPicture', label: 'Big Picture' },
  { entity: 'PersonalBrandProfile', label: 'Personal brand profile' },
  { entity: 'CorporateBrandProfile', label: 'Corporate brand profile' },
  { entity: 'MediaKit', label: 'Media kit' },
  { entity: 'BrandGuidelines', label: 'Brand guidelines' },
];

export const PORTAL_ENTITY_LABELS = Object.fromEntries(
  PORTAL_SECTIONS.map((section) => [section.entity, section.label])
);

/** Match the agency client to their portal member account by contact email. */
export async function resolvePortalUser(client) {
  const email = (client?.primary_contact_email || '').trim().toLowerCase();
  if (!email) return null;
  const users = await base44.entities.User.list('-created_date', 500).catch(() => []);
  return (users || []).find((u) => (u.email || '').toLowerCase() === email) || null;
}

/** Load every portal record owned by the member, grouped by entity name. */
export async function loadPortalSnapshot(userId) {
  const load = (entity, sort, limit) =>
    base44.entities[entity].filter({ user_id: userId }, sort, limit).catch(() => []);
  const [content, bigPicture, personal, corporate, mediaKit, guidelines, assets] = await Promise.all([
    load('PortalContent', 'order', 100),
    load('BigPicture', '-created_date', 5),
    load('PersonalBrandProfile', '-created_date', 5),
    load('CorporateBrandProfile', '-created_date', 5),
    load('MediaKit', '-created_date', 5),
    load('BrandGuidelines', '-created_date', 5),
    load('BrandAsset', '-created_date', 100),
  ]);
  return {
    PortalContent: content || [],
    BigPicture: bigPicture || [],
    PersonalBrandProfile: personal || [],
    CorporateBrandProfile: corporate || [],
    MediaKit: mediaKit || [],
    BrandGuidelines: guidelines || [],
    BrandAsset: assets || [],
  };
}

/** Find a snapshot record by entity name and id. */
export function findPortalRecord(snapshot, entity, recordId) {
  const rows = (snapshot && snapshot[entity]) || [];
  return rows.find((row) => row.id === recordId) || null;
}

/**
 * Apply approved AI draft changes. Each change: { entity, action, record_id, fields, summary }.
 * Creates are owned by the client's member account; every change is audit logged.
 */
export async function applyPortalChanges(userId, client, changes) {
  const applied = [];
  for (const change of changes) {
    const entityApi = base44.entities[change.entity];
    if (!entityApi) throw new Error(`Unknown portal section: ${change.entity}`);

    let record;
    if (change.action === 'create') {
      const fields = { user_id: userId, ...change.fields };
      if (change.entity === 'PortalContent') {
        if (!fields.type) fields.type = 'note';
        if (!fields.target_page) fields.target_page = 'overview';
        if (!fields.title) fields.title = change.summary || 'New section';
      }
      record = await entityApi.create(fields);
    } else {
      if (!change.record_id) throw new Error('An update is missing its record id.');
      record = await entityApi.update(change.record_id, change.fields);
    }

    await base44.entities.AuditLog.create({
      actor_role: 'admin',
      entity_type: change.entity,
      entity_id: record.id,
      action: change.action === 'create' ? 'portal_ai_section_created' : 'portal_ai_section_updated',
      source: 'admin_override',
      before_value: { client_id: client.id, change: change.action },
      after_value: { summary: change.summary, fields: change.fields },
    }).catch(() => {});

    applied.push({ change, record });
  }
  return applied;
}