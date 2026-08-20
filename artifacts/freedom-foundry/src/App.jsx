import { ClerkProvider, SignIn, SignUp, useUser } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import PageNotFound from './lib/PageNotFound';
import ScrollToTop from './components/ScrollToTop';
import { Toaster } from '@/components/ui/toaster';
import Layout from '@/components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Vault from './pages/Vault';
import VaultItemDetail from './pages/VaultItemDetail';
import Workbooks from './pages/Workbooks';
import WorkbookPage from './pages/WorkbookPage';
import Settings from './pages/Settings';
import ServiceHub from './pages/ServiceHub';
import ServiceRequest from './pages/ServiceRequest';
import Contact from './pages/Contact';
import Podcast from './pages/Podcast';
import Billing from './pages/Billing';
import BrandPortal from './pages/BrandPortal';
import BrandPortalLayout from '@/components/layout/BrandPortalLayout';
import PersonalBrandProfile from './pages/PersonalBrandProfile';
import CorporateBrandProfile from './pages/CorporateBrandProfile';
import BigPicture from './pages/BigPicture';
import MediaKit from './pages/MediaKit';
import BrandGuidelines from './pages/BrandGuidelines';
import BrandAssets from './pages/BrandAssets';
import IgniteOS from './pages/IgniteOS';
import SharePage from './pages/SharePage';
import AdminUsers from './pages/AdminUsers';
import AdminUserDetail from './pages/AdminUserDetail';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import ProtectedRoute from '@/components/ProtectedRoute';
import BrandUp from './pages/BrandUp';
import BrandChecklist from './pages/BrandChecklist';
import RequestServices from './pages/RequestServices';
import BrandUpAdmin from './pages/BrandUpAdmin';

// ─── Clerk config ─────────────────────────────────────────────────────────────
const basePath = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

// Freedom Foundry brand colours (from CSS variables)
const primary   = '#b3232c';
const cardBg    = '#08080e';
const inputBg   = '#000000';
const border    = 'rgba(247, 242, 234, 0.08)';
const text      = '#f7f2ea';
const muted     = 'rgba(247, 242, 234, 0.5)';
const font      = "'Cormorant Garamond', 'Garamond', Georgia, serif";

const clerkAppearance = {
  theme: shadcn,
  // Tailwind 3 / PostCSS project — no cssLayerName needed
  options: {
    logoPlacement: 'inside',
    logoLinkUrl: basePath || '/',
    logoImageUrl: `${window.location.origin}${basePath}/forge-logo.png`,
  },
  variables: {
    colorPrimary:        primary,
    colorForeground:     text,
    colorMutedForeground: muted,
    colorDanger:         '#ef4444',
    colorBackground:     cardBg,
    colorInput:          inputBg,
    colorInputForeground: text,
    colorNeutral:        border,
    fontFamily:          font,
    borderRadius:        '0.5rem',
  },
  elements: {
    rootBox:   'w-full flex justify-center',
    cardBox:   'freedom-auth-card',
    card:      '!shadow-none !border-0 !bg-transparent !rounded-none',
    footer:    '!shadow-none !border-0 !bg-transparent !rounded-none',
    headerTitle:                 { color: text, fontFamily: font, fontSize: '1.875rem', fontWeight: '300' },
    headerSubtitle:              { color: muted },
    socialButtonsBlockButtonText:{ color: text },
    formFieldLabel:              { color: muted, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.1em' },
    footerActionLink:            { color: primary },
    footerActionText:            { color: muted },
    dividerText:                 { color: muted },
    identityPreviewEditButton:   { color: primary },
    formFieldSuccessText:        { color: '#4ade80' },
    alertText:                   { color: text },
    logoBox:                     'hidden',
    socialButtonsBlockButton:    'h-12 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-[#f7f2ea]',
    formButtonPrimary:           'h-12 rounded-xl bg-gradient-to-r from-[#b3232c] via-[#d9622c] to-[#f0d9b5] hover:opacity-90 text-white font-semibold tracking-wide',
    formFieldInput:              'h-12 rounded-xl border border-white/[0.08] bg-black/45 text-white placeholder:text-white/20',
    footerAction:                'bg-transparent',
    dividerLine:                 'bg-white/10',
    alert:                       'border border-red-700/30 bg-red-900/30',
    otpCodeFieldInput:           'rounded-xl border border-white/[0.08] bg-black/45 text-white',
    formFieldRow:                'mb-4',
    main:                        'px-8 py-8 sm:px-10 sm:py-10',
  },
};

// ─── Cache invalidation on user change ───────────────────────────────────────
function ClerkCacheInvalidator() {
  const { user } = useUser();
  const qc = useQueryClient();
  useEffect(() => {
    qc.clear();
  }, [user?.id]);
  return null;
}

// ─── Sign-in / Sign-up page wrappers ─────────────────────────────────────────
const EMBER_VIDEO = 'https://media.base44.com/videos/public/6a6982f0647238bf2b5d67bf/8d01159f7_rising-golden-embers-on-black-background-2025-12-17-19-25-08-utc.mp4';

function AuthBackground({ children }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a12]">
      {/* Ember video background */}
      <video
        autoPlay muted loop playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none"
        src={EMBER_VIDEO}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a12]/70 via-[#0a0a12]/40 to-[#0a0a12]/80 pointer-events-none" />
      {/* Brand wordmark */}
      <div className="absolute top-6 left-6 flex items-center gap-3 z-10">
        <img
          src={`${basePath}/forge-logo.png`}
          alt="Freedom Foundry"
          className="h-11 w-11 rounded-xl object-cover shadow-[0_0_14px_rgba(217,98,44,0.4)]"
        />
        <div className="flex flex-col leading-tight">
          <div className="font-heading text-xl font-medium tracking-[0.04em] text-[#f7f2ea]">FREEDOM FOUNDRY</div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-[#d9c9a3]">BY THE BRAND REVIVALIST</div>
        </div>
      </div>
      <div className="relative z-10 w-full max-w-md px-4">
        {children}
      </div>
    </div>
  );
}

