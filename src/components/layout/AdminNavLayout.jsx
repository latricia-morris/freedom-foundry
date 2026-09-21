import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import AdminProjectNav from '@/components/layout/AdminProjectNav';

const NAV_SECTIONS = [
  {
    label: 'Agency OS',
    items: [
      { name: 'Operations', path: '/admin/agency', end: true },
      { name: 'Clients', path: '/admin/agency/clients' },
      { name: 'Visibility Reports', path: '/admin/agency/visibility' },
      { name: 'Digital Brand Health', path: '/admin/brand-health' },
      { name: 'Channel Profiles', path: '/admin/channel-profiles' },
      { name: 'Pipeline', path: '/admin/agency/proposals' },
      { name: 'Client Projects', path: '/admin/agency/projects' },
      { name: 'Templates', path: '/admin/agency/templates' },
      { name: 'Agency Build', path: '/admin/agency/agency-build' },
      { name: 'Financial Overview', path: '/financial-overview' },
      { name: 'Resource Library', path: '/resource-library' },
      { name: 'Audit Logs', path: '/audit-logs' },
    ],
  },
  {
    label: 'Overview',
    items: [{ name: 'Command', path: '/admin', end: true }],
  },
  {
    label: 'Platform',
    items: [
      { name: 'Members', path: '/admin/users' },
      { name: 'Brand Up', path: '/admin/brand-up' },
      { name: 'Services Hub', path: '/admin/services' },
      { name: 'Quiz Leads', path: '/admin/quiz-leads' },
      { name: 'Client Import', path: '/admin/client-import' },
      { name: 'Portal Content', path: '/admin/portal-content' },
      { name: 'Referral Partners', path: '/admin/referral-partners' },
    ],
  },
  {
    label: 'Inbox',
    items: [
      { name: 'Contact Inbox', path: '/admin/contact-inbox' },
      { name: 'Support Queue', path: '/admin/support-reports' },
    ],
  },
];

const COLLAPSE_KEY = 'ff-admin-nav-collapsed';

function SectionNav() {
  return (
    <nav aria-label="Admin pages" className="flex flex-col gap-2">
      {NAV_SECTIONS.map((section, i) => (
        <div key={section.label} className={i > 0 ? 'mt-3 border-t border-border pt-3' : ''}>
          <p className="mb-1 px-3 text-[10px] uppercase tracking-[0.24em] text-muted-foreground/70">{section.label}</p>
          {section.items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center justify-between border-l-2 px-3 py-2 text-sm transition-colors duration-200 ${
                  isActive
                    ? 'border-primary font-medium text-foreground bg-primary/5'
                    : 'border-transparent text-muted-foreground hover:bg-accent hover:text-foreground'
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  );
}

export default function AdminNavLayout() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(() => window.localStorage.getItem(COLLAPSE_KEY) === '1');
  const [mobileOpen, setMobileOpen] = useState(false);
  const inProjectManager = /^\/admin\/agency\/projects\/[^/]+/.test(location.pathname);

  const toggleCollapsed = () =>
    setCollapsed((prev) => {
      window.localStorage.setItem(COLLAPSE_KEY, prev ? '0' : '1');
      return !prev;
    });

  const navBody = inProjectManager ? <AdminProjectNav /> : <SectionNav />;

  const currentLabel = inProjectManager
    ? 'Project Manager'
    : NAV_SECTIONS.flatMap((s) => s.items).find((item) =>
        item.end
          ? location.pathname === item.path
          : location.pathname === item.path || location.pathname.startsWith(`${item.path}/`),
      )?.name || 'Command';

  return (
    <div className="flex min-h-[calc(100vh-10rem)] flex-col gap-6 lg:flex-row lg:gap-8">
      {/* Desktop sidebar */}
      <aside
        className={`hidden flex-shrink-0 flex-col rounded-sm border border-border bg-card/75 p-4 lg:sticky lg:top-28 lg:flex lg:h-fit ${
          collapsed ? 'lg:w-16 items-center' : 'lg:w-60'
        }`}
      >
        {collapsed ? (
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label="Expand admin navigation"
            title="Expand admin navigation"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between px-1">
              <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Admin</p>
              <button
                type="button"
                onClick={toggleCollapsed}
                aria-label="Collapse admin navigation"
                title="Collapse admin navigation"
                className="rounded-sm p-1 text-muted-foreground transition-colors hover:text-foreground"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            </div>
            {navBody}
          </>
        )}
      </aside>

      {/* Mobile selector */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          aria-expanded={mobileOpen}
          className="flex min-h-14 w-full items-center justify-between rounded-xl border border-border bg-card px-4 text-left"
        >
          <span>
            <span className="block text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Admin</span>
            <span className="mt-1 block text-base font-medium text-foreground">{currentLabel}</span>
          </span>
          <ChevronDown className={`h-5 w-5 text-primary transition-transform ${mobileOpen ? 'rotate-180' : ''}`} />
        </button>
        {mobileOpen && (
          <div onClickCapture={() => setMobileOpen(false)} className="mt-2 rounded-xl border border-border bg-card p-2">
            {navBody}
          </div>
        )}
      </div>

      <main className="min-w-0 flex-1 lg:py-2">
        <Outlet />
      </main>
    </div>
  );
}