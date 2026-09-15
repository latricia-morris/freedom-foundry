import React, { useState } from 'react';
import { useAdminReferralPartners, useAdminReferralSubmissions, useInviteReferralPartner, useUpdateReferralPartner, useUpdateReferralSubmission, useResendReferralInvitation } from '@/hooks/use-admin-referrals';
import { Shield, Link as LinkIcon, Send, CheckCircle, XCircle, Clock, Copy, ChevronRight, MessageSquare, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export default function AdminReferralPartners() {
  const [tab, setTab] = useState('partners'); // partners | submissions
  
  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-12">
      <div className="mb-10 relative">
        <div className="absolute -left-8 -top-8 w-64 h-64 ember-glow-bg z-[-1]" />
        <Link to="/admin" className="text-xs uppercase tracking-widest text-[#e4a06e] hover:text-[#e4a06e]/80 mb-4 inline-block">
          ← Back to Command
        </Link>
        <h1 className="font-heading text-4xl font-light text-foreground mb-3 tracking-wide">
          Referral <span className="molten-text italic font-medium">Partners</span>
        </h1>
        <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">
          Manage invitation-only partners, review their network submissions, and track compensation statuses.
        </p>
      </div>

      <div className="flex gap-4 mb-8 border-b border-border pb-4">
        <button 
          onClick={() => setTab('partners')}
          className={`text-sm tracking-wide uppercase px-4 py-2 transition-colors ${tab === 'partners' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Partner Directory
        </button>
        <button 
          onClick={() => setTab('submissions')}
          className={`text-sm tracking-wide uppercase px-4 py-2 transition-colors ${tab === 'submissions' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Network Submissions
        </button>
      </div>

      {tab === 'partners' ? <PartnersTab /> : <SubmissionsTab />}
    </div>
  );
}

function PartnersTab() {
  const { data: partners = [], isLoading } = useAdminReferralPartners();
  const invite = useInviteReferralPartner();
  const update = useUpdateReferralPartner();
  const resend = useResendReferralInvitation();
  const { toast } = useToast();
  
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteNotes, setInviteNotes] = useState('');

  const handleInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    invite.mutate({ email: inviteEmail, name: inviteName, internal_notes: inviteNotes }, {
      onSuccess: (result) => {
        const deliveryFailed = result?.partner?.invitation_status === 'failed';
        setInviteEmail('');
        setInviteName('');
        setInviteNotes('');
        toast(deliveryFailed
          ? { variant: 'destructive', title: 'Access saved, email not sent', description: 'Copy the private link or retry the invitation email.' }
          : { title: 'Partner access ready', description: `Invitation access was created for ${inviteEmail}.` });
      },
      onError: (err) => toast({ variant: 'destructive', title: 'Error', description: err.message })
    });
  };

  const copyLink = (url) => {
    navigator.clipboard.writeText(url);
    toast({ title: 'Link Copied', description: 'Program URL copied to clipboard.' });
  };

  const handleStatusChange = (id, newStatus) => {
    update.mutate({ id, data: { status: newStatus } }, {
      onSuccess: () => toast({ title: 'Status Updated', description: `Partner status updated to ${newStatus}.` }),
      onError: (err) => toast({ variant: 'destructive', title: 'Error', description: err.message })
    });
  };

  const handleResend = (id) => {
    resend.mutate(id, {
      onSuccess: (result) => toast(result?.partner?.invitation_status === 'failed'
        ? { variant: 'destructive', title: 'Email not sent', description: 'The private link is still available to copy and share.' }
        : { title: 'Invitation Resent', description: 'A new invitation email has been sent.' }),
      onError: (err) => toast({ variant: 'destructive', title: 'Error', description: err.message })
    });
  };

  return (
    <div className="space-y-8">
      <div className="dashboard-card p-6 border border-border">
        <h3 className="font-heading text-xl text-foreground mb-4">Invite New Partner</h3>
        <form onSubmit={handleInvite} className="flex flex-col gap-4 max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Email Address *</label>
              <input 
                type="email" 
                required
                className="admin-input" 
                placeholder="partner@example.com"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Name (Optional)</label>
              <input 
                type="text" 
                className="admin-input" 
                placeholder="Partner Name"
                value={inviteName}
                onChange={e => setInviteName(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-4 items-end">
            <div className="flex-1 space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Internal Notes (Optional)</label>
              <input 
                type="text" 
                className="admin-input" 
                placeholder="Why are we inviting them?"
                value={inviteNotes}
                onChange={e => setInviteNotes(e.target.value)}
              />
            </div>
            <button 
              type="submit" 
              disabled={invite.isPending}
              className="h-[42px] px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium disabled:cursor-not-allowed disabled:opacity-50 flex items-center gap-2"
            >
              <Send className="w-4 h-4" /> Invite
            </button>
          </div>
        </form>
      </div>

      <div className="dashboard-card border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading directory...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/60">
                  <th className="text-left px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">Partner</th>
                  <th className="text-left px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">Status</th>
                  <th className="text-left px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">Joined</th>
                  <th className="text-right px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {partners.map(p => (
                  <tr key={p.id} className="hover:bg-accent/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">{p.name || p.email}</span>
                        {p.name && <span className="text-xs text-muted-foreground">{p.email}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[10px] uppercase tracking-wider ${
                        p.status === 'active' ? 'bg-[#a3d9b4]/10 border-[#a3d9b4]/20 text-[#a3d9b4]' :
                        p.status === 'revoked' ? 'bg-[#d9a3a3]/10 border-[#d9a3a3]/20 text-[#d9a3a3]' :
                        'bg-muted/60 border-border text-muted-foreground'
                      }`}>
                        {p.status}
                      </span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {p.referral_only ? 'Referral-only' : 'Member + partner'}
                        {p.invitation_status === 'failed' ? ' · Email failed' : ''}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        {p.program_url && (
                          <button 
                            onClick={() => copyLink(p.program_url)}
                            className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
                            title="Copy Program Link"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        )}
                        {(p.status === 'invited' || ['pending', 'failed'].includes(p.invitation_status)) && p.invitation_status !== 'not_needed' && (
                          <button 
                            onClick={() => handleResend(p.id)}
                            className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
                            title="Resend Invitation Email"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => update.mutate(
                            { id: p.id, data: { referral_only: !p.referral_only } },
                            {
                              onSuccess: () => toast({
                                title: 'Access scope updated',
                                description: p.referral_only ? 'This partner now keeps member access.' : 'This account is now limited to the referral portal.',
                              }),
                              onError: (err) => toast({ variant: 'destructive', title: 'Error', description: err.message }),
                            },
                          )}
                          className="px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground hover:text-primary"
                          title={p.referral_only ? 'Keep existing member access' : 'Limit to referral portal'}
                        >
                          {p.referral_only ? 'Grant member access' : 'Make referral-only'}
                        </button>
                        {p.status === 'pending' && (
                          <button 
                            onClick={() => handleStatusChange(p.id, 'active')}
                            className="p-1.5 text-muted-foreground hover:text-[#a3d9b4] transition-colors"
                            title="Grant Access"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {p.status === 'active' && (
                          <button 
                            onClick={() => handleStatusChange(p.id, 'revoked')}
                            className="p-1.5 text-muted-foreground hover:text-[#d9a3a3] transition-colors"
                            title="Revoke Access"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        {p.status === 'revoked' && (
                          <button 
                            onClick={() => handleStatusChange(p.id, 'active')}
                            className="p-1.5 text-muted-foreground hover:text-[#a3d9b4] transition-colors"
                            title="Restore Access"
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function SubmissionsTab() {
  const { data: submissions = [], isLoading } = useAdminReferralSubmissions();
  const update = useUpdateReferralSubmission();
  const { toast } = useToast();
  
  const [editingId, setEditingId] = useState(null);
  const [editNotes, setEditNotes] = useState('');

  const handleUpdate = (id, field, value) => {
    update.mutate({ id, data: { [field]: value } }, {
      onSuccess: () => toast({ title: 'Status Updated', description: 'Submission status has been updated.' }),
      onError: (err) => toast({ variant: 'destructive', title: 'Error', description: err.message })
    });
  };

  const saveNotes = (id) => {
    update.mutate({ id, data: { internal_notes: editNotes } }, {
      onSuccess: () => {
        setEditingId(null);
        toast({ title: 'Notes Saved', description: 'Internal notes have been updated.' });
      },
      onError: (err) => toast({ variant: 'destructive', title: 'Error', description: err.message })
    });
  };

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="text-center text-muted-foreground py-12">Loading submissions...</div>
      ) : submissions.length === 0 ? (
        <div className="text-center text-muted-foreground py-12 border border-border border-dashed rounded-xl">
          No submissions found in the network.
        </div>
      ) : (
        submissions.map(sub => (
          <div key={sub.id} className="dashboard-card border border-border p-6 flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded ${sub.kind === 'referral' ? 'bg-primary/20 text-primary' : 'bg-muted/60 text-muted-foreground'}`}>
                    {sub.kind}
                  </span>
                  <span className="text-xs text-muted-foreground">{new Date(sub.created_at).toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground border-l border-border pl-2 ml-1">
                    From: {sub.partner?.name || sub.partner?.email || 'Unknown Partner'}
                  </span>
                </div>
                
                {sub.kind === 'referral' ? (
                  <>
                    <h4 className="font-heading text-xl text-foreground">{sub.contact_name} <span className="text-muted-foreground">at</span> {sub.business_name}</h4>
                    <div className="text-sm text-muted-foreground mt-1 flex gap-4">
                      <span>Email: {sub.contact_email}</span>
                      {sub.contact_phone && <span>Phone: {sub.contact_phone}</span>}
                    </div>
                  </>
                ) : (
                  <h4 className="font-heading text-xl text-foreground">Partner Question</h4>
                )}
              </div>
              
              {sub.kind === 'referral' && (
                <div className="flex gap-4">
                  <div className="flex flex-col">
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Referral Status</label>
                    <select
                      className="admin-input py-1 text-sm h-8"
                      value={sub.status || 'submitted'}
                      onChange={e => handleUpdate(sub.id, 'status', e.target.value)}
                    >
                      <option value="submitted">Submitted</option>
                      <option value="contacted">Contacted</option>
                      <option value="qualified">Qualified</option>
                      <option value="converted">Converted (Won)</option>
                      <option value="closed">Closed (Lost)</option>
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Payout Status</label>
                    <select
                      className="admin-input py-1 text-sm h-8"
                      value={sub.payout_status || 'pending'}
                      onChange={e => handleUpdate(sub.id, 'payout_status', e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="paid">Paid</option>
                      <option value="ineligible">Ineligible</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-muted/60 border border-border p-4 rounded-xl text-sm text-foreground/80 mt-2">
              {sub.kind === 'referral' ? (
                <>
                  <div className="mb-2"><strong className="text-muted-foreground font-normal">Relationship:</strong> {sub.relationship}</div>
                  <div><strong className="text-muted-foreground font-normal">Notes:</strong> {sub.notes}</div>
                </>
              ) : (
                <div>{sub.question}</div>
              )}
            </div>

            <div className="border-t border-border pt-4 mt-2">
              {editingId === sub.id ? (
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    className="admin-input flex-1 h-9" 
                    placeholder="Internal notes..." 
                    value={editNotes}
                    onChange={e => setEditNotes(e.target.value)}
                    autoFocus
                  />
                  <button onClick={() => saveNotes(sub.id)} className="px-4 bg-primary/20 text-primary rounded-lg text-sm font-medium hover:bg-primary/30">Save</button>
                  <button onClick={() => setEditingId(null)} className="px-4 text-muted-foreground hover:text-foreground text-sm">Cancel</button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MessageSquare className="w-4 h-4" /> 
                    {sub.internal_notes ? (
                      <span className="text-foreground/70">{sub.internal_notes}</span>
                    ) : (
                      <span className="italic">No internal notes</span>
                    )}
                  </div>
                  <button 
                    onClick={() => {
                      setEditingId(sub.id);
                      setEditNotes(sub.internal_notes || '');
                    }}
                    className="text-xs uppercase tracking-widest text-primary hover:text-primary/80"
                  >
                    Edit Notes
                  </button>
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
