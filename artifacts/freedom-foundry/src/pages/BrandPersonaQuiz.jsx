import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/react';
import { ArrowRight, ChevronLeft, LoaderCircle, CheckCircle2 } from 'lucide-react';
import apiClient from '@/api/client';
import { useToast } from '@/components/ui/use-toast';


export default function BrandPersonaQuiz() {
  const [definition, setDefinition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [currentStep, setCurrentStep] = useState(0); // 0 to definition.questions.length
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isSignedIn } = useUser();
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

  const totalQuestions = definition?.questions?.length || 0;
  const isGate = currentStep === totalQuestions;
  const progress = isGate ? 100 : (currentStep / totalQuestions) * 100;

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
    if (!isSignedIn && !email.trim()) {
      toast({ title: 'Email required', description: 'Please enter your email to see your results.', variant: 'destructive' });
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
        ...(isSignedIn ? {} : { email: email.trim() }),
        answers: answerArray,
        marketingConsent,
      });
      
      if (isSignedIn) {
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

  return (
    <div className="min-h-[100dvh] bg-[#100e0c] flex flex-col font-sans relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#d9622c]/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#9f1f28]/10 blur-[100px]" />
      </div>

      {/* Header with progress */}
      <header className="relative z-10 w-full max-w-3xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={`${basePath}/forge-logo.png`} alt="Freedom Foundry" className="w-8 h-8 rounded-lg shadow-[0_0_12px_rgba(217,98,44,0.3)]" />
          <span className="font-heading text-sm text-[#f7f2ea] tracking-wider uppercase">Brand Persona Discovery</span>
        </div>
        <div className="text-xs uppercase tracking-[0.2em] text-white/40">
          {isGate ? 'Final Step' : `${currentStep + 1} / ${totalQuestions}`}
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full max-w-3xl mx-auto h-0.5 bg-white/5 relative z-10">
        <div 
          className="h-full bg-gradient-to-r from-[#d9622c] to-[#e6c695] transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 px-6 py-12">
        <div className="w-full max-w-2xl animate-fade-in relative">
          
          {currentStep > 0 && (
            <button 
              onClick={handleBack}
              disabled={submitting}
              className="absolute -top-16 left-0 flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-white/40 hover:text-white/80 transition-colors disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          )}

          {!isGate && currentQuestion ? (
            <div key={currentQuestion.id} className="animate-in slide-in-from-right-4 fade-in duration-500">
              <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-light text-[#f7f2ea] mb-10 leading-tight">
                {currentQuestion.text}
              </h2>
              
              <div className="space-y-4">
                {currentQuestion.answers.map((answer, optionIndex) => {
                  const isSelected = answers[currentQuestion.id] === optionIndex;
                  return (
                    <button
                      key={optionIndex}
                      onClick={() => handleSelectOption(currentQuestion.id, optionIndex)}
                      className={`w-full text-left p-6 rounded-2xl border transition-all duration-300 flex items-center justify-between group
                        ${isSelected 
                          ? 'border-[#d9622c] bg-[#d9622c]/10 shadow-[0_0_20px_rgba(217,98,44,0.15)]' 
                          : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20'
                        }`}
                    >
                      <span className={`text-lg ${isSelected ? 'text-[#f0d9b5]' : 'text-white/80 group-hover:text-white'}`}>
                        {answer.text}
                      </span>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-[#d9622c]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="animate-in slide-in-from-bottom-4 fade-in duration-700 text-center max-w-md mx-auto">
              <div className="mx-auto w-16 h-16 rounded-full border border-[#d9622c]/30 bg-[#d9622c]/10 flex items-center justify-center mb-6">
                <CheckCircle2 className="w-8 h-8 text-[#f0d9b5]" />
              </div>
              <h2 className="font-heading text-4xl font-light text-[#f7f2ea] mb-4">
                Your profile is ready.
              </h2>
              <p className="text-sm text-white/60 mb-10 leading-relaxed">
                Enter your email below to unlock your comprehensive brand persona archetype and discover how to wield it.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {!isSignedIn && (
                  <div className="text-left">
                    <label className="block text-[11px] uppercase tracking-[0.16em] text-white/55 mb-2">
                      Email address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="h-14 w-full rounded-xl border border-white/[0.12] bg-black/40 px-5 text-[#f7f2ea] outline-none transition placeholder:text-white/30 focus:border-[#d9622c]/70 focus:ring-2 focus:ring-[#d9622c]/20"
                    />
                  </div>
                )}
                
                <div className="flex items-start gap-3 text-left">
                  <input
                    type="checkbox"
                    id="marketingConsent"
                    checked={marketingConsent}
                    onChange={(e) => setMarketingConsent(e.target.checked)}
                    className="mt-1 flex-shrink-0"
                  />
                  <label htmlFor="marketingConsent" className="text-sm text-white/60 leading-relaxed cursor-pointer select-none">
                    Yes, keep me updated on future resources, guides, and services from Freedom Foundry.
                  </label>
                </div>
                
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#9f1f28] via-[#d9622c] to-[#e6c695] font-semibold tracking-wide text-white transition hover:brightness-110 disabled:cursor-wait disabled:opacity-70"
                >
                  {submitting ? (
                    <LoaderCircle className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Reveal My Persona <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
              <p className="mt-6 text-xs text-white/40">
                Your results will be delivered securely.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