function SignInPage() {
  return (
    <AuthBackground>
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
        fallbackRedirectUrl={`${basePath}/dashboard`}
      />
    </AuthBackground>
  );
}

function SignUpPage() {
  return (
    <AuthBackground>
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
        fallbackRedirectUrl={`${basePath}/dashboard`}
      />
    </AuthBackground>
  );
}

// ─── Main router ──────────────────────────────────────────────────────────────
function AppRoutes() {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#0a0a12]">
        <div className="w-8 h-8 border-4 border-[#4a1010] border-t-[#c0392b] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Legacy /login → /sign-in redirect */}
      <Route path="/login" element={<Navigate to="/sign-in" replace />} />
      <Route path="/register" element={<Navigate to="/sign-up" replace />} />
      <Route path="/forgot-password" element={<Navigate to="/sign-in" replace />} />
      <Route path="/reset-password" element={<Navigate to="/sign-in" replace />} />

      {/* Clerk auth routes — must be path-routed with /*? to handle OAuth callbacks */}
      <Route path="/sign-in/*?" element={<SignInPage />} />
      <Route path="/sign-up/*?" element={<SignUpPage />} />

      {/* Public share pages */}
      <Route path="/share/:token" element={<SharePage />} />
      <Route path="/member/:brandSlug/:profileType" element={<SharePage />} />

      {/* Root — redirect signed-in users to dashboard */}
      <Route
        path="/"
        element={isSignedIn ? <Navigate to="/dashboard" replace /> : <Navigate to="/sign-in" replace />}
      />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/vault" element={<Vault />} />
          <Route path="/vault/:id" element={<VaultItemDetail />} />
          <Route path="/workbooks" element={<Workbooks />} />
          <Route path="/workbooks/:id" element={<WorkbookPage />} />
          <Route path="/services" element={<ServiceHub />} />
          <Route path="/services/:type" element={<ServiceRequest />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/podcast" element={<Podcast />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/billing" element={<Billing />} />
          <Route element={<BrandPortalLayout />}>
            <Route path="/brand-portal" element={<BrandPortal />} />
            <Route path="/brand-portal/big-picture" element={<BigPicture />} />
            <Route path="/brand-portal/personal" element={<PersonalBrandProfile />} />
            <Route path="/brand-portal/corporate" element={<CorporateBrandProfile />} />
            <Route path="/brand-portal/guidelines" element={<BrandGuidelines />} />
            <Route path="/brand-portal/assets" element={<BrandAssets />} />
            <Route path="/brand-portal/media-kit" element={<MediaKit />} />
            <Route path="/brand-portal/ignite" element={<IgniteOS />} />
            <Route path="/brand-portal/brand-up" element={<BrandUp />} />
            <Route path="/brand-portal/checklist" element={<BrandChecklist />} />
            <Route path="/brand-portal/request-services" element={<RequestServices />} />
          </Route>
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/users/:id" element={<AdminUserDetail />} />
          <Route path="/admin/brand-up" element={<BrandUpAdmin />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
        </Route>
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      signInFallbackRedirectUrl={`${basePath}/dashboard`}
      signUpFallbackRedirectUrl={`${basePath}/dashboard`}
      localization={{
        signIn: { start: { title: 'Welcome back', subtitle: 'Sign in to your portal' } },
        signUp: { start: { title: 'Create your account', subtitle: 'Join Freedom Foundry' } },
      }}
    >
      <QueryClientProvider client={queryClientInstance}>
        <ClerkCacheInvalidator />
        <Router>
          <ScrollToTop />
          <AppRoutes />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default App;
