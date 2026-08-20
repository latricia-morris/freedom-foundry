import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Shield, Check, FileText, ListChecks, MessageSquare, Send, Eye } from 'lucide-react';
import apiClient from '@/api/client';
import { ACCOUNT_TYPE_LABELS } from '@/lib/useMembership';

const ACCOUNT_TYPES = ['free', 'premium', 'client', 'premium_client'];

const TABS = [
  { key: 'account', label: 'Account' },
  { key: 'brand', label: 'Brand Data' },
  { key: 'workbooks', label: 'Workbooks' },
  { key: 'checklist', label: 'Checklist' },
  { key: 'brandup', label: 'Brand Up' },
  { key: 'services', label: 'Service Requests' },
];

function FieldRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="py-1.5">
      <span className="text-xs uppercase tracking-wider text-[#1a1420]/40 block">{label}</span>
      <span className="text-sm text-[#1a1420]">{value}</span>
    </div>
  );
}

export default function AdminUserDetail() {
  const { id } = useParams();
  const [tab, setTab] = useState('account');
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [accountType, setAccountType] = useState('free');
  const [bpmUnlocked, setBpmUnlocked] = useState(false);
  const [notes, setNotes] = useState('');
  const [role, setRole] = useState('user');
  const [saveError, setSaveError] = useState('');
  const [loadError, setLoadError] = useState('');

  // Brand data
  const [bigPicture, setBigPicture] = useState(null);
  const [personalBrand, setPersonalBrand] = useState(null);
  const [corporateBrand, setCorporateBrand] = useState(null);
  const [mediaKit, setMediaKit] = useState(null);
  const [workbookResponses, setWorkbookResponses] = useState([]);
  const [workbookDefs, setWorkbookDefs] = useState([]);
  const [checklist, setChecklist] = useState([]);
  const [brandUpEntries, setBrandUpEntries] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [signedUrls, setSignedUrls] = useState({});

  useEffect(() => {
    apiClient.auth.me().then(async me => {
      if (me.role !== 'admin') { setDenied(true); setLoading(false); return; }
      try {
        const account = await apiClient.admin.getUserAccount(id);
        const u = account.user || null;
        setUser(u);
        if (u) {
          const [bigPic, personal, corporate, media, wbDefs, wbResponses, checklistTasks, brandUp, svcReqs] = await Promise.all([
            apiClient.entities.BigPicture.filter({ user_id: u.id }, '-created_date', 1).catch(() => []),
            apiClient.entities.PersonalBrandProfile.filter({ user_id: u.id }, '-created_date', 1).catch(() => []),
            apiClient.entities.CorporateBrandProfile.filter({ user_id: u.id }, '-created_date', 1).catch(() => []),
            apiClient.entities.MediaKit.filter({ user_id: u.id }, '-created_date', 1).catch(() => []),
            apiClient.entities.WorkbookDefinition.filter({}, '-created_date', 50).catch(() => []),
            apiClient.entities.WorkbookResponse.filter({ user_id: u.id }, '-created_date', 200).catch(() => []),
            apiClient.entities.ChecklistTask.filter({ user_id: u.id }, '-created_date', 200).catch(() => []),
            apiClient.entities.BrandUpEntry.filter({ user_id: u.id }, '-created_date', 200).catch(() => []),
            apiClient.entities.ServiceRequestSubmission.filter({ user_id: u.id }, '-created_date', 50).catch(() => []),
          ]);
          const p = account.profile || null;
          setUserProfile(p);
          setAccountType(p?.account_type || 'free');
          setBpmUnlocked(p?.brand_power_moves_unlocked || false);
          setNotes(p?.notes || '');
          setRole(u.role || 'user');
          setBigPicture(bigPic?.[0] || null);
          setPersonalBrand(personal?.[0] || null);
          setCorporateBrand(corporate?.[0] || null);
          setMediaKit(media?.[0] || null);
          setWorkbookDefs(wbDefs || []);
          setWorkbookResponses(wbResponses || []);
          setChecklist(checklistTasks || []);
          setBrandUpEntries(brandUp || []);
          setServiceRequests(svcReqs || []);
        }
      } catch (requestError) {
        setLoadError(requestError.message || 'This member account could not be loaded.');
      }
      setLoading(false);
    }).catch(() => { setDenied(true); setLoading(false); });
  }, [id]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSaveError('');
    try {
      const account = await apiClient.admin.updateUserAccount(user.id, {
        role,
        account_type: accountType,
        brand_power_moves_unlocked: bpmUnlocked,
        notes,
      });
      setUser(account.user);
      setUserProfile(account.profile || null);
      setRole(account.user.role || 'user');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (requestError) {
      setSaveError(requestError.message || 'The account settings could not be saved.');
    }
    setSaving(false);
  };

  const handleViewFile = async (uri, index) => {
    if (signedUrls[index]) {
      window.open(signedUrls[index], '_blank');
      return;
    }
    try {
      const { signed_url } = await apiClient.integrations.Core.CreateFileSignedUrl({ file_uri: uri });
      setSignedUrls(prev => ({ ...prev, [index]: signed_url }));
      window.open(signed_url, '_blank');
    } catch (_) {}
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" /></div>;
  if (denied) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <Shield className="w-8 h-8 text-muted-foreground mx-auto mb-3" strokeWidth={1} />
        <h1 className="font-heading text-xl text-foreground mb-1">Admin Access Required</h1>
      </div>
    </div>
  );
  if (!user) return (
    <div className="text-center py-20">
      <h1 className="font-heading text-xl text-foreground mb-2">User not found</h1>
      {loadError && <p role="alert" className="mb-4 text-sm text-red-400">{loadError}</p>}
      <Link to="/admin/users" className="text-sm text-primary">Back to Users</Link>
    </div>
  );

  // Group workbook responses by workbook
  const wbGroups = {};
  workbookResponses.forEach(r => {
    if (!wbGroups[r.workbook_id]) wbGroups[r.workbook_id] = [];
    wbGroups[r.workbook_id].push(r);
  });
  const wbDefMap = {};
  workbookDefs.forEach(d => { wbDefMap[d.id] = d; });

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <Link to="/admin/users" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Users
        </Link>
        <Link to="/admin/brand-up" className="text-xs uppercase tracking-widest text-primary hover:opacity-80">Manage Brand Up Prompts</Link>
      </div>

      {/* User header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-full border border-black/10 flex items-center justify-center bg-[#f0ece4]">
          <span className="font-heading text-lg text-[#1a1420]">{(user.full_name || user.email || 'U')[0].toUpperCase()}</span>
        </div>
        <div>
          <h1 className="font-heading text-xl text-foreground">{`${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unnamed User'}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-6 border-b border-border overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-xs uppercase tracking-wider font-medium transition-colors whitespace-nowrap ${tab === t.key ? 'text-primary border-b-2 border-primary -mb-px' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Account tab */}
      {tab === 'account' && (
        <div className="editorial-container space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-[#1a1420]/60">User ID</span>
              <span className="text-xs font-mono text-[#1a1420]/80">{user.id}</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-[#1a1420]/60">Platform Role</span>
              <span className={`text-xs uppercase tracking-widest ${user.role === 'admin' ? 'text-[#b3232c]' : 'text-[#1a1420]/60'}`}>{user.role || 'user'}</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-[#1a1420]/60">Joined</span>
              <span className="text-sm text-[#1a1420]">{user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}</span>
            </div>
          </div>

          <div className="h-px bg-black/10" />

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-2" htmlFor="member-role">Portal Role</label>
            <select
              id="member-role"
              value={role}
              onChange={e => setRole(e.target.value)}
              className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-[#1a1420] outline-none transition-colors focus:border-[#b3232c]"
            >
              <option value="user">Member</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-3">Membership Type</label>
            <div className="flex flex-wrap gap-2">
              {ACCOUNT_TYPES.map(type => (
                <button
                  key={type}
                  onClick={() => setAccountType(type)}
                  className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${accountType === type ? 'text-white' : 'text-[#1a1420]/60 border border-black/10 hover:border-black/20'}`}
                  style={accountType === type ? { background: 'linear-gradient(131deg, #b3232c, #d9622c)' } : {}}
                >
                  {ACCOUNT_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#1a1420]">Brand Power Moves Access</p>
              <p className="text-xs text-[#1a1420]/50 mt-0.5">Grant or revoke unlock access</p>
            </div>
            <button
              onClick={() => setBpmUnlocked(!bpmUnlocked)}
              className={`relative w-12 h-6 rounded-full transition-colors ${bpmUnlocked ? '' : 'bg-black/10'}`}
              style={bpmUnlocked ? { background: 'linear-gradient(131deg, #b3232c, #d9622c)' } : {}}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${bpmUnlocked ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-2">Admin Notes</label>
            <textarea
              className="w-full rounded-xl px-4 py-3 text-sm text-[#1a1420] bg-white border border-black/10 outline-none focus:border-[#b3232c] transition-colors resize-none"
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Internal notes about this user..."
            />
          </div>

          {saveError && <p role="alert" className="rounded-lg border border-red-500/30 bg-red-950/20 px-4 py-3 text-sm text-red-700">{saveError}</p>}

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs uppercase tracking-widest text-white disabled:opacity-50"
            style={{ background: 'linear-gradient(131deg, #b3232c, #d9622c, #f0d9b5)' }}
          >
            {saved ? <Check className="w-4 h-4" /> : null}
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      )}

      {/* Brand Data tab */}
      {tab === 'brand' && (
        <div className="space-y-4">
          {/* Big Picture */}
          {bigPicture && (
            <div className="editorial-container">
              <h3 className="font-heading text-lg text-[#1a1420] mb-3">Big Picture</h3>
              <div className="grid grid-cols-2 gap-x-4">
                <FieldRow label="Word for the Year" value={bigPicture.word_for_the_year} />
                <FieldRow label="End of Year Goal" value={bigPicture.end_of_year_goal} />
                <FieldRow label="Secondary Goal" value={bigPicture.secondary_goal} />
                <FieldRow label="Annual Revenue" value={bigPicture.annual_revenue} />
                <FieldRow label="3-Year Goal" value={bigPicture.long_term_goal_3yr} />
                <FieldRow label="5-Year Goal" value={bigPicture.long_term_goal_5yr} />
                <FieldRow label="Impact Statement" value={bigPicture.impact_statement} />
                <FieldRow label="Legacy Statement" value={bigPicture.legacy_statement} />
              </div>
            </div>
          )}

          {/* Personal Brand */}
          {personalBrand && (
            <div className="editorial-container">
              <h3 className="font-heading text-lg text-[#1a1420] mb-3">Personal Brand</h3>
              <div className="grid grid-cols-2 gap-x-4">
                <FieldRow label="Name" value={`${personalBrand.first_name || ''} ${personalBrand.last_name || ''}`} />
                <FieldRow label="Business" value={personalBrand.business_name} />
                <FieldRow label="Short Bio" value={personalBrand.short_bio} />
                <FieldRow label="Positioning" value={personalBrand.positioning} />
                <FieldRow label="Brand Voice" value={personalBrand.brand_voice} />
                <FieldRow label="Heading Font" value={personalBrand.heading_font} />
              </div>
            </div>
          )}

          {/* Corporate Brand */}
          {corporateBrand && (
            <div className="editorial-container">
              <h3 className="font-heading text-lg text-[#1a1420] mb-3">Corporate Brand</h3>
              <div className="grid grid-cols-2 gap-x-4">
                <FieldRow label="Company" value={corporateBrand.company_name} />
                <FieldRow label="Tagline" value={corporateBrand.tagline} />
                <FieldRow label="Mission" value={corporateBrand.mission_statement} />
                <FieldRow label="Target Audience" value={corporateBrand.target_audience} />
                <FieldRow label="Positioning" value={corporateBrand.positioning} />
                <FieldRow label="Brand Voice" value={corporateBrand.brand_voice} />
              </div>
            </div>
          )}

          {/* Media Kit */}
          {mediaKit && (
            <div className="editorial-container">
              <h3 className="font-heading text-lg text-[#1a1420] mb-3">Media Kit</h3>
              <div className="grid grid-cols-2 gap-x-4">
                <FieldRow label="Name" value={`${mediaKit.first_name || ''} ${mediaKit.last_name || ''}`} />
                <FieldRow label="Business" value={mediaKit.business_name} />
                <FieldRow label="Short Bio" value={mediaKit.short_bio} />
                <FieldRow label="Email" value={mediaKit.email} />
                <FieldRow label="Phone" value={mediaKit.phone} />
                <FieldRow label="Website" value={mediaKit.website} />
              </div>
            </div>
          )}

          {!bigPicture && !personalBrand && !corporateBrand && !mediaKit && (
            <div className="editorial-container text-center py-12">
              <p className="text-sm text-[#1a1420]/50">No brand data available yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Workbooks tab */}
      {tab === 'workbooks' && (
        <div className="space-y-4">
          {Object.keys(wbGroups).length === 0 ? (
            <div className="editorial-container text-center py-12">
              <FileText className="w-8 h-8 text-[#1a1420]/20 mx-auto mb-3" />
              <p className="text-sm text-[#1a1420]/50">No workbook responses yet.</p>
            </div>
          ) : (
            Object.entries(wbGroups).map(([wbId, responses]) => {
              const def = wbDefMap[wbId];
              return (
                <div key={wbId} className="editorial-container">
                  <h3 className="font-heading text-lg text-[#1a1420] mb-3">{def?.title || 'Untitled Workbook'}</h3>
                  <div className="space-y-3">
                    {responses.map((r, i) => (
                      <div key={r.id || i} className="py-2 border-b border-black/5 last:border-0">
                        <span className="text-xs uppercase tracking-wider text-[#1a1420]/40">{r.field_id}</span>
                        <p className="text-sm text-[#1a1420] mt-1">{r.value || '(empty)'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Checklist tab */}
      {tab === 'checklist' && (
        <div className="space-y-2">
          {checklist.length === 0 ? (
            <div className="editorial-container text-center py-12">
              <ListChecks className="w-8 h-8 text-[#1a1420]/20 mx-auto mb-3" />
              <p className="text-sm text-[#1a1420]/50">No checklist tasks yet.</p>
            </div>
          ) : (
            checklist.map(task => (
              <div key={task.id} className="editorial-container py-3">
                <div className="flex items-center gap-3">
                  <span className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${task.status === 'completed' ? 'border-[#b3232c] bg-[#b3232c]' : 'border-black/20'}`}>
                    {task.status === 'completed' && <Check className="w-2.5 h-2.5 text-white" />}
                  </span>
                  <span className={`text-sm flex-1 ${task.status === 'completed' ? 'line-through opacity-50 text-[#1a1420]' : 'text-[#1a1420]'}`}>{task.title}</span>
                  {task.deadline_date && <span className="text-xs text-[#b3232c]">{new Date(task.deadline_date).toLocaleDateString()}</span>}
                  {task.parent_id && <span className="text-xs text-[#1a1420]/30">sub-task</span>}
                  {task.assignee && <span className="text-xs text-[#1a1420]/50">→ {task.assignee}</span>}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Brand Up tab */}
      {tab === 'brandup' && (
        <div className="space-y-3">
          {brandUpEntries.length === 0 ? (
            <div className="editorial-container text-center py-12">
              <MessageSquare className="w-8 h-8 text-[#1a1420]/20 mx-auto mb-3" />
              <p className="text-sm text-[#1a1420]/50">No Brand Up entries yet.</p>
            </div>
          ) : (
            brandUpEntries.map(entry => (
              <div key={entry.id} className="editorial-container">
                <p className="font-heading text-sm text-[#1a1420] mb-2 italic">"{entry.prompt_text}"</p>
                <p className="text-sm text-[#2c2c33]">{entry.response_text}</p>
                <p className="text-xs text-[#1a1420]/30 mt-2">{entry.created_date ? new Date(entry.created_date).toLocaleDateString() : ''}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Service Requests tab */}
      {tab === 'services' && (
        <div className="space-y-4">
          {serviceRequests.length === 0 ? (
            <div className="editorial-container text-center py-12">
              <Send className="w-8 h-8 text-[#1a1420]/20 mx-auto mb-3" />
              <p className="text-sm text-[#1a1420]/50">No service requests yet.</p>
            </div>
          ) : (
            serviceRequests.map((req, i) => (
              <div key={req.id} className="editorial-container">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs uppercase tracking-widest text-[#b3232c]">{req.status || 'submitted'}</span>
                  <span className="text-xs text-[#1a1420]/40">{req.created_date ? new Date(req.created_date).toLocaleDateString() : ''}</span>
                </div>
                {(req.project_type || []).length > 0 && (
                  <div className="mb-2">
                    <span className="text-xs uppercase tracking-wider text-[#1a1420]/40">Project Type: </span>
                    <span className="text-sm text-[#1a1420]">{req.project_type.join(', ')}</span>
                  </div>
                )}
                {(req.service_options || []).length > 0 && (
                  <div className="mb-2">
                    <span className="text-xs uppercase tracking-wider text-[#1a1420]/40">Services: </span>
                    <span className="text-sm text-[#1a1420]">{req.service_options.join(', ')}</span>
                  </div>
                )}
                {req.notes && (
                  <div className="mb-2">
                    <span className="text-xs uppercase tracking-wider text-[#1a1420]/40 block">Notes</span>
                    <p className="text-sm text-[#1a1420] mt-1">{req.notes}</p>
                  </div>
                )}
                {(req.inspiration_file_uris || []).length > 0 && (
                  <div className="mt-3">
                    <span className="text-xs uppercase tracking-wider text-[#1a1420]/40 block mb-2">Inspiration Files ({req.inspiration_file_uris.length})</span>
                    <div className="flex gap-2">
                      {req.inspiration_file_uris.map((uri, fi) => (
                        <button
                          key={fi}
                          onClick={() => handleViewFile(uri, `${i}-${fi}`)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-black/10 text-xs text-[#1a1420]/60 hover:border-[#b3232c] hover:text-[#b3232c] transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> View File {fi + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {req.deposit_acknowledged && (
                  <p className="text-xs text-[#1a1420]/40 mt-2 italic">Deposit terms acknowledged</p>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}