import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  ChevronDown,
  Clock3,
  Compass,
  FileText,
  Heart,
  LifeBuoy,
  Loader2,
  MessageCircle,
  RefreshCw,
  Send,
  Sparkles,
  Wrench,
  X,
} from 'lucide-react';
import apiClient from '@/api/client';

const CATEGORY_DEFAULTS = [
  {
    category_key: 'strategy-branding',
    title: 'Strategy & Brand',
    shortTitle: 'Strategy + brand',
    description: 'Find the sharpest story, position, and point of view for what you are building.',
    prompt: 'When the foundation needs a clearer point of view.',
    offerings: ['Positioning', 'Messaging', 'Identity systems'],
    icon: Compass,
  },
  {
    category_key: 'website-digital',
    title: 'Website & Digital',
    shortTitle: 'Website + digital',
    description: 'Turn a clearer brand into a digital home that earns attention and makes the next step obvious.',
    prompt: 'When your digital front door is not pulling its weight.',
    offerings: ['Web strategy', 'UX and content', 'Lead capture'],
    icon: Wrench,
  },
  {
    category_key: 'design-activation',
    title: 'Design & Activation',
    shortTitle: 'Design + activation',
    description: 'Make the work visible with the right creative assets and launch support.',
    prompt: 'When the idea is ready to move from thinking into the world.',
    offerings: ['Creative direction', 'Launch materials', 'Brand assets'],
    icon: Sparkles,
  },
  {
    category_key: 'brand-guidance',
    title: 'Brand Guidance',
    shortTitle: 'Brand guidance',
    description: 'Get a thoughtful second set of eyes when a decision is important, messy, or both.',
    prompt: 'When you need a trusted read before you make the call.',
    offerings: ['Working sessions', 'Brand reviews', 'Founder counsel'],
    icon: MessageCircle,
  },
  {
    category_key: 'saas-automation',
    title: 'Systems & Automation',
    shortTitle: 'Systems + automation',
    description: 'Choose and connect the tools that give your team more room for meaningful work.',
    prompt: 'When repeatable work is ready to become a better system.',
    offerings: ['Tool selection', 'Workflow design', 'Automations'],
    icon: Wrench,
  },
  {
    category_key: 'trusted-support',
    title: 'Trusted Support',
    shortTitle: 'Trusted support',
    description: 'Bring in the right specialist for a defined need, without losing the thread of your brand.',
    prompt: 'When you know the work needs a capable extra pair of hands.',
    offerings: ['Specialist matching', 'Project support', 'Partner introductions'],
    icon: LifeBuoy,
  },
];

const STARTING_POINT_QUESTIONS = [
  {
    key: 'stuck_point',
    question: 'What feels most stuck right now?',
    options: ['The story is fuzzy', 'The website is not converting', 'The work is not getting out', 'The operating system is messy'],
  },
  {
    key: 'desired_shift',
    question: 'What would make the next 90 days feel meaningfully better?',
    options: ['A clearer direction', 'A stronger presence', 'A visible launch', 'More breathing room'],
  },
  {
    key: 'friction',
    question: 'Where is the friction showing up most?',
    options: ['In decisions', 'In customer perception', 'In execution', 'In the tools and handoffs'],
  },
  {
    key: 'tried',
    question: 'What have you already tried?',
    options: ['A lot of thinking', 'A partial build', 'A few disconnected fixes', 'Not much yet'],
  },
  {
    key: 'support_style',
    question: 'What kind of support would feel right?',
    options: ['A focused working session', 'A defined project', 'A strategic partner', 'Help finding the right specialist'],
  },
];

const TIMELINES = [
  { value: 'this_month', label: 'This month' },
  { value: 'next_90_days', label: 'Over the next 90 days' },
  { value: 'this_quarter', label: 'This quarter' },
  { value: 'exploring', label: 'Still exploring' },
];

function unwrap(value, keys = []) {
  if (!value) return {};
  for (const key of keys) {
    if (value?.[key]) return value[key];
  }
  return value;
}

