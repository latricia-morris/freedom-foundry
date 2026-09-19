import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageSquare } from 'lucide-react';

export default function ServicesCta() {
  return (
    <section
      id="next-move"
      aria-labelledby="services-cta-title"
      className="dashboard-card border border-border p-8 sm:p-12 text-center relative overflow-hidden"
    >
      <div className="absolute left-1/2 -top-24 -translate-x-1/2 w-96 h-56 ember-glow-bg pointer-events-none" aria-hidden="true" />
      <h2 id="services-cta-title" className="font-heading text-3xl sm:text-4xl font-light text-foreground relative">
        Determine the <span className="molten-text italic font-medium">next move.</span>
      </h2>
      <p className="text-base text-muted-foreground leading-relaxed max-w-xl mx-auto mt-4 relative">
        If you know what is broken, say so and we will scope it. If you do not, a short conversation
        will identify it — and you will leave it knowing whether you need us. Either way, you get a straight answer.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8 relative">
        <Link
          to="/contact"
          className="btn-forge inline-flex items-center gap-2 rounded-md px-7 py-3 text-xs uppercase tracking-widest"
        >
          <MessageSquare className="w-4 h-4" /> Start a Conversation
        </Link>
        <Link
          to="/portfolio"
          data-testid="link-services-portfolio"
          className="inline-flex items-center gap-2 rounded-md border border-border px-7 py-3 text-xs uppercase tracking-widest text-foreground hover:bg-accent/50 transition-colors"
        >
          See the Portfolio <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}