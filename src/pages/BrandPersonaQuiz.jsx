import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { ArrowLeft, ArrowRight, LoaderCircle, CheckCircle2 } from 'lucide-react';
import apiClient from '@/api/client';
import { useToast } from '@/components/ui/use-toast';

const QUIZ_SECTIONS = [
  { label: 'Core Drivers', shortLabel: 'Drivers', start: 0, end: 7 },
  { label: 'Behavior & Strategy', shortLabel: 'Strategy', start: 7, end: 14 },
  { label: 'Personality Nuances', shortLabel: 'Nuance', start: 14, end: 18 },
];

function getSectionIndex(step) {
  const sectionIndex = QUIZ_SECTIONS.findIndex(
    (section) => step >= section.start && step < section.end,
  );
  return sectionIndex === -1 ? QUIZ_SECTIONS.length - 1 : sectionIndex;
}

export default function BrandPersonaQuiz() {
  const [definition, setDefinition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [currentStep, setCurrentStep] = useState(0); // 0 to definition.questions.length
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [brandView, setBrandView] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const basePath = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';

  useEffect(() => {
    apiClient.quiz.getDefinition()
      .then(res => {
        if (!res || !res.questions) throw new Error('Invalid definition');
        setDefinition(res);
      })
      .catch((err) => {
        toast({ title: 'Error', description: 'Failed to load quiz definition.', variant: 'destructive' });
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    setFirstName((user.full_name || '').split(' ')[0] || '');
    setEmail(user.email ?? '');
  }, [isAuthenticated, user]);

  const totalQuestions = definition?.questions?.length || 0;
  const isGate = currentStep === totalQuestions;
  const activeSectionIndex = isGate ? QUIZ_SECTIONS.length - 1 : getSectionIndex(currentStep);
  const activeSection = QUIZ_SECTIONS[activeSectionIndex];

  const handleSelectOption = (questionId, optionIndex) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
    setTimeout(() => {
      setCurrentStep(s => Math.min(totalQuestions, s + 1));
      setIsTransitioning(false);
    }, 300);
  };

  const handleBack = () => {
    setCurrentStep(s => Math.max(0, s - 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!marketingConsent) {
      toast({
        title: 'Consent required',
        description: 'Please opt in so we can deliver your report and selected brand insights.',
        variant: 'destructive',
      });
      return;
    }
    if (!firstName.trim() || !email.trim()) {
      toast({
        title: 'Contact details required',
        description: 'Please enter your first name and email to see your results.',
        variant: 'destructive',
      });
      return;
    }
    
    // Safety check: ensure all questions are answered
    if (Object.keys(answers).length < totalQuestions) {
      toast({ title: 'Incomplete', description: 'Please answer all questions before submitting.', variant: 'destructive' });
      setCurrentStep(0); // Let them review
      return;
    }

    // Sort question keys numerically or rely on definition order
    const answerArray = definition.questions.map(q => answers[q.id]);
    if (answerArray.some(a => a === undefined)) {
      toast({ title: 'Incomplete', description: 'Please answer all questions before submitting.', variant: 'destructive' });
      setCurrentStep(0);
      return;
    }

    setSubmitting(true);
    try {
      const response = await apiClient.quiz.submitAttempt({
        firstName: firstName.trim(),
        email: email.trim(),
        answers: answerArray,
        marketingConsent,
        brandView: brandView || 'personal',
      });
      
      if (isAuthenticated) {
        // Results are ready, navigate directly without a token (or with the token if it exists)
        navigate(`/brand-persona-quiz/results`);
      } else {
        const token = response?.token;
        if (!token) throw new Error('Missing claim token in response');
        navigate(`/brand-persona-quiz/results?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email.trim())}`);
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to submit quiz. Please try again.',
        variant: 'destructive'
      });
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#100e0c] flex items-center justify-center">
        <LoaderCircle className="w-8 h-8 animate-spin text-[#d9622c]" />
      </div>
    );
  }

  const currentQuestion = !isGate ? definition.questions[currentStep] : null;

  if (!brandView) {
    const options = [
      { value: 'personal', label: 'Personal Brand', desc: "I'm answering for my personal brand — my name, my voice, my identity." },
      { value: 'corporate', label: 'Corporate Brand', desc: "I'm answering for my company or business brand." },
      { value: 'one_and_the_same', label: 'One in the Same', desc: 'My personal brand and my business brand are the same thing.' },
    ];
    return (
      <div className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-[#100e0c] px-4 py-10 font-sans">
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#d9622c]/10 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#9f1f28]/10 blur-[100px]" />
        </div>
        <div className="relative z-10 w-full max-w-xl text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#d9622c]">Before we begin</p>
          <h1 className="mt-3 font-heading text-3xl font-light leading-tight text-[#f7f2ea] sm:text-4xl">
            Will you be answering this quiz from the view of your <span className="italic">personal</span> or <span className="italic">corporate</span> brand?
          </h1>
          <div className="mt-8 space-y-3">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setBrandView(opt.value)}
                className="group flex w-full items-center justify-between gap-3 rounded-xl border border-white/[0.1] bg-white/[0.035] px-5 py-4 text-left transition-all hover:border-[#d9622c]/60 hover:bg-white/[0.075]"
              >
                <span>
                  <span className="block text-base font-semibold text-white/90">{opt.label}</span>
                  <span className="mt-0.5 block text-sm text-white/50">{opt.desc}</span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-[#d9622c] opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-[100dvh] min-h-0 flex-col overflow-hidden bg-[#100e0c] font-sans">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#d9622c]/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#9f1f28]/10 blur-[100px]" />
      </div>

      <header className="relative z-10 shrink-0 border-b border-white/[0.08]">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-8 sm:py-4">
          <div className="flex min-w-0 items-center gap-3">
            <img src={`${basePath}/forge-logo.png`} alt="Freedom Foundry" className="h-8 w-8 shrink-0 rounded-lg shadow-[0_0_12px_rgba(217,98,44,0.3)] sm:h-9 sm:w-9" />
            <div className="min-w-0">
              <p className="truncate font-heading text-sm tracking-[0.14em] text-[#f7f2ea] uppercase sm:text-base">Brand Persona Discovery</p>
              <p className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-[#d9622c]">Freedom Foundry</p>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/45">{isGate ? 'Results gate' : `Question ${currentStep + 1} of ${totalQuestions}`}</p>
            <p className="mt-1 text-xs text-[#f0d9b5]">{isGate ? 'Ready to reveal' : `Part ${activeSectionIndex + 1} of ${QUIZ_SECTIONS.length}`}</p>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex min-h-0 flex-1 items-center justify-center px-3 py-3 sm:px-6 sm:py-5">
        <div className="flex h-full max-h-[780px] w-full max-w-5xl flex-col gap-3 sm:gap-4">
          <section className="shrink-0 rounded-2xl border border-white/[0.1] bg-[#1a1412]/90 px-4 py-3 shadow-[0_14px_50px_rgba(0,0,0,0.28)] backdrop-blur sm:px-6 sm:py-4" aria-label="Quiz progress">
            <div className="mb-3 flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#d9622c]">Your brand profile</p>
                <p className="mt-1 font-heading text-xl leading-none text-[#f7f2ea] sm:text-2xl">{isGate ? 'All three parts complete' : activeSection.label}</p>
              </div>
              <p className="text-right text-xs text-white/45">{isGate ? '18 of 18 answered' : `${currentStep} of ${totalQuestions} answered`}</p>
            </div>
            <div className="grid grid-cols-3 gap-2.5" role="list" aria-label="Three-part quiz progress">
              {QUIZ_SECTIONS.map((section, index) => {
                const sectionLength = section.end - section.start;
                const answeredInSection = isGate
                  ? sectionLength
                  : Math.min(sectionLength, Math.max(0, currentStep - section.start));
                const fillPercent = (answeredInSection / sectionLength) * 100;
                const isComplete = fillPercent === 100;
                const isCurrent = !isGate && index === activeSectionIndex;
                return (
                  <div key={section.label} role="listitem" aria-current={isCurrent ? 'step' : undefined}>
                    <div
                      className={`relative h-2 overflow-hidden rounded-full border transition-all duration-300 ${isCurrent ? 'border-[#d9622c]/70 bg-[#d9622c]/15 shadow-[0_0_14px_rgba(217,98,44,0.25)]' : isComplete ? 'border-[#f0d9b5]/70 bg-[#f0d9b5]/10' : 'border-white/15 bg-white/[0.06]'}`}
                      role="progressbar"
                      aria-label={`${section.label} progress`}
                      aria-valuemin={0}
                      aria-valuemax={sectionLength}
                      aria-valuenow={answeredInSection}
                    >
                      <span
                        className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#9f1f28] via-[#d9622c] to-[#f0d9b5] transition-[width] duration-300 ease-out"
                        style={{ width: `${fillPercent}%` }}
                      />
                    </div>
                    <p className={`mt-1.5 truncate text-[10px] uppercase tracking-[0.12em] ${isComplete || isCurrent ? 'text-[#f0d9b5]' : 'text-white/35'}`}>
                      {index + 1}. {section.shortLabel}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.5rem] border border-white/[0.12] bg-gradient-to-br from-[#241916] via-[#15100f] to-[#0e0b0a] shadow-[0_22px_80px_rgba(0,0,0,0.45)]">
            {!isGate && currentQuestion ? (
              <div key={currentQuestion.id} className="flex min-h-0 flex-1 flex-col animate-in slide-in-from-right-4 fade-in duration-500">
                <div className="shrink-0 px-4 pb-3 pt-4 sm:px-8 sm:pb-4 sm:pt-6">
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#d9622c]">{String(currentQuestion.id).padStart(2, '0')} / 18</span>
                    <span className="text-[10px] uppercase tracking-[0.16em] text-white/35">{activeSection.label}</span>
                  </div>
                  <h2 className="max-w-4xl font-heading text-2xl font-light leading-[1.05] text-[#f7f2ea] sm:text-4xl lg:text-[2.8rem]">{currentQuestion.text}</h2>
                </div>

                <div className="grid min-h-0 flex-1 auto-rows-min grid-cols-1 content-start gap-2.5 overflow-y-auto px-4 pb-3 sm:grid-cols-2 sm:gap-3 sm:px-8 sm:pb-4">
                  {currentQuestion.answers.map((answer, optionIndex) => {
                    const isSelected = answers[currentQuestion.id] === optionIndex;
                    return (
                      <button
                        key={optionIndex}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => handleSelectOption(currentQuestion.id, optionIndex)}
                         className={`group flex min-h-[4.25rem] items-center justify-between gap-3 rounded-lg border px-3.5 py-3 text-left transition-all duration-300 sm:min-h-[4.5rem] sm:rounded-xl sm:px-4 ${isSelected ? 'border-[#d9622c] bg-gradient-to-r from-[#6e2522]/75 to-[#d9622c]/10 shadow-[0_0_24px_rgba(217,98,44,0.16)]' : 'border-white/[0.1] bg-white/[0.035] hover:border-[#d9622c]/60 hover:bg-white/[0.075] hover:shadow-[0_8px_20px_rgba(0,0,0,0.2)]'}`}
                      >
                        <span className="flex min-w-0 items-start gap-2.5">
                           <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold ${isSelected ? 'border-[#f0d9b5] bg-[#f0d9b5] text-[#331512]' : 'border-white/20 text-white/45 group-hover:border-[#d9622c] group-hover:text-[#f0d9b5]'}`}>{optionIndex + 1}</span>
                           <span className={`text-sm leading-snug sm:text-[15px] ${isSelected ? 'text-[#fff0d3]' : 'text-white/75 group-hover:text-white'}`}>{answer.text}</span>
                        </span>
                        {isSelected && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#f0d9b5] sm:h-5 sm:w-5" />}
                      </button>
                    );
                  })}
                </div>

                <div className="flex shrink-0 items-center justify-between gap-3 border-t border-white/[0.1] px-4 py-3 sm:px-8 sm:py-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={submitting || isTransitioning || currentStep === 0}
                    className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/[0.14] bg-white/[0.04] px-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#f0d9b5] transition hover:border-[#d9622c] hover:bg-[#d9622c]/10 disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <p className="hidden text-xs text-white/35 sm:block">Choose one answer to continue</p>
                  <span className="text-[10px] uppercase tracking-[0.14em] text-white/35 sm:hidden">{currentStep + 1} / {totalQuestions}</span>
                </div>
              </div>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-5 sm:px-8">
                <div className="w-full max-w-xl animate-in slide-in-from-bottom-4 fade-in duration-700">
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-[#d9622c]/40 bg-[#d9622c]/15 shadow-[0_0_28px_rgba(217,98,44,0.18)] sm:mb-4 sm:h-14 sm:w-14">
                      <CheckCircle2 className="h-6 w-6 text-[#f0d9b5] sm:h-7 sm:w-7" />
                    </div>
                     <h2 className="font-heading text-3xl font-light text-[#f7f2ea] sm:text-4xl">Your profile is ready.</h2>
                    <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-white/60 sm:mt-3">
                       Enter your name and email below to unlock your comprehensive brand persona archetype and discover how to wield it.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="mt-5 space-y-4 sm:mt-6 sm:space-y-5">
                     <div className="grid gap-4 sm:grid-cols-2">
                       <div>
                         <label className="mb-1.5 block text-[11px] uppercase tracking-[0.16em] text-white/55" htmlFor="quiz-first-name">First name</label>
                         <input
                           id="quiz-first-name"
                           type="text"
                           required
                           autoComplete="given-name"
                           minLength={1}
                           maxLength={100}
                           value={firstName}
                           onChange={e => setFirstName(e.target.value)}
                           placeholder="Enter your first name"
                           className="h-12 w-full rounded-xl border border-white/[0.12] bg-black/40 px-4 text-[#f7f2ea] outline-none transition placeholder:text-white/30 focus:border-[#d9622c]/70 focus:ring-2 focus:ring-[#d9622c]/20 sm:h-14 sm:px-5"
                         />
                       </div>
                       <div>
                         <label className="mb-1.5 block text-[11px] uppercase tracking-[0.16em] text-white/55" htmlFor="quiz-email">Email address</label>
                         <input
                           id="quiz-email"
                           type="email"
                           required
                           autoComplete="email"
                           value={email}
                           onChange={e => setEmail(e.target.value)}
                           placeholder="Enter your email"
                           readOnly={isAuthenticated}
                           className={`h-12 w-full rounded-xl border border-white/[0.12] bg-black/40 px-4 text-[#f7f2ea] outline-none transition placeholder:text-white/30 focus:border-[#d9622c]/70 focus:ring-2 focus:ring-[#d9622c]/20 sm:h-14 sm:px-5 ${isAuthenticated ? 'cursor-not-allowed opacity-75' : ''}`}
                         />
                         {isAuthenticated && <p className="mt-1.5 text-[11px] text-white/40">Using your verified account email.</p>}
                       </div>
                     </div>

                    <div className="flex items-start gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 text-left sm:p-4">
                      <input
                        type="checkbox"
                        id="marketingConsent"
                        required
                        checked={marketingConsent}
                        onChange={(e) => setMarketingConsent(e.target.checked)}
                        className="mt-1 h-4 w-4 shrink-0 accent-[#d9622c]"
                      />
                      <label htmlFor="marketingConsent" className="cursor-pointer select-none text-xs leading-relaxed text-white/70 sm:text-sm">
                        I agree to receive my Brand Persona report and occasional selected insights, resources, and services to help me leverage my brand. I can unsubscribe at any time.
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-forge flex h-12 w-full items-center justify-center gap-2 rounded-xl font-semibold tracking-wide shadow-[0_10px_26px_rgba(217,98,44,0.2)] transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-70 sm:h-14"
                    >
                      {submitting ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <>Reveal My Persona <ArrowRight className="h-5 w-5" /></>}
                    </button>
                  </form>
                  <div className="mt-3 flex items-center justify-between gap-3 sm:mt-4">
                    <button
                      type="button"
                      onClick={handleBack}
                      disabled={submitting}
                      className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/[0.14] bg-white/[0.04] px-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#f0d9b5] transition hover:border-[#d9622c] hover:bg-[#d9622c]/10 disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      <ArrowLeft className="h-4 w-4" /> Back
                    </button>
                    <p className="text-right text-[11px] text-white/35">Your results will be delivered securely.</p>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}