function asArray(value, keys = []) {
  if (Array.isArray(value)) return value;
  for (const key of keys) {
    if (Array.isArray(value?.[key])) return value[key];
  }
  return [];
}

function getContextRecord(raw) {
  return unwrap(raw, ['context', 'client_context', 'data']);
}

function getCategoryConfig(config) {
  const configured = asArray(config, ['categories', 'service_categories']);
  return CATEGORY_DEFAULTS.map((fallback) => {
    const match = configured.find((item) => item?.category_key === fallback.category_key || item?.key === fallback.category_key);
    return {
      ...fallback,
      ...(match || {}),
      category_key: fallback.category_key,
      title: match?.title || match?.name || fallback.title,
      description: match?.description || match?.summary || fallback.description,
      offerings: asArray(match, ['offerings', 'services', 'examples']).length ? asArray(match, ['offerings', 'services', 'examples']) : fallback.offerings,
      pricing_text: match?.pricing_text || '',
    };
  }).filter((category) => category.visible !== false);
}

function getRequestList(raw) {
  return asArray(raw, ['requests', 'service_requests', 'items', 'data']);
}

function formatDate(value) {
  if (!value) return 'Date unavailable';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

function statusLabel(status, saveForLater) {
  if (saveForLater || status === 'save_for_later' || status === 'draft') return 'Saved for later';
  return String(status || 'submitted').replaceAll('_', ' ');
}

function contextIsStale(context) {
  if (context?.stale === true || context?.is_stale === true || context?.isContextStale === true) return true;
  const updated = context?.updated_at || context?.last_updated_at || context?.business_updated_at || context?.latestContextAt;
  if (!updated) return false;
  const age = Date.now() - new Date(updated).getTime();
  return !Number.isNaN(age) && age > 1000 * 60 * 60 * 24 * 90;
}

function chooseRecommendation(answers) {
  const values = Object.values(answers).join(' ').toLowerCase();
  if (values.includes('website') || values.includes('presence') || values.includes('customer perception')) {
    return { category_key: 'website-digital', service_type: 'digital presence', title: 'Start with your digital front door', reason: 'Your next useful move may be making the way people meet the business clearer and easier to act on.' };
  }
  if (values.includes('out') || values.includes('launch') || values.includes('execution')) {
    return { category_key: 'design-activation', service_type: 'activation support', title: 'Move the good work into the world', reason: 'You have enough direction to create momentum. A focused activation can make the next chapter visible.' };
  }
  if (values.includes('operating') || values.includes('tools') || values.includes('breathing')) {
    return { category_key: 'saas-automation', service_type: 'workflow and automation', title: 'Make more room for the work that matters', reason: 'A small improvement to your systems could give the business more capacity without adding more noise.' };
  }
  if (values.includes('specialist')) {
    return { category_key: 'trusted-support', service_type: 'trusted specialist support', title: 'Bring in the right extra pair of hands', reason: 'The cleanest next move may be a carefully matched specialist, with the Foundry keeping the thread intact.' };
  }
  if (values.includes('session') || values.includes('decision') || values.includes('fuzzy')) {
    return { category_key: 'brand-guidance', service_type: 'brand guidance session', title: 'Take the next decision out of the fog', reason: 'A focused conversation can turn the fuzzy part into a short, confident list of next moves.' };
  }
  return { category_key: 'strategy-branding', service_type: 'brand strategy and positioning', title: 'Give the business a clearer center', reason: 'Before adding more output, it may be useful to clarify the story and position everything else can build from.' };
}

function Button({ children, variant = 'primary', className = '', ...props }) {
  const variants = {
    primary: 'bg-[#d9c9a3] text-[#211b27] hover:bg-[#eadcba]',
    secondary: 'border border-[#665b67] text-[#f2e8d5] hover:border-[#d9c9a3] hover:text-[#d9c9a3]',
    quiet: 'text-[#d9c9a3] hover:text-[#f2e8d5]',
  };
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 min-h-10 px-4 text-xs uppercase tracking-[0.14em] transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function ErrorNotice({ message, onRetry }) {
  return (
    <div role="alert" className="dashboard-card border border-[#9b5b59]/60 bg-[#34242d] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <p className="text-sm text-[#f2d7cb]">We could not load your services workspace.</p>
        <p className="text-xs text-[#c8a9a4] mt-1">{message || 'Please try again in a moment.'}</p>
      </div>
      <Button variant="secondary" onClick={onRetry}><RefreshCw className="w-3.5 h-3.5" /> Try again</Button>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div aria-label="Loading services" className="space-y-6 animate-pulse">
      <div className="h-48 bg-[#2a2230] border border-[#453a49]" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4, 5, 6].map((item) => <div key={item} className="h-36 bg-[#2a2230] border border-[#453a49]" />)}
      </div>
    </div>
  );
}

function CategorySection({ category, expanded, onToggle, onStart }) {
  const Icon = category.icon;
  return (
    <section className={`dashboard-card overflow-hidden transition-colors ${expanded ? 'border-[#9b7d65]' : ''}`}>
      <button
        type="button"
        aria-expanded={expanded}
        onClick={onToggle}
        className="w-full text-left p-5 sm:p-6 flex items-start gap-4"
      >
        <span className="icon-tile shrink-0"><Icon className="w-5 h-5 icon-warm" strokeWidth={1.5} /></span>
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] uppercase tracking-[0.22em] text-[#d9c9a3] mb-2">{category.shortTitle || category.title}</span>
          <span className="block font-heading text-xl text-foreground">{category.title}</span>
          <span className="block text-sm text-muted-foreground leading-relaxed mt-2 max-w-xl">{category.description}</span>
        </span>
        <ChevronDown className={`w-4 h-4 mt-1 text-[#d9c9a3] shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>
      {expanded && (
        <div className="px-5 pb-5 sm:px-6 sm:pb-6 border-t border-[#453a49] pt-4 ml-0">
          <p className="text-xs text-[#b9aeb8] mb-3">{category.prompt}</p>
          <div className="flex flex-wrap gap-2 mb-5">
            {category.offerings.map((offering) => (
              <span key={offering} className="border border-[#514653] px-2.5 py-1 text-[11px] text-[#d8ced4]">{offering}</span>
            ))}
          </div>
          {category.pricing_text && <p className="text-xs text-[#b9aeb8] leading-relaxed mb-5">{category.pricing_text}</p>}
          <Button onClick={() => onStart(category)}><MessageCircle className="w-3.5 h-3.5" /> Start a Conversation</Button>
        </div>
      )}
    </section>
  );
}

export default function ServiceHub() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [config, setConfig] = useState({});
  const [context, setContext] = useState({});
  const [requests, setRequests] = useState([]);
  const [expandedCategory, setExpandedCategory] = useState('');
  const [flow, setFlow] = useState('idle');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [objective, setObjective] = useState('');
  const [recommendation, setRecommendation] = useState(null);
  const [form, setForm] = useState({ category_key: '', service_type: '', client_status: 'returning', objective: '', timeline: 'next_90_days', details: '' });
  const [submitError, setSubmitError] = useState('');
  const [submitState, setSubmitState] = useState('idle');
  const [successLabel, setSuccessLabel] = useState('');
  const lastPayload = useRef(null);
  const initialCategory = searchParams.get('category') || '';
  const checklistTasks = searchParams.get('tasks') || '';

  useEffect(() => {
    if (initialCategory || checklistTasks) {
      setForm((previous) => ({
        ...previous,
        category_key: initialCategory || previous.category_key,
        details: checklistTasks
          ? (previous.details || `Selected checklist items:\n${checklistTasks}`)
          : previous.details,
      }));
      if (initialCategory) setExpandedCategory(initialCategory);
    }
  }, [initialCategory, checklistTasks]);

  const loadWorkspace = async () => {
    setLoading(true);
    setLoadError('');
    const results = await Promise.allSettled([
      apiClient.services.getConfig(),
      apiClient.services.getContext(),
      apiClient.services.listRequests(),
    ]);
    const [configResult, contextResult, requestsResult] = results;
    if (configResult.status === 'fulfilled') setConfig(unwrap(configResult.value, ['config', 'data']));
    if (contextResult.status === 'fulfilled') setContext(getContextRecord(contextResult.value));
    if (requestsResult.status === 'fulfilled') setRequests(getRequestList(requestsResult.value));
    const failed = results.find((result) => result.status === 'rejected');
    if (failed) setLoadError(failed.reason?.message || 'Some member services are temporarily unavailable.');
    setLoading(false);
  };

  useEffect(() => {
    loadWorkspace();
  }, []);

  const categories = useMemo(() => getCategoryConfig(config), [config]);
  const returningClient = Boolean(context?.returning_client ?? context?.is_returning_client ?? context?.isReturningClient ?? context?.last_request_at ?? context?.latestContextAt ?? context?.request_count);
  const staleContext = contextIsStale(context);
  const pricingText = config?.pricing_text;
  const activeCategory = categories.find((item) => item.category_key === form.category_key);
  const currentQuestion = STARTING_POINT_QUESTIONS[questionIndex];

  const openRequestFlow = (category) => {
    const nextCategory = category?.category_key || recommendation?.category_key || '';
    setForm((previous) => ({
      ...previous,
      category_key: nextCategory,
      service_type: category?.service_type || recommendation?.service_type || '',
      client_status: returningClient ? 'returning' : 'new',
      objective: objective || previous.objective,
    }));
    setFlow('request');
    setSubmitError('');
    setSubmitState('idle');
    window.setTimeout(() => document.getElementById('conversation-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  };

  const beginStartingPoint = () => {
    setAnswers({});
    setObjective('');
    setRecommendation(null);
    setQuestionIndex(0);
    setFlow('starting');
    setSubmitError('');
    setSubmitState('idle');
    window.setTimeout(() => document.getElementById('starting-point')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  };

  const finishStartingPoint = () => {
    const result = chooseRecommendation(answers);
    setRecommendation(result);
    setForm((previous) => ({
      ...previous,
      category_key: result.category_key,
      service_type: result.service_type,
      objective,
      client_status: returningClient ? 'returning' : 'new',
    }));
    setFlow('recommendation');
  };

  const buildPayload = (saveForLater = false) => ({
    request_kind: 'service_hub',
    category_key: form.category_key || recommendation?.category_key || 'brand-guidance',
    service_type: form.service_type || recommendation?.service_type || 'member services conversation',
    client_status: form.client_status || (returningClient ? 'returning' : 'new'),
    answers: Object.keys(answers).length ? answers : { source: 'member_request' },
    objective: form.objective || objective || '',
    timeline: form.timeline || 'exploring',
    recommendation: recommendation ? recommendation.title : '',
    status: saveForLater ? 'save_for_later' : 'submitted',
    save_for_later: saveForLater,
    details: {
      source: 'services_hub',
      message: form.details || '',
    },
  });

  const sendPayload = async (payload, label) => {
    setSubmitState('sending');
    setSubmitError('');
    lastPayload.current = payload;
    try {
      const created = await apiClient.services.createRequest(payload);
      setRequests((previous) => [created || payload, ...previous]);
      setSubmitState('success');
      setSuccessLabel(label);
      setFlow('success');
    } catch (error) {
      setSubmitState('error');
      setSubmitError(error?.message || 'Your request was not saved. Please try again.');
    }
  };

  const submitConversation = async (event, saveForLater = false) => {
    event?.preventDefault();
    if (!form.category_key) {
      setSubmitError('Choose the area where you would like support.');
      return;
    }
    if (!saveForLater && !form.details.trim() && !form.objective.trim()) {
      setSubmitError('Add a sentence about what you need help with, or share the objective you are working toward.');
      return;
    }
    await sendPayload(buildPayload(saveForLater), saveForLater ? 'Saved for later' : 'Conversation requested');
  };

  const saveRecommendation = async () => {
    if (!recommendation) return;
    const payload = buildPayload(true);
    await sendPayload(payload, 'Recommendation saved');
  };

  const updateForm = (key, value) => setForm((previous) => ({ ...previous, [key]: value }));

  return (
    <div className="editorial-container max-w-6xl mx-auto animate-fade-in pb-16">
      <header className="mb-8 md:mb-10">
        <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-[#d9c9a3] mb-4">
          <span>Member services</span><span className="text-[#786b79]">/</span><span className="text-muted-foreground">A considered next move</span>
        </div>
        <div className="grid lg:grid-cols-[1fr_280px] gap-7 items-end">
          <div>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-light leading-[0.98] text-foreground">
              Find the work that<br /><span className="molten-text italic">moves you forward.</span>
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xl mt-5">
              A quiet place to choose your next useful step, ask for a capable hand, or simply get a clearer read on what comes next.
            </p>
          </div>
          <div className="border-l border-[#574c5a] pl-5 text-sm text-[#c8bdc6] leading-relaxed">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#d9c9a3] mb-2">The studio promise</p>
            <p>No pressure. No package maze. Just a thoughtful starting point.</p>
          </div>
        </div>
      </header>

      {loading && <LoadingSkeleton />}
      {!loading && loadError && <div className="mb-6"><ErrorNotice message={loadError} onRetry={loadWorkspace} /></div>}

      {!loading && (
        <>
          {returningClient && (
            <section className="forged-gradient border border-[#806b5c] p-5 sm:p-7 mb-6" aria-labelledby="returning-client-title">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.24em] text-[#e2c68f] mb-2">Welcome back</p>
                  <h2 id="returning-client-title" className="font-heading text-2xl text-foreground">What do you need help with now?</h2>
                  {staleContext && (
                    <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
                      It has been a little while since your last update. What has changed in the business since then?
                    </p>
                  )}
                </div>
                <Button onClick={() => openRequestFlow()}><MessageCircle className="w-3.5 h-3.5" /> Start with a conversation</Button>
              </div>
              {staleContext && (
                <label className="block mt-5 max-w-2xl">
                  <span className="text-xs text-[#d8c5b6]">Business update <span className="text-[#a9959c]">(optional)</span></span>
                  <textarea
                    value={form.details}
                    onChange={(event) => updateForm('details', event.target.value)}
                    rows={2}
                    placeholder="A sentence or two is plenty."
                    className="mt-2 w-full bg-[#241d2a]/70 border border-[#685765] px-3 py-2 text-sm text-foreground placeholder:text-[#897b88] focus:outline-none focus:border-[#d9c9a3]"
                  />
                </label>
              )}
            </section>
          )}

          <section className="dashboard-card forged-gradient p-6 sm:p-8 mb-10" aria-labelledby="starting-title">
            <div className="grid lg:grid-cols-[1fr_auto] gap-7 items-center">
              <div>
                <div className="flex items-center gap-2 text-[#e2c68f] text-[10px] uppercase tracking-[0.24em] mb-3"><Sparkles className="w-3.5 h-3.5" /> Your first move</div>
                <h2 id="starting-title" className="font-heading text-2xl sm:text-3xl text-foreground">Not sure where to start?</h2>
                <p className="text-sm text-muted-foreground mt-2 max-w-xl">Answer five short questions. We will point you toward the most useful conversation, not the biggest one.</p>
              </div>
              <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3">
                <Button onClick={beginStartingPoint}>Find My Starting Point <ArrowRight className="w-3.5 h-3.5" /></Button>
                <Button variant="secondary" onClick={() => openRequestFlow()}>I Know What I Need</Button>
              </div>
            </div>
          </section>

          {flow === 'starting' && (
            <section id="starting-point" className="dashboard-card border-[#806b5c] p-5 sm:p-8 mb-10 scroll-mt-6" aria-labelledby="starting-point-title">
              <div className="flex items-center justify-between gap-4 mb-7">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.24em] text-[#d9c9a3] mb-2">Starting point / {questionIndex + 1} of {STARTING_POINT_QUESTIONS.length}</p>
                  <h2 id="starting-point-title" className="font-heading text-2xl text-foreground">{currentQuestion.question}</h2>
                </div>
                <button type="button" aria-label="Close starting point flow" onClick={() => setFlow('idle')} className="text-[#a99aa7] hover:text-foreground"><X className="w-5 h-5" /></button>
              </div>
              <div className="h-1 bg-[#3c3241] mb-6"><div className="h-1 bg-[#d9c9a3] transition-all" style={{ width: `${((questionIndex + 1) / STARTING_POINT_QUESTIONS.length) * 100}%` }} /></div>
              <div className="grid sm:grid-cols-2 gap-3">
                {currentQuestion.options.map((option) => (
                  <button
                    type="button"
                    key={option}
                    onClick={() => setAnswers((previous) => ({ ...previous, [currentQuestion.key]: option }))}
                    className={`text-left border px-4 py-4 text-sm transition-colors ${answers[currentQuestion.key] === option ? 'border-[#d9c9a3] bg-[#5a493e] text-[#f3e5c7]' : 'border-[#514653] text-muted-foreground hover:border-[#a89678]'}`}
                  >
                    <span className="flex items-center justify-between gap-4">{option}{answers[currentQuestion.key] === option && <Check className="w-4 h-4 text-[#e2c68f]" />}</span>
                  </button>
                ))}
              </div>
              <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 mt-7">
                <Button variant="quiet" onClick={() => questionIndex === 0 ? setFlow('idle') : setQuestionIndex((index) => index - 1)}>Back</Button>
                {questionIndex < STARTING_POINT_QUESTIONS.length - 1 ? (
                  <Button disabled={!answers[currentQuestion.key]} onClick={() => setQuestionIndex((index) => index + 1)}>Next question <ArrowRight className="w-3.5 h-3.5" /></Button>
                ) : (
                  <Button disabled={!answers[currentQuestion.key]} onClick={finishStartingPoint}>See my starting point <ArrowRight className="w-3.5 h-3.5" /></Button>
                )}
              </div>
            </section>
          )}

          {flow === 'recommendation' && recommendation && (
            <section className="dashboard-card border-[#b99467] p-5 sm:p-8 mb-10" aria-labelledby="recommendation-title">
              <div className="grid lg:grid-cols-[1fr_300px] gap-8">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.24em] text-[#e2c68f] mb-3">Your considered next move</p>
                  <h2 id="recommendation-title" className="font-heading text-3xl text-foreground">{recommendation.title}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-3 max-w-xl">{recommendation.reason}</p>
                  <label className="block mt-6 max-w-xl">
                    <span className="text-xs text-[#d8c5b6]">Anything specific you want this to help unlock? <span className="text-[#a9959c]">(optional)</span></span>
                    <textarea value={objective} onChange={(event) => setObjective(event.target.value)} rows={3} placeholder="For example: a clearer offer before our next launch." className="mt-2 w-full bg-[#241d2a]/70 border border-[#685765] px-3 py-2 text-sm text-foreground placeholder:text-[#897b88] focus:outline-none focus:border-[#d9c9a3]" />
                  </label>
                </div>
                <div className="flex flex-col items-stretch gap-2 lg:pt-6">
                  <Button onClick={() => openRequestFlow()}><MessageCircle className="w-3.5 h-3.5" /> Start a Conversation</Button>
                  <Button variant="secondary" onClick={() => { setExpandedCategory('brand-guidance'); document.getElementById('service-categories')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>Explore Brand Guidance</Button>
                  <Button variant="secondary" onClick={() => { setExpandedCategory(recommendation.category_key); setFlow('idle'); document.getElementById('service-categories')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>Browse Relevant Resources</Button>
                  <Button variant="quiet" disabled={submitState === 'sending'} onClick={saveRecommendation}>{submitState === 'sending' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Heart className="w-3.5 h-3.5" />} Save for Later</Button>
                </div>
              </div>
            </section>
          )}

          {flow === 'request' && (
            <section id="conversation-form" className="dashboard-card border-[#806b5c] p-5 sm:p-8 mb-10 scroll-mt-6" aria-labelledby="conversation-title">
              <div className="flex items-start justify-between gap-4 mb-7">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.24em] text-[#d9c9a3] mb-2">A conversation, not a funnel</p>
                  <h2 id="conversation-title" className="font-heading text-2xl sm:text-3xl text-foreground">Tell us what would be useful.</h2>
                  <p className="text-sm text-muted-foreground mt-2">A few details help us bring the right thought partner into the room.</p>
                </div>
                <button type="button" aria-label="Close conversation form" onClick={() => setFlow('idle')} className="text-[#a99aa7] hover:text-foreground"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={(event) => submitConversation(event, false)} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <label className="block">
                    <span className="block text-xs text-[#d8c5b6] mb-2">Where should we focus?</span>
                    <select value={form.category_key} onChange={(event) => { updateForm('category_key', event.target.value); updateForm('service_type', ''); }} className="w-full h-11 bg-[#241d2a] border border-[#685765] px-3 text-sm text-foreground focus:outline-none focus:border-[#d9c9a3]">
                      <option value="">Choose an area</option>
                      {categories.map((category) => <option key={category.category_key} value={category.category_key}>{category.title}</option>)}
                    </select>
                  </label>
                  <label className="block">
                    <span className="block text-xs text-[#d8c5b6] mb-2">What kind of support?</span>
                    <input value={form.service_type} onChange={(event) => updateForm('service_type', event.target.value)} placeholder={activeCategory?.offerings?.[0] || 'A useful starting point'} className="w-full h-11 bg-[#241d2a] border border-[#685765] px-3 text-sm text-foreground placeholder:text-[#897b88] focus:outline-none focus:border-[#d9c9a3]" />
                  </label>
                  <label className="block">
                    <span className="block text-xs text-[#d8c5b6] mb-2">When are you thinking?</span>
                    <select value={form.timeline} onChange={(event) => updateForm('timeline', event.target.value)} className="w-full h-11 bg-[#241d2a] border border-[#685765] px-3 text-sm text-foreground focus:outline-none focus:border-[#d9c9a3]">
                      {TIMELINES.map((timeline) => <option key={timeline.value} value={timeline.value}>{timeline.label}</option>)}
                    </select>
                  </label>
                  <label className="block">
                    <span className="block text-xs text-[#d8c5b6] mb-2">Your relationship to the Foundry</span>
                    <select value={form.client_status} onChange={(event) => updateForm('client_status', event.target.value)} className="w-full h-11 bg-[#241d2a] border border-[#685765] px-3 text-sm text-foreground focus:outline-none focus:border-[#d9c9a3]">
                      <option value="returning">Returning member</option>
                      <option value="new">New member request</option>
                    </select>
                  </label>
                </div>
                <label className="block">
                  <span className="block text-xs text-[#d8c5b6] mb-2">Objective <span className="text-[#a9959c]">(optional)</span></span>
                  <input value={form.objective} onChange={(event) => updateForm('objective', event.target.value)} placeholder="What would a good outcome make possible?" className="w-full h-11 bg-[#241d2a] border border-[#685765] px-3 text-sm text-foreground placeholder:text-[#897b88] focus:outline-none focus:border-[#d9c9a3]" />
                </label>
                <label className="block">
                  <span className="block text-xs text-[#d8c5b6] mb-2">A little context</span>
                  <textarea value={form.details} onChange={(event) => updateForm('details', event.target.value)} rows={4} placeholder="What is happening, and where would another perspective help?" className="w-full bg-[#241d2a] border border-[#685765] px-3 py-3 text-sm text-foreground placeholder:text-[#897b88] focus:outline-none focus:border-[#d9c9a3]" />
                </label>
                {submitError && (
                  <div role="alert" className="border border-[#9b5b59]/60 bg-[#34242d] px-4 py-3 text-sm text-[#f2d7cb] flex items-start gap-2">
                    <span className="mt-0.5"> {submitError}</span>
                    {submitState === 'error' && lastPayload.current && <button type="button" className="ml-auto underline underline-offset-4 shrink-0" onClick={() => sendPayload(lastPayload.current, 'Conversation requested')}>Retry</button>}
                  </div>
                )}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
                  <Button type="submit" disabled={submitState === 'sending'}>{submitState === 'sending' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />} Send Request</Button>
                  <Button variant="quiet" disabled={submitState === 'sending'} onClick={(event) => submitConversation(event, true)}><FileText className="w-3.5 h-3.5" /> Save for Later</Button>
                </div>
              </form>
            </section>
          )}

          {flow === 'success' && (
            <section className="dashboard-card border-[#758c73] bg-[#26332d] p-6 sm:p-8 mb-10" role="status">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div className="flex items-start gap-4">
                  <span className="w-9 h-9 border border-[#a9c29c] text-[#c4d8b3] flex items-center justify-center shrink-0"><Check className="w-4 h-4" /></span>
                  <div><h2 className="font-heading text-2xl text-[#e8efdf]">{successLabel}</h2><p className="text-sm text-[#b8c9b6] mt-1">It is in your member history below. We will take it from here.</p></div>
                </div>
                <Button variant="secondary" onClick={() => setFlow('idle')}>Return to services</Button>
              </div>
            </section>
          )}

          <section id="service-categories" className="scroll-mt-6 mb-10" aria-labelledby="category-title">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4">
              <div><p className="text-[10px] uppercase tracking-[0.28em] text-[#d9c9a3] mb-2">The service shelf</p><h2 id="category-title" className="font-heading text-3xl text-foreground">Choose a direction.</h2></div>
              <p className="text-xs text-muted-foreground max-w-xs sm:text-right">Open a category to see the shape of the work. Nothing here commits you to a package.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((category) => (
                <CategorySection key={category.category_key} category={category} expanded={expandedCategory === category.category_key} onToggle={() => setExpandedCategory((current) => current === category.category_key ? '' : category.category_key)} onStart={openRequestFlow} />
              ))}
            </div>
          </section>

          {pricingText && (
            <aside className="border-l-2 border-[#d9c9a3] pl-4 mb-10 max-w-2xl">
              <p className="text-[10px] uppercase tracking-[0.24em] text-[#d9c9a3] mb-2">A note on investment</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{pricingText}</p>
            </aside>
          )}

          <section className="grid lg:grid-cols-[1fr_1.2fr] gap-6 items-start" aria-labelledby="history-title">
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-[#d9c9a3] mb-2">Your thread with us</p>
              <h2 id="history-title" className="font-heading text-3xl text-foreground">Request history.</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mt-3 max-w-sm">Only you can see these notes. Saved ideas stay here until they are ready to become a conversation.</p>
            </div>
            <div className="dashboard-card divide-y divide-[#453a49]">
              {requests.length ? requests.slice(0, 8).map((request, index) => (
                <div key={request.id || `${request.category_key}-${index}`} className="p-4 sm:p-5 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm text-foreground">{request.service_type || request.category_key || 'Member services request'}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatDate(request.created_at || request.createdAt || request.requested_at)}</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-[#d9c9a3] shrink-0"><Clock3 className="w-3 h-3" /> {statusLabel(request.status, request.save_for_later)}</span>
                </div>
              )) : (
                <div className="p-6 text-sm text-muted-foreground flex items-start gap-3"><FileText className="w-4 h-4 text-[#d9c9a3] mt-0.5 shrink-0" /><span>Your first conversation will appear here.</span></div>
              )}
            </div>
          </section>

          <p className="text-[11px] text-[#938592] leading-relaxed mt-10 max-w-3xl border-t border-[#453a49] pt-5">
            <span className="text-[#d9c9a3]">Trusted support:</span> {config?.trusted_support_disclaimer || config?.disclaimer || 'Trusted support may include independent specialists and partners. We will always be clear about who is involved before any work begins.'}
          </p>
        </>
      )}
    </div>
  );
}