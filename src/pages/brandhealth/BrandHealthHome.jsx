import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useBrandHealth } from '@/hooks/useBrandHealth';
import { PUBLISHED_STATUS, fmtDate, latestByComponent, reviewStatusLine } from '@/lib/brandHealth';

function auditLine(audit, matrix) {
  if (!audit) return 'Not started';
  return audit.status === PUBLISHED_STATUS
    ? `Complete · Reviewed ${fmtDate(audit.reviewed_date)}`
    : reviewStatusLine(audit, matrix);
}

/**
 * Digital Brand Health main page: three equal cards, one per subpage —
 * Visibility & Credibility, Website Discoverability & Conversion Readiness,
 * and Marketing Matrix. Each card carries its current status lines.
 */
export default function BrandHealthHome() {
  const { data, error } = useBrandHealth();

  if (!data && !error) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="dash-editorial-block">
        <h1 className="font-heading text-3xl font-light">Digital <span className="molten-text italic">Brand Health</span></h1>
        <p className="mt-2 text-sm">The report could not be loaded. Please try again in a moment.</p>
      </div>
    );
  }

  if (!data.client) {
    return (
      <div className="dash-editorial-block">
        <h1 className="font-heading text-3xl font-light">Digital <span className="molten-text italic">Brand Health</span></h1>
        <p className="mt-2 text-sm">
          Digital Brand Health activates once your account is connected to a brand engagement. Your audits will appear here.
        </p>
      </div>
    );
  }

  const latest = latestByComponent(data.audits);

  const cards = [
    {
      title: 'Visibility & Credibility',
      desc: 'How your brand appears across AI search engines, public listings, and trusted sources.',
      path: '/brand-portal/brand-health/visibility',
      lines: ['Composite visibility scorecard with model comparison'],
    },
    {
      title: 'Website Discoverability & Conversion Readiness',
      desc: 'Whether the right people can find your business — and take the next step once they do.',
      path: '/brand-portal/brand-health/website',
      lines: [
        `Discoverability: ${auditLine(latest.website_discoverability)}`,
        `Conversion Readiness: ${auditLine(latest.conversion_readiness)}`,
      ],
    },
    {
      title: 'Marketing Matrix',
      desc: 'Channel fit and customer journey alignment for your growth strategy.',
      path: '/brand-portal/brand-health/marketing-matrix',
      lines: [auditLine(latest.marketing_matrix, true)],
    },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-light text-foreground">Digital <span className="molten-text italic">Brand Health</span></h1>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          A focused view of how your business is found, trusted, understood, and positioned to move the right people toward action.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 lg:items-stretch">
        {cards.map((card) => (
          <Link
            key={card.path}
            to={card.path}
            className="dashboard-card group flex flex-col p-6 transition-colors hover:bg-accent"
          >
            <h3 className="font-heading text-xl text-foreground">{card.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{card.desc}</p>
            <div className="mt-auto flex flex-col gap-1 border-t border-border/40 pt-4">
              {card.lines.map((line, i) => (
                <p key={i} className="text-xs text-muted-foreground">{line}</p>
              ))}
              <span className="link-warm mt-2 inline-flex items-center gap-1">
                Open <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}