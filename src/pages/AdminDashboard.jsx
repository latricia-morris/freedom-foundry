import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  ArrowRight,
  Activity,
  UserPlus,
  Crown,
  ChevronRight,
  Bug,
  Wrench,
  UploadCloud,
  FolderOpen,
  Briefcase,
  Mail,
  DollarSign,
  Users,
  Settings2
} from 'lucide-react';
import apiClient from '@/api/client';
import AdminDashboardCard from '@/components/admin/AdminDashboardCard';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [contactSubs, setContactSubs] = useState([]);

  useEffect(() => {
    apiClient.auth.me()
      .then(u => {
        if (u.role !== 'admin') {
          setDenied(true);
          setLoading(false);
          return;
        }
        apiClient.entities.BugReport.list('-created_date', 200)
          .then(r => setReports(r || []))
          .catch(() => {});
        apiClient.entities.ContactSubmission.list('-created_date', 200)
          .then(r => setContactSubs(r || []))
          .catch(() => {});
        return apiClient.entities.User.list();
      })
      .then(userList => {
        if (userList) {
          setUsers(userList);
        }
      })
      .catch(() => {
        setDenied(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="w-10 h-10 border-2 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (denied) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] animate-fade-in">
        <div className="text-center dashboard-card p-10 max-w-md w-full relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 molten-bar" />
          <Shield className="w-12 h-12 text-primary mx-auto mb-4 opacity-80" strokeWidth={1} />
          <h1 className="font-heading text-2xl text-foreground mb-2">Command Denied</h1>
          <p className="text-sm text-muted-foreground">
            This sector of the Foundry requires administrator clearance.
          </p>
          <Link to="/dashboard" className="mt-8 inline-flex items-center gap-2 text-sm link-warm">
            Return to Dashboard <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const admins = users.filter(u => u.role === 'admin');
  const newSubs = contactSubs.filter(s => (s.status || 'new') === 'new');

  const recentUsers = [...users]
    .sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  return (
    <div className="max-w-5xl mx-auto animate-fade-in pb-12">
      <div className="mb-10 relative">
        <div className="absolute -left-8 -top-8 w-64 h-64 ember-glow-bg z-[-1]" />
        <h1 className="font-heading text-4xl font-light text-foreground mb-3 tracking-wide">
          Foundry Command
        </h1>
        <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">
          Oversee member profiles, guide brand architecture, and monitor activity across the platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* Agency OS — first */}
        <AdminDashboardCard
          to="/admin/agency"
          icon={DollarSign}
          title="Agency Operations"
          description="Proposals, deposits, verified Stripe activation, projects, tasks, and controlled deliverable release."
          footer={
            <span className="text-xs uppercase tracking-widest text-primary/80">Proposal → Payment → Delivery</span>
          }
        />

        {/* Contact Inbox Snapshot */}
        <div className="dashboard-card p-6 md:col-span-2">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="icon-tile">
              <Mail className="h-6 w-6 icon-warm" strokeWidth={1.5} />
            </div>
            <h2 className="font-heading text-2xl text-foreground">Contact Inbox</h2>
            {newSubs.length > 0 && (
              <span className="rounded-sm border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-primary">
                {newSubs.length} new
              </span>
            )}
            <Link to="/admin/contact-inbox" className="ml-auto text-xs uppercase tracking-widest link-warm">
              Open Inbox
            </Link>
          </div>
          {newSubs.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No new messages waiting. Every conversation has been seen.
            </p>
          ) : (
            <ul className="divide-y divide-border/40">
              {newSubs.slice(0, 5).map(s => (
                <li key={s.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-3">
                  <span className="text-sm font-medium text-foreground">
                    {[s.first_name, s.last_name].filter(Boolean).join(' ') || 'Unknown sender'}
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-primary/80">
                    {(s.category || 'general').replace(/_/g, ' ')}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">{s.message || ''}</span>
                  {s.created_date && (
                    <span className="text-xs text-muted-foreground/60">
                      {new Date(s.created_date).toLocaleDateString()}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-xs text-muted-foreground/70">
            {newSubs.length} new · {contactSubs.length} total
          </p>
        </div>

        {/* Members */}
        <AdminDashboardCard
          to="/admin/users"
          icon={Users}
          title="Member Roster"
          description="Manage all member access, view individual profiles, and update administrative privileges."
          footer={
            <>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-light text-foreground">{users.length}</span>
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Total</span>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex items-center gap-2">
                <span className="text-xl font-light text-foreground">{admins.length}</span>
                <span className="text-xs uppercase tracking-widest text-primary/70">Admins</span>
              </div>
            </>
          }
        />

        {/* Portfolio Manager */}
        <AdminDashboardCard
          to="/admin/portfolio"
          icon={Briefcase}
          title="Portfolio Manager"
          description="Build the public case-study library — projects, assets, SEO, and publish controls."
          footer={<span className="text-xs uppercase tracking-widest text-primary/80">Case-study library</span>}
        />

        {/* Support Queue */}
        <AdminDashboardCard
          to="/admin/support-reports"
          icon={Bug}
          title="Support Queue"
          description="Member bug reports and feature requests — triage, resolve, or remove."
          footer={
            <>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-light text-foreground">{reports.filter(r => (r.status || 'open') === 'open').length}</span>
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Open</span>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex items-center gap-2">
                <span className="text-xl font-light text-foreground">{reports.length}</span>
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Total</span>
              </div>
            </>
          }
        />

        {/* Services Hub */}
        <AdminDashboardCard
          to="/admin/services"
          icon={Wrench}
          title="Services Hub"
          description="Edit member-facing categories, routing copy, thresholds, and request notes."
          footer={<span className="text-xs uppercase tracking-widest text-primary/80">Configuration + requests</span>}
        />

        {/* Brand Up Engine */}
        <AdminDashboardCard
          to="/admin/brand-up"
          icon={Settings2}
          title="Brand Up Engine"
          description="Configure prompts, inspirational notes, and structural guidelines for the Brand Up module."
          footer={
            <span className="text-xs uppercase tracking-widest text-primary/80 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5" /> Module Configuration
            </span>
          }
        />

        {/* Quiz Leads */}
        <AdminDashboardCard
          to="/admin/quiz-leads"
          icon={Activity}
          title="Quiz Leads"
          description="Review brand persona quiz completions, lead captures, and claimed accounts."
          footer={<span className="text-xs uppercase tracking-widest text-primary/80">Diagnostic Results</span>}
        />

        {/* Client Import */}
        <AdminDashboardCard
          to="/admin/client-import"
          icon={UploadCloud}
          title="Client Import"
          description="Upload a client's brand files and let the Foundry parse them into the right places in their portal — you review before it saves."
          footer={<span className="text-xs uppercase tracking-widest text-primary/80">Guided Parse + Review</span>}
        />

        {/* Portal Content */}
        <AdminDashboardCard
          to="/admin/portal-content"
          icon={FolderOpen}
          title="Portal Content"
          description="Drop files, notes, Drive folders, and custom sections onto any page of a client's Brand Portal as their project grows."
          footer={<span className="text-xs uppercase tracking-widest text-primary/80">Adaptive Client Portal</span>}
        />

        {/* Referral Partners */}
        <AdminDashboardCard
          to="/admin/referral-partners"
          icon={Users}
          title="Referral Partners"
          description="Manage invitation-only referral partners, review submitted opportunities, and track payouts."
          footer={
            <span className="text-xs uppercase tracking-widest text-primary/80 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5" /> Partner Submissions
            </span>
          }
        />
      </div>

      {/* Recent Members Section */}
      <div className="dashboard-card border border-border/50 overflow-hidden">
        <div className="p-6 border-b border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserPlus className="w-5 h-5 text-primary opacity-80" strokeWidth={1.5} />
            <h3 className="font-heading text-xl text-foreground">Recent Initiates</h3>
          </div>
          <Link to="/admin/users" className="text-xs uppercase tracking-widest link-warm">
            View All
          </Link>
        </div>

        {users.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">No members found in the database.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/60">
                  <th className="text-left px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70 font-medium">Member</th>
                  <th className="text-left px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70 font-medium hidden sm:table-cell">Contact</th>
                  <th className="text-left px-6 py-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70 font-medium">Clearance</th>
                  <th className="w-12 px-6 py-4"></th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map(u => (
                  <tr key={u.id} className="border-t border-border/30 hover:bg-accent/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">
                          {u.first_name || u.last_name ? `${u.first_name || ''} ${u.last_name || ''}`.trim() : 'Unknown User'}
                        </span>
                        {u.created_at && (
                          <span className="text-xs text-muted-foreground/60 mt-0.5">
                            Joined {new Date(u.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="text-sm text-muted-foreground">{u.email || '—'}</span>
                    </td>
                    <td className="px-6 py-4">
                      {u.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20 text-[10px] uppercase tracking-wider text-primary">
                          <Crown className="w-3 h-3" /> Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/60 border border-border text-[10px] uppercase tracking-wider text-muted-foreground">
                          Member
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/admin/users/${u.id}`}
                        className="inline-flex p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
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