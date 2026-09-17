import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from './lib/theme';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminRoute from '@/components/AdminRoute';
import Layout from '@/components/layout/Layout';
import BrandPortalLayout from '@/components/layout/BrandPortalLayout';

// Auth routes — standalone (no main Layout), outside any auth guard
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import OAuthConsent from './pages/OAuthConsent';

// Public pages
import LandingPage from './pages/LandingPage';
import PortfolioPage from './pages/PortfolioPage';
import SharePage from './pages/SharePage';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

// Member pages
import Dashboard from './pages/Dashboard';
import Vault from './pages/Vault';
import VaultItemDetail from './pages/VaultItemDetail';
import Workbooks from './pages/Workbooks';
import WorkbookPage from './pages/WorkbookPage';
import ServiceHub from './pages/ServiceHub';
import ServiceRequest from './pages/ServiceRequest';
import Contact from './pages/Contact';
import Podcast from './pages/Podcast';
import Settings from './pages/Settings';
import Billing from './pages/Billing';
import BrandPortal from './pages/BrandPortal';
import PersonalBrandProfile from './pages/PersonalBrandProfile';
import CorporateBrandProfile from './pages/CorporateBrandProfile';
import BigPicture from './pages/BigPicture';
import BrandGuidelines from './pages/BrandGuidelines';
import BrandAssets from './pages/BrandAssets';
import MediaKit from './pages/MediaKit';
import IgniteOS from './pages/IgniteOS';
import BrandUp from './pages/BrandUp';
import BrandChecklist from './pages/BrandChecklist';

// Admin pages
import AdminUsers from './pages/AdminUsers';
import AdminUserDetail from './pages/AdminUserDetail';
import BrandUpAdmin from './pages/BrandUpAdmin';
import BrandPersonaQuiz from './pages/BrandPersonaQuiz';
import BrandPersonaQuizResults from './pages/BrandPersonaQuizResults';
import AdminQuizLeads from './pages/AdminQuizLeads';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin, isAuthenticated } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#100e0c]">
        <div className="w-8 h-8 border-4 border-[#3a2119] border-t-[#e4a06e] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/oauth/consent" element={<OAuthConsent />} />
      {/* Legacy Clerk-era paths */}
      <Route path="/sign-in" element={<Navigate to="/login" replace />} />
      <Route path="/sign-up" element={<Navigate to="/register" replace />} />

      {/* Public pages */}
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
      <Route path="/portfolio" element={<PortfolioPage />} />
      <Route path="/share/:token" element={<SharePage />} />
      <Route path="/member/:brandSlug/:profileType" element={<SharePage />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/brand-persona-quiz" element={<BrandPersonaQuiz />} />
      <Route path="/brand-persona-quiz/results" element={<BrandPersonaQuizResults />} />

      {/* Protected member + admin routes */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
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
            <Route path="/brand-portal/request-services" element={<ServiceRequest />} />
          </Route>
          <Route element={<AdminRoute />}>
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/users/:id" element={<AdminUserDetail />} />
            <Route path="/admin/brand-up" element={<BrandUpAdmin />} />
            <Route path="/admin/quiz-leads" element={<AdminQuizLeads />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <ThemeProvider>
          <Router>
            <ScrollToTop />
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </ThemeProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;