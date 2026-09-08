import React, { useState, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/react';
import { useLocation, Link } from 'react-router-dom';
import { useReferralAccess, useReferralSubmissions, useCreateReferralSubmission } from '@/hooks/use-referrals';
import { Shield, Lock, CheckCircle, ChevronDown, Activity, LogOut, Send, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const basePath = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';
const EMBER_VIDEO = 'https://media.base44.com/videos/public/6a6982f0647238bf2b5d67bf/8d01159f7_rising-golden-embers-on-black-background-2025-12-17-19-25-08-utc.mp4';

function AuthGate() {
  const location = useLocation();
  const returnUrl = encodeURIComponent(location.pathname + location.search);

  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#100e0c] px-4 py-12">
      <video
        autoPlay muted loop playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none"
        src={EMBER_VIDEO}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#100e0c]/70 via-[#100e0c]/40 to-[#100e0c]/80 pointer-events-none" />
      
      <div className="absolute top-6 left-6 flex items-center gap-3 z-10">
        <img
          src={`${basePath}/forge-logo.png`}
          alt="Freedom Foundry"
          className="h-11 w-11 rounded-xl object-cover shadow-[0_0_14px_rgba(217,98,44,0.4)]"
        />
        <div className="flex flex-col leading-tight">
          <div className="font-heading text-xl font-medium tracking-[0.04em] text-[#f7f2ea]">FREEDOM FOUNDRY</div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-[#d9c9a3]">BY THE BRAND REVIVALIST®</div>
        </div>
      </div>

      <div className="relative z-10 my-8 w-full max-w-md freedom-auth-card p-10 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-[#1a1412] border border-[#e4a06e]/20 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(217,98,44,0.2)]">
          <Lock className="w-8 h-8 text-[#e4a06e]" strokeWidth={1} />
        </div>
        
        <h1 className="font-heading text-3xl font-light text-[#f7f2ea] mb-3">
          Partner <span className="molten-text italic font-medium">Program</span>
        </h1>
        <p className="text-[#f7f2ea]/70 text-sm mb-8 leading-relaxed">
          This is a private, invitation-only circle. Please sign in or create your account to access your partner portal.
        </p>

        <div className="flex flex-col gap-4 w-full">
          <Link
            to={`/sign-in?return_url=${returnUrl}`}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-[#c76a47] via-[#e49a63] to-[#f0d9b5] hover:opacity-90 text-[#25140d] font-semibold tracking-wide flex items-center justify-center"
          >
            Sign In to Access
          </Link>
          <Link
            to={`/sign-up?return_url=${returnUrl}`}
            className="w-full h-12 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-[#f7f2ea] font-medium flex items-center justify-center"
          >
            Create Partner Account
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatusGate({ status, message }) {
  const { signOut } = useClerk();
  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#100e0c] px-4 py-12">
      <div className="absolute top-6 left-6 flex items-center gap-3 z-10">
        <img src={`${basePath}/forge-logo.png`} alt="Logo" className="h-11 w-11 rounded-xl object-cover" />
      </div>
      
      <div className="relative z-10 max-w-md w-full dashboard-card p-10 text-center">
        <Shield className="w-12 h-12 text-[#e4a06e] mx-auto mb-4 opacity-80" strokeWidth={1} />
        <h1 className="font-heading text-2xl text-white mb-2">{status}</h1>
        <p className="text-sm text-white/60 mb-8">{message}</p>
        <button
          onClick={() => signOut()}
          className="inline-flex items-center gap-2 text-sm link-warm"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  );
}

const SECTIONS = [
  { id: 'invitation', label: 'The Invitation' },
  { id: 'partnership', label: 'Ways to Partner' },
  { id: 'compensation', label: 'Compensation & Honor' },
  { id: 'tiers', label: 'Engagement Tiers' },
  { id: 'fit', label: 'Ideal & Poor Fit' },
  { id: 'expectations', label: 'What to Expect' },
  { id: 'process', label: 'The Process' },
  { id: 'submit', label: 'Submit Referral' },
  { id: 'history', label: 'Submission History' }
];

export default function ReferralProgramPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { data: access, isLoading: accessLoading } = useReferralAccess(Boolean(isSignedIn));
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { signOut } = useClerk();

  // Handle scroll spy
  useEffect(() => {
    if (!isSignedIn || access?.status !== 'active') return;

    const handleScroll = () => {
      const scrollPos = window.scrollY + 100;
      let currentId = SECTIONS[0].id;
      
      for (const section of SECTIONS) {
        const el = document.getElementById(section.id);
        if (el && el.offsetTop <= scrollPos) {
          currentId = section.id;
        }
      }
      setActiveSection(currentId);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isSignedIn, access]);

  const scrollTo = (id) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
    }
  };

  if (!isLoaded || (isSignedIn && accessLoading)) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#100e0c]">
        <div className="w-8 h-8 border-4 border-[#3a2119] border-t-[#e4a06e] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isSignedIn) {
    return <AuthGate />;
  }

  if (access?.status === 'pending') {
    return <StatusGate status="Application Pending" message="Your partner application is currently under review by our team. You will receive an email once your access is granted." />;
  }

  if (access?.status === 'revoked' || access?.status === 'denied') {
    return <StatusGate status="Access Unavailable" message="You do not have access to the partner program at this time." />;
  }

  if (!access?.allowed) {
    return <StatusGate status="Access Denied" message="This portal is restricted to approved referral partners." />;
  }

  return (
    <div className="min-h-[100dvh] bg-[#14110f] text-foreground flex flex-col md:flex-row font-body relative">
      {/* Mobile Header / Nav Control */}
      <div className="md:hidden sticky top-0 z-50 bg-[#14110f]/90 backdrop-blur-md border-b border-white/10 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={`${basePath}/forge-logo.png`} alt="Logo" className="h-8 w-8 rounded-lg object-cover" />
          <span className="font-heading text-lg">Partner Program</span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          className="flex items-center gap-2 text-sm text-[#f7f2ea]/80 border border-white/10 px-3 py-1.5 rounded-full"
        >
          {SECTIONS.find(s => s.id === activeSection)?.label} <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm pt-20 px-4">
          <div className="dashboard-card p-4 rounded-xl flex flex-col gap-2 relative">
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2 text-white/50 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="mb-4">
              <span className="font-heading text-xl text-white ml-2">Navigation</span>
            </div>
            {SECTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className={`text-left px-4 py-3 rounded-lg text-sm ${activeSection === s.id ? 'bg-white/10 text-white font-medium' : 'text-white/60'}`}
              >
                {s.label}
              </button>
            ))}
            <div className="mt-4 pt-4 border-t border-white/10">
               <button onClick={() => signOut()} className="w-full text-left px-4 py-3 text-sm text-[#e4a06e]">Sign Out</button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 fixed inset-y-0 left-0 bg-[#100e0c] border-r border-white/5 py-8 px-6 z-20">
        <div className="flex items-center gap-3 mb-12">
          <img src={`${basePath}/forge-logo.png`} alt="Logo" className="h-10 w-10 rounded-xl object-cover shadow-[0_0_10px_rgba(217,98,44,0.3)]" />
          <div className="flex flex-col">
            <span className="font-heading text-xl text-white">Partner Program</span>
            <span className="text-[9px] uppercase tracking-widest text-[#d9c9a3]">Freedom Foundry</span>
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-1.5">
          {SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className={`text-left px-4 py-2.5 rounded-lg text-sm transition-colors ${
                activeSection === s.id 
                  ? 'bg-white/5 text-[#f7f2ea] font-medium border border-white/10' 
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              {s.label}
            </button>
          ))}
        </nav>

        <div className="mt-8 mb-4">
          <button 
            onClick={() => scrollTo('submit')}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-[#c76a47] via-[#e49a63] to-[#f0d9b5] text-[#25140d] font-semibold tracking-wide flex items-center justify-center gap-2 hover:opacity-90"
          >
            Submit a Referral
          </button>
        </div>

        <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs text-white/50">
               {user?.firstName?.[0] || user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase()}
             </div>
             <div className="flex flex-col">
                <span className="text-xs text-white truncate max-w-[120px]">{user?.firstName || 'Partner'}</span>
             </div>
          </div>
          <button onClick={() => signOut()} className="p-2 text-white/50 hover:text-[#e4a06e]">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-72 p-6 md:p-12 lg:p-20 max-w-4xl">
        
        {/* Section: The Invitation */}
        <section id="invitation" className="mb-24 pt-8 md:pt-0">
          <h1 className="font-heading text-4xl md:text-5xl font-light text-white mb-6">
            The <span className="molten-text italic font-medium">Invitation</span>
          </h1>
          <div className="dash-editorial-block text-lg space-y-6">
            <p>
              Welcome. This is a private, invitation-only circle for trusted colleagues, former clients, and strategic partners of Freedom Foundry.
            </p>
            <p>
              We believe that the best growth comes from aligned relationships. When you refer a founder or organization to us, you are placing your trust in our capability to deliver transformative brand architecture and strategic growth. We honor that trust deeply.
            </p>
            <p>
              This portal is your central hub to submit referrals, track their progress, and review our engagement parameters to ensure we are the right fit for your network.
            </p>
          </div>
        </section>

        {/* Section: Ways to Partner */}
        <section id="partnership" className="mb-24 pt-8">
          <h2 className="font-heading text-3xl font-light text-white mb-8">Ways to <span className="italic text-white/70">Partner</span></h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="dashboard-card p-8 border border-white/5">
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                <Activity className="w-5 h-5 text-[#e4a06e]" />
              </div>
              <h3 className="font-heading text-2xl text-white mb-3">Direct Referral</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                You introduce us directly to the prospect. We lead the sales conversation, handle the closing, and manage the engagement directly. You are compensated for the introduction and trust transfer.
              </p>
            </div>
            <div className="dashboard-card p-8 border border-white/5">
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                <Shield className="w-5 h-5 text-[#e4a06e]" />
              </div>
              <h3 className="font-heading text-2xl text-white mb-3">White-Label Partnership</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                We operate as an extension of your team (e.g., your "Brand Strategy Department"). You maintain the client relationship and billing, while we deliver the architecture and assets behind the scenes.
              </p>
            </div>
          </div>
        </section>

        {/* Section: Compensation */}
        <section id="compensation" className="mb-24 pt-8">
          <h2 className="font-heading text-3xl font-light text-white mb-8">Compensation & <span className="italic text-white/70">Honor</span></h2>
          <div className="dash-editorial-block space-y-6">
            <h3 className="text-xl">10% Referral Compensation</h3>
            <p>
              For every direct referral that becomes a signed client, we provide a 10% referral compensation based on the collected revenue for the first year of the engagement.
            </p>
            <div className="bg-black/5 p-6 border border-black/5 rounded-xl space-y-4 my-6">
              <h4 className="font-heading text-lg font-medium text-black">Timing & Protocol</h4>
              <ul className="list-disc pl-5 space-y-2 text-black/80">
                <li>Compensation is disbursed only after the client's payment has cleared our accounts.</li>
                <li>Applies to the first 12 months of the engagement.</li>
                <li>Built on mutual trust, honor, and safeguards. We do not use automated affiliate links; every relationship is managed personally.</li>
              </ul>
            </div>
            <p className="text-sm text-black/60 italic">
              Note: This program is managed relationally, not via payment processors. You will be contacted directly for payout coordination once a referred engagement is secured.
            </p>
          </div>
        </section>

        {/* Section: Engagement Tiers */}
        <section id="tiers" className="mb-24 pt-8">
          <h2 className="font-heading text-3xl font-light text-white mb-8">Engagement <span className="italic text-white/70">Tiers</span></h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="dashboard-card p-8 border border-white/5 flex flex-col h-full">
              <h3 className="font-heading text-2xl text-[#f0d9b5] mb-2">Brand Architecture</h3>
              <p className="text-xs uppercase tracking-widest text-[#e4a06e] mb-4">Comprehensive Build</p>
              <p className="text-white/70 text-sm leading-relaxed mb-6 flex-1">
                A full-scale engagement to establish foundational strategy, visual identity, message framing, and digital presence (web design & architecture).
              </p>
              <div className="text-xs text-white/40 border-t border-white/10 pt-4">
                Ideal for established founders launching a new venture or scaling a proven service.
              </div>
            </div>
            <div className="dashboard-card p-8 border border-white/5 flex flex-col h-full">
              <h3 className="font-heading text-2xl text-[#f0d9b5] mb-2">Fractional Advisory</h3>
              <p className="text-xs uppercase tracking-widest text-[#e4a06e] mb-4">Strategic Retainer</p>
              <p className="text-white/70 text-sm leading-relaxed mb-6 flex-1">
                Ongoing advisory functioning as a Fractional CMO or Brand Director to guide their existing team or scale operations organically over time.
              </p>
              <div className="text-xs text-white/40 border-t border-white/10 pt-4">
                Ideal for organizations with execution capacity who lack strategic brand oversight.
              </div>
            </div>
          </div>
        </section>

        {/* Section: Ideal Fit */}
        <section id="fit" className="mb-24 pt-8">
          <h2 className="font-heading text-3xl font-light text-white mb-8">Ideal & <span className="italic text-white/70">Poor Fit</span></h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#1a1c1a] border border-[#2d3a33] p-8 rounded-2xl">
              <h3 className="font-heading text-2xl text-[#a3d9b4] mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" /> Ideal Fit
              </h3>
              <ul className="space-y-3 text-white/70 text-sm">
                <li className="flex gap-2"><span className="text-[#a3d9b4]">•</span> B2B service providers and high-ticket consultants</li>
                <li className="flex gap-2"><span className="text-[#a3d9b4]">•</span> Visionary founders seeking structural brand clarity</li>
                <li className="flex gap-2"><span className="text-[#a3d9b4]">•</span> Organizations undergoing transition, merger, or market repositioning</li>
                <li className="flex gap-2"><span className="text-[#a3d9b4]">•</span> Clients willing to invest in deep strategic architecture before tactical execution</li>
              </ul>
            </div>
            <div className="bg-[#1c1616] border border-[#3a2828] p-8 rounded-2xl">
              <h3 className="font-heading text-2xl text-[#d9a3a3] mb-4 flex items-center gap-2">
                <LogOut className="w-5 h-5" /> Poor Fit
              </h3>
              <ul className="space-y-3 text-white/70 text-sm">
                <li className="flex gap-2"><span className="text-[#d9a3a3]">•</span> Low-ticket or high-volume transactional e-commerce</li>
                <li className="flex gap-2"><span className="text-[#d9a3a3]">•</span> Founders seeking "quick hacks" or immediate lead generation without brand foundations</li>
                <li className="flex gap-2"><span className="text-[#d9a3a3]">•</span> Misaligned values (lack of integrity, transparency, or respect for process)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section: What to Expect */}
        <section id="expectations" className="mb-24 pt-8">
          <h2 className="font-heading text-3xl font-light text-white mb-8">What to <span className="italic text-white/70">Expect</span></h2>
          <div className="dashboard-card p-8 border border-white/5 space-y-6">
            <p className="text-white/80 leading-relaxed">
              When you introduce a contact to Freedom Foundry, they receive a high-touch, white-glove experience. We do not use aggressive sales tactics.
            </p>
            <p className="text-white/80 leading-relaxed">
              Our initial conversations are strictly diagnostic. If we determine that we cannot provide exceptional value, we will tell them directly and attempt to point them toward a better resource. Your reputation is protected by our restraint.
            </p>
          </div>
        </section>

        {/* Section: The Process */}
        <section id="process" className="mb-24 pt-8">
          <h2 className="font-heading text-3xl font-light text-white mb-8">The <span className="italic text-white/70">Process</span></h2>
          <div className="space-y-4">
            {[
              { num: '01', title: 'Submission', desc: 'You submit the referral details using the form below.' },
              { num: '02', title: 'Review & Outreach', desc: 'We review the fit and reach out to the contact (or coordinate with you on the best introduction method).' },
              { num: '03', title: 'Diagnostic Call', desc: 'We conduct a deep-dive strategy call with the prospect.' },
              { num: '04', title: 'Proposal', desc: 'If aligned, we present a tailored engagement proposal.' },
              { num: '05', title: 'Compensation', desc: 'Once the engagement is signed and the initial payment clears, your compensation timeline begins.' }
            ].map((step, i) => (
              <div key={i} className="flex gap-4 items-start p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                <div className="font-heading text-2xl text-[#e4a06e]/50 pt-1">{step.num}</div>
                <div>
                  <h4 className="font-heading text-xl text-white mb-1">{step.title}</h4>
                  <p className="text-sm text-white/60">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section: Submit Referral */}
        <section id="submit" className="mb-24 pt-8">
          <h2 className="font-heading text-3xl font-light text-white mb-8">Submit <span className="italic text-white/70">Referral</span></h2>
          <SubmissionForm />
        </section>

        {/* Section: History */}
        <section id="history" className="mb-32 pt-8">
          <h2 className="font-heading text-3xl font-light text-white mb-8">Submission <span className="italic text-white/70">History</span></h2>
          <SubmissionHistory />
        </section>

      </main>

      {/* Mobile Sticky CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-[#14110f]/90 backdrop-blur-md border-t border-white/10 z-40">
        <button 
          onClick={() => scrollTo('submit')}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-[#c76a47] via-[#e49a63] to-[#f0d9b5] text-[#25140d] font-semibold tracking-wide flex items-center justify-center gap-2 hover:opacity-90 shadow-lg shadow-black/50"
        >
          Submit a Referral
        </button>
      </div>
    </div>
  );
}

function SubmissionForm() {
  const [kind, setKind] = useState('referral'); // 'referral' or 'question'
  const createSub = useCreateReferralSubmission();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    contact_name: '', contact_email: '', contact_phone: '', business_name: '', relationship: '', notes: '', question: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Explicitly send exactly the keys the backend expects based on kind
    const payload = {
      kind,
      contact_name: formData.contact_name || '',
      contact_email: formData.contact_email || '',
      contact_phone: formData.contact_phone || '',
      business_name: formData.business_name || '',
      relationship: formData.relationship || '',
      notes: formData.notes || '',
      question: formData.question || ''
    };

    createSub.mutate(payload, {
      onSuccess: () => {
        setFormData({ contact_name: '', contact_email: '', contact_phone: '', business_name: '', relationship: '', notes: '', question: '' });
        toast({ title: 'Submission Received', description: 'Thank you. We will review your submission shortly.' });
      },
      onError: (err) => {
        toast({ variant: 'destructive', title: 'Submission Failed', description: err.message });
      }
    });
  };

  return (
    <div className="dashboard-card p-8 border border-white/10">
      <div className="flex gap-4 mb-8 border-b border-white/10 pb-4">
        <button 
          onClick={() => setKind('referral')}
          className={`text-sm tracking-wide uppercase px-2 py-1 transition-colors ${kind === 'referral' ? 'text-[#e4a06e] border-b-2 border-[#e4a06e]' : 'text-white/40 hover:text-white/70'}`}
        >
          Submit Lead
        </button>
        <button 
          onClick={() => setKind('question')}
          className={`text-sm tracking-wide uppercase px-2 py-1 transition-colors ${kind === 'question' ? 'text-[#e4a06e] border-b-2 border-[#e4a06e]' : 'text-white/40 hover:text-white/70'}`}
        >
          Ask Question
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {kind === 'referral' ? (
          <>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-white/50">Contact Name</label>
                <input required type="text" className="admin-input" value={formData.contact_name} onChange={e => setFormData({...formData, contact_name: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-white/50">Contact Email</label>
                <input required type="email" className="admin-input" value={formData.contact_email} onChange={e => setFormData({...formData, contact_email: e.target.value})} />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-white/50">Business Name</label>
                <input required type="text" className="admin-input" value={formData.business_name} onChange={e => setFormData({...formData, business_name: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-white/50">Phone (Optional)</label>
                <input type="text" className="admin-input" value={formData.contact_phone} onChange={e => setFormData({...formData, contact_phone: e.target.value})} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-white/50">Your Relationship to Them</label>
              <input required type="text" className="admin-input" placeholder="e.g., Former colleague, current client" value={formData.relationship} onChange={e => setFormData({...formData, relationship: e.target.value})} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-white/50">Context & Notes</label>
              <textarea required rows={4} className="admin-input resize-none" placeholder="What are they struggling with? Why are they a good fit?" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
            </div>
          </>
        ) : (
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest text-white/50">Your Question</label>
            <textarea required rows={4} className="admin-input resize-none" placeholder="Ask about the program, a specific potential referral, or white-labeling..." value={formData.question} onChange={e => setFormData({...formData, question: e.target.value})} />
          </div>
        )}

        <button 
          type="submit" 
          disabled={createSub.isPending}
          className="mt-6 w-full md:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-[#c76a47] via-[#e49a63] to-[#f0d9b5] text-[#25140d] font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {createSub.isPending ? 'Submitting...' : 'Submit to Foundry'} <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

function SubmissionHistory() {
  const { data: subs = [], isLoading } = useReferralSubmissions();

  if (isLoading) return <div className="text-white/50 text-sm">Loading history...</div>;
  
  if (subs.length === 0) {
    return (
      <div className="border border-white/5 border-dashed rounded-xl p-8 text-center text-white/40 text-sm">
        No submissions yet. Your referrals and questions will appear here.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {subs.map(sub => (
        <div key={sub.id} className="dashboard-card p-5 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded ${sub.kind === 'referral' ? 'bg-[#e4a06e]/20 text-[#e4a06e]' : 'bg-white/10 text-white/60'}`}>
                {sub.kind}
              </span>
              <span className="text-xs text-white/40">{new Date(sub.created_at).toLocaleDateString()}</span>
            </div>
            <h4 className="text-white font-medium">
              {sub.kind === 'referral' ? `${sub.contact_name} (${sub.business_name})` : sub.question?.substring(0, 50) + '...'}
            </h4>
          </div>
          
          {sub.kind === 'referral' && (
            <div className="flex gap-4 text-sm">
              <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase tracking-widest text-white/40">Status</span>
                <span className="text-white/80">{sub.status || 'Pending'}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase tracking-widest text-white/40">Payout</span>
                <span className="text-white/80">{sub.payout_status || 'N/A'}</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
