import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
// Add page imports here
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
import SharePage from './pages/SharePage';
import AdminUsers from './pages/AdminUsers';
import AdminUserDetail from './pages/AdminUserDetail';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import OAuthConsent from './pages/OAuthConsent';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      {/* Auth routes — standalone (no main Layout), outside any auth guard */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/oauth/consent" element={<OAuthConsent />} />
      {/* Add your page Route elements here */}
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
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
          <Route path="/brand-portal/personal" element={<PersonalBrandProfile />} />
          <Route path="/brand-portal/corporate" element={<CorporateBrandProfile />} />
          <Route path="/big-picture" element={<BigPicture />} />
          <Route path="/media-kit" element={<MediaKit />} />
        </Route>
        <Route path="/share/:token" element={<SharePage />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/users/:id" element={<AdminUserDetail />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App