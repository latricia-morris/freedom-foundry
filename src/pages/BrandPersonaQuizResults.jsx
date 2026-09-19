import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { LoaderCircle, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import apiClient from '@/api/client';
import { ARCHETYPES, MAX_QUIZ_POINTS } from '@/lib/archetypeData';

export default function BrandPersonaQuizResults() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const [claiming, setClaiming] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (isLoadingAuth) return;
    
    // If authenticated, automatically claim the result
    if (isAuthenticated) {
      if (token) {
        setClaiming(true);
        apiClient.quiz.claimAttempt(token)
          .then(res => {
            setResult(res.result || res);
            navigate('/brand-persona-quiz/results', { replace: true });
          })
          .catch(err => {
            setError(err.message || 'This result could not be claimed. Confirm that you signed in with the same email used for the quiz.');
          })
          .finally(() => {
            setClaiming(false);
            fetchHistory();
          });
      } else {
        // No token, just fetch latest for the user
        fetchLatest();
        fetchHistory();
      }
    }
  }, [isAuthenticated, isLoadingAuth, token]);

  const fetchLatest = () => {
    setClaiming(true);
    apiClient.quiz.getLatest()
      .then(res => setResult(res))
      .catch(() => setError('No results found. Please take the quiz first.'))
      .finally(() => setClaiming(false));
  };

  const fetchHistory = () => {
    apiClient.quiz.getHistory()
      .then(res => setHistory(res || []))
      .catch(console.error);
  };

  const emailParam = searchParams.get('email') || '';

  if (isLoadingAuth || claiming) {
    return (
      <div className="min-h-[100dvh] bg-[#100e0c] flex flex-col items-center justify-center">
        <LoaderCircle className="w-10 h-10 animate-spin text-[#d9622c] mb-6" />
        <p className="text-white/50 text-sm uppercase tracking-widest animate-pulse">Analyzing your brand DNA...</p>
      </div>
    );
  }

  // If not signed in, show the gate page
  if (!isAuthenticated) {
    return (
      <div className="min-h-[100dvh] bg-[#100e0c] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute top-1/4 left-1/4 w-[50%] h-[50%] rounded-full bg-[#d9622c]/10 blur-[120px]" />
        </div>
        
        <div className="w-full max-w-md bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl p-10 text-center relative z-10 shadow-[0_24px_90px_rgba(0,0,0,0.55)]">
          <div className="mx-auto w-16 h-16 rounded-full border border-white/10 bg-white/5 flex items-center justify-center mb-6">
            <Lock className="w-8 h-8 text-[#f0d9b5]" />
          </div>
          
          <h1 className="font-heading text-3xl font-light text-[#f7f2ea] mb-3">Claim Your Results</h1>
          <p className="text-sm text-white/60 mb-8 leading-relaxed">
            Your brand persona analysis is ready. Create a free account to securely view and save your complete archetype breakdown.
          </p>
          
          <Link 
            to={`/register?returnTo=${encodeURIComponent(`/brand-persona-quiz/results${token ? `?token=${token}` : ''}`)}${emailParam ? `&email=${encodeURIComponent(emailParam)}` : ''}`}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#9f1f28] via-[#d9622c] to-[#e6c695] font-semibold tracking-wide text-white transition hover:brightness-110 mb-4"
          >
            Create Free Account
          </Link>
          <p className="text-xs text-white/40">
            Already have an account? <Link to={`/login?returnTo=${encodeURIComponent(`/brand-persona-quiz/results${token ? `?token=${token}` : ''}`)}${emailParam ? `&email=${encodeURIComponent(emailParam)}` : ''}`} className="text-[#f0d9b5] hover:text-white transition">Sign in</Link>
          </p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-[100dvh] bg-[#100e0c] flex flex-col items-center justify-center p-6 text-center">
        <div className="mx-auto w-16 h-16 rounded-full border border-red-500/30 bg-red-500/10 flex items-center justify-center mb-6">
          <Lock className="w-8 h-8 text-red-400" />
        </div>
        <h1 className="font-heading text-3xl text-white mb-4">{error || 'Result not found'}</h1>
        <Link to="/brand-persona-quiz" className="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition">
          Take the Quiz
        </Link>
      </div>
    );
  }

  // Render the actual result
  return (
    <div className="min-h-[100dvh] bg-[#100e0c] py-20 px-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
         <div className="absolute -top-20 left-1/4 w-[600px] h-[600px] rounded-full bg-[#d9622c] blur-[150px]" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="mb-12 text-center select-none" onCopy={(e) => e.preventDefault()}>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#d9622c]/30 bg-[#d9622c]/10 text-xs uppercase tracking-widest text-[#f0d9b5] mb-6">
            <ShieldCheck className="w-4 h-4" /> Authenticated Result
          </span>
          <p className="font-heading text-[30px] leading-none font-light text-white/70 whitespace-nowrap">Your brand's archetype is:</p>
          <h1 className="mt-3 font-heading text-6xl md:text-7xl font-light italic bg-clip-text text-transparent bg-gradient-to-r from-[#e6c695] to-[#d9622c]">
            {result.primaryArchetype || 'Visionary'}
          </h1>
          <p className="mt-4 text-lg text-white/60 max-w-2xl mx-auto">
            Your dominant brand archetype has been calculated based on your responses.
          </p>
        </div>

        {[
          { name: result.primaryArchetype, score: result.primaryScore, role: 'Primary' },
          { name: result.secondaryArchetype, score: result.secondaryScore, role: 'Secondary' },
        ].filter(a => a.name).map(({ name, score, role }) => {
          const data = ARCHETYPES[name];
          const pct = Math.round(((score ?? 0) / MAX_QUIZ_POINTS) * 100);
          return (
            <div key={name} className="bg-black/40 border border-white/10 rounded-3xl p-8 mb-6 select-none" onCopy={(e) => e.preventDefault()}>
              <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
                <p className="text-[10px] uppercase tracking-widest text-[#d9622c]">{role} Archetype</p>
                <p className="text-sm text-white/40 tabular-nums">{score} points · {pct}%</p>
              </div>
              <h3 className="font-heading text-2xl text-[#f7f2ea] mb-1">The {name}{data ? <span className="ml-3 font-body text-xs uppercase tracking-widest text-white/30 align-middle">{data.heart}</span> : null}</h3>
              {data && (
                <>
                  <p className="text-sm italic text-white/50 mb-3">{data.slogan}</p>
                  <p className="text-sm text-white/70 leading-relaxed mb-3">{data.description}</p>
                  <p className="text-xs text-white/40">Sample brands: {data.brands.join(', ')}</p>
                </>
              )}
            </div>
          );
        })}

        <div className="bg-gradient-to-b from-[#3a2119] to-black/60 border border-[#d9622c]/20 rounded-3xl p-8 mb-6">
          <h3 className="font-heading text-xl text-[#f7f2ea] mb-2">Next Steps</h3>
          <p className="text-sm text-white/60">Now that you know your archetype, integrate it into your Brand Portal.</p>
          <Link to="/brand-portal" className="mt-5 flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition group w-full sm:w-auto sm:max-w-xs">
            <span className="text-sm text-white font-medium">Go to Brand Portal</span>
            <ArrowRight className="w-4 h-4 text-[#d9622c] group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <p className="text-center text-xs text-white/30 mb-10">Completed {new Date(result.createdAt).toLocaleDateString()}</p>

        {history.length > 1 && (
          <div className="mt-12">
            <h3 className="font-heading text-2xl text-[#f7f2ea] mb-6 text-center">Your Past Assessments</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {history.map((h, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <div className="text-xs text-white/40 mb-3">{new Date(h.createdAt).toLocaleDateString()}</div>
                  <div className="text-lg text-[#f0d9b5] mb-1">{h.primaryArchetype} ({h.primaryScore} points)</div>
                  {h.secondaryArchetype && (
                    <div className="text-sm text-white/60">Secondary: {h.secondaryArchetype} ({h.secondaryScore} points)</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}