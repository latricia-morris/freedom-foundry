import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMembership } from '@/lib/useMembership';

export default function WorkbookProgressCard() {
  const [workbooks, setWorkbooks] = useState([]);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isBpmUnlocked } = useMembership();

  useEffect(() => {
    Promise.all([
      base44.entities.WorkbookDefinition.filter({ status: 'published' }, 'order', 50),
      base44.entities.WorkbookResponse.filter({}).catch(() => []),
    ]).then(([w, r]) => {
      setWorkbooks(w || []);
      setResponses(r || []);
      setLoading(false);
    });
  }, []);

  const responsesByWorkbook = {};
  (responses || []).forEach(r => {
    if (!responsesByWorkbook[r.workbook_id]) responsesByWorkbook[r.workbook_id] = [];
    responsesByWorkbook[r.workbook_id].push(r);
  });

  const totalWorkbooks = workbooks.length;
  const startedWorkbooks = workbooks.filter(w => (responsesByWorkbook[w.id]?.length || 0) > 0).length;
  const progress = totalWorkbooks > 0 ? Math.round((startedWorkbooks / totalWorkbooks) * 100) : 0;
  const nextWorkbook = workbooks.find(w => (responsesByWorkbook[w.id]?.length || 0) === 0);

  if (!isBpmUnlocked) {
    return (
      <div className="dash-editorial-block h-full">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-4 h-4" style={{ stroke: 'url(#warmGradient)' }} strokeWidth={1.5} />
          <h3 className="font-heading text-lg">Brand Power Moves</h3>
        </div>
        <p className="text-sm mb-4" style={{ color: '#6b6b74' }}>
          Unlock all 12 workbooks with your book code or purchase.
        </p>
        <Link to="/workbooks" className="link-warm text-sm">Unlock Now</Link>
      </div>
    );
  }

  return (
    <div className="dash-editorial-block h-full">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4" style={{ stroke: 'url(#warmGradient)' }} strokeWidth={1.5} />
          <h3 className="font-heading text-lg">Brand Power Moves</h3>
        </div>
        <Link to="/workbooks" className="link-warm text-xs uppercase tracking-wider">View All</Link>
      </div>

      {loading ? (
        <div className="h-24 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-[#1a1420]/10 border-t-[#b3232c] rounded-full animate-spin" />
        </div>
      ) : totalWorkbooks === 0 ? (
        <p className="text-sm italic" style={{ color: '#8a8a92' }}>Workbooks coming soon.</p>
      ) : (
        <>
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm" style={{ color: '#2c2c33' }}>Overall Progress</span>
              <span className="text-sm font-medium" style={{ color: '#2c2c33' }}>{progress}%</span>
            </div>
            <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: 'rgba(15,15,26,0.08)' }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${progress}%`, background: 'linear-gradient(131deg, #b3232c 0%, #d9622c 55%, #f0d9b5 100%)' }}
              />
            </div>
          </div>

          {nextWorkbook ? (
            <div className="p-4 rounded-xl border border-black/10 bg-white/50">
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#8a8a92' }}>Next Up</p>
              <p className="font-heading text-base mb-3" style={{ color: '#1a1420' }}>{nextWorkbook.title}</p>
              <Link to={`/workbooks/${nextWorkbook.id}`} className="flex items-center gap-1.5 text-xs uppercase tracking-widest font-semibold" style={{ color: '#b3232c' }}>
                Start <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-black/10 bg-white/50">
              <p className="text-sm" style={{ color: '#2c2c33' }}>All 12 workbooks started. Keep going!</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}