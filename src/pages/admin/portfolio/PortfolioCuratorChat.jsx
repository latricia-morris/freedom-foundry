import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AgentChat from '@/components/agents/AgentChat';

const HINT =
  'Start a curation draft, name the project, and tell the Curator which uploaded batch to organize. It returns a draft with suggested groups, classifications, ordering, and a hero recommendation — and writes only to suggested fields.';

/** Admin workspace for the Freedom Foundry Portfolio Curator agent. */
export default function PortfolioCuratorChat() {
  return (
    <div className="animate-fade-in">
      <Link
        to="/admin/portfolio"
        className="mb-4 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Portfolio Manager
      </Link>
      <div className="mb-6">
        <h1 className="font-heading text-4xl font-light text-foreground">
          Portfolio <span className="molten-text italic">Curator</span>
        </h1>
        <p className="mt-2 max-w-3xl leading-relaxed text-muted-foreground">
          Turn a folder of uploaded project assets into a structured case-study draft. The Curator reads your
          projects, assets, and groups, and suggests classification, grouping, pairing, ordering, and a hero —
          never publishing, never deleting, and never overwriting anything you have already approved or locked.
        </p>
      </div>
      <AgentChat agentName="portfolio_curator" emptyHint={HINT} />
    </div>
  );
}