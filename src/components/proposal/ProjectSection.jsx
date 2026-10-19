import React from 'react';
import { SCOPE_GROUPS } from '@/lib/proposalAgencyClient';

/**
 * Your Project: context, goals, scope modules grouped under their optional
 * group headings (empty groups hidden), responsibilities, and exclusions.
 * Deliverables and revision allowances stay inside their module.
 */
export default function ProjectSection({ proposal }) {
  const project = proposal.content?.project || {};
  const modules = project.modules || [];
  const grouped = SCOPE_GROUPS.map((group) => ({
    group,
    mods: modules.filter((m) => (m.group || '') === group),
  })).filter((g) => g.mods.length);
  const ungrouped = modules.filter((m) => !SCOPE_GROUPS.includes(m.group || ''));
  const responsibilities = modules.flatMap((m) => m.client_responsibilities || []);
  const exclusions = [...(project.not_included || []), ...modules.flatMap((m) => m.exclusions || [])];

  const ModuleCard = ({ m }) => (
    <div className="dashboard-card p-6">
      <h4 className="font-heading text-xl text-foreground">{m.name}</h4>
      {m.objective ? <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{m.objective}</p> : null}
      {m.deliverables?.length ? (
        <div className="mt-4">
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Deliverables</p>
          <ul className="mt-1.5 list-inside list-disc space-y-1 text-sm leading-relaxed text-muted-foreground">
            {m.deliverables.map((d, i) => <li key={`${d}-${i}`}>{d}</li>)}
          </ul>
        </div>
      ) : null}
      {m.quantity_note ? <p className="mt-3 text-sm text-muted-foreground">Quantities: {m.quantity_note}</p> : null}
      {m.revision_allowance ? <p className="mt-1 text-sm text-muted-foreground">Revisions: {m.revision_allowance}</p> : null}
      {m.dependencies?.length ? <p className="mt-1 text-sm text-muted-foreground">Depends on: {m.dependencies.join('; ')}</p> : null}
    </div>
  );

  return (
    <section id="project" className="scroll-mt-24 space-y-10">
      <div>
        <p className="text-warm text-[11px] font-semibold uppercase tracking-[0.16em]">Your Project</p>
        <h2 className="mt-1 font-heading text-3xl font-light text-foreground sm:text-4xl">{project.heading}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{project.intro}</p>
      </div>

      {project.context ? (
        <div>
          <h3 className="font-heading text-2xl font-light text-foreground">Where things stand.</h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{project.context}</p>
        </div>
      ) : null}

      {project.goals?.length ? (
        <div>
          <h3 className="font-heading text-2xl font-light text-foreground">What we are working toward.</h3>
          <ul className="mt-2 max-w-2xl list-inside list-disc space-y-1 text-sm leading-relaxed text-muted-foreground">
            {project.goals.map((g, i) => <li key={`${g}-${i}`}>{g}</li>)}
          </ul>
        </div>
      ) : null}

      <div className="space-y-6">
        <h3 className="font-heading text-2xl font-light text-foreground">Recommended scope.</h3>
        {grouped.map(({ group, mods }) => (
          <div key={group} className="space-y-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{group}</p>
            {mods.map((m) => <ModuleCard key={m.name} m={m} />)}
          </div>
        ))}
        {ungrouped.length ? ungrouped.map((m) => <ModuleCard key={m.name} m={m} />) : null}
        {!modules.length ? <p className="text-sm text-muted-foreground">Scope modules are being finalized for this proposal.</p> : null}
        <p className="border-t border-border/60 pt-4 text-sm text-muted-foreground">{project.footer}</p>
      </div>

      {responsibilities.length ? (
        <div>
          <h3 className="font-heading text-2xl font-light text-foreground">What we will need from you.</h3>
          <ul className="mt-2 max-w-2xl list-inside list-disc space-y-1 text-sm leading-relaxed text-muted-foreground">
            {[...new Set(responsibilities)].map((r, i) => <li key={`${r}-${i}`}>{r}</li>)}
          </ul>
        </div>
      ) : null}

      {exclusions.length ? (
        <div>
          <h3 className="font-heading text-2xl font-light text-foreground">Not included.</h3>
          <ul className="mt-2 max-w-2xl list-inside list-disc space-y-1 text-sm leading-relaxed text-muted-foreground">
            {[...new Set(exclusions)].map((x, i) => <li key={`${x}-${i}`}>{x}</li>)}
          </ul>
        </div>
      ) : null}
    </section>
  );
}