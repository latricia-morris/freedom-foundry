import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function Workbooks() {
  const [workbooks, setWorkbooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.WorkbookDefinition.filter({ status: 'published' }, 'order', 50)
      .then(setWorkbooks)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="font-heading text-3xl lg:text-4xl font-light text-foreground mb-2">
          <span className="molten-text italic">Workbooks</span>
        </h1>
        <p className="text-sm text-muted-foreground">Your strategic pillars. Your transformation. Answer the prompts, save your progress, and assemble AI-ready prompts.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-40 rounded-xl bg-card animate-pulse" />)}
        </div>
      ) : workbooks.length === 0 ? (
        <div className="forged-border rounded-2xl bg-card p-12 text-center">
          <h3 className="font-heading text-xl text-foreground mb-2">Workbooks coming soon</h3>
          <p className="text-sm text-muted-foreground">Check back shortly for premium workbook experiences.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workbooks.map((wb, i) => (
            <Link key={wb.id} to={`/workbooks/${wb.id}`} className="group forged-border rounded-2xl bg-card p-6 transition-all duration-300 hover:ember-glow-strong">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-primary" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] uppercase tracking-widest text-primary">{wb.category}</span>
                  <h3 className="font-heading text-lg text-foreground mt-1 mb-1">{i + 1}. {wb.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{wb.description}</p>
                  <span className="text-xs uppercase tracking-widest text-primary group-hover:text-copper transition-colors flex items-center gap-1 mt-3">Start Workbook <ArrowRight className="w-3.5 h-3.5" /></span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}