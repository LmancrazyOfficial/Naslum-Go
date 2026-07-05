import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import Welcome from '@/pages/Welcome';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Home from '@/pages/Home';
import SearchResults from '@/pages/SearchResults';
import NaslumMail from '@/pages/NaslumMail';
import NaslumMarket from '@/pages/NaslumMarket';
import NaslumExtensions from '@/pages/NaslumExtensions';
import ImageSearch from '@/pages/ImageSearch';
import VideoSearch from '@/pages/VideoSearch';
import NaslumDocs from '@/pages/NaslumDocs';
import NaslumSlides from '@/pages/NaslumSlides';
import NaslumPolls from '@/pages/NaslumPolls';
import NaslumMusic from '@/pages/NaslumMusic';
import NaslumUpload from '@/pages/NaslumUpload';
import NaslumAppStore from '@/pages/NaslumAppStore';
import NaslumVideoEditor from '@/pages/NaslumVideoEditor';
import NaslumStocks from '@/pages/NaslumStocks';
import NaslumDrive from '@/pages/NaslumDrive';
import NaslumCustomize from '@/pages/NaslumCustomize';
import NaslumHelp from '@/pages/NaslumHelp';
import NaslumGames from '@/pages/NaslumGames';
import NaslumSettings from '@/pages/NaslumSettings';
import NaslumFriends from '@/pages/NaslumFriends';
import NaslumMessages from '@/pages/NaslumMessages';
import NaslumConsole from '@/pages/NaslumConsole';

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
      // Redirect to welcome page instead of directly to login
      return <Navigate to="/welcome" replace />;
    }
  }

  // Render the main app
  return (
    <Routes>
      {/* Public routes — accessible to everyone including guests */}
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Guest-accessible pages — work without an account */}
      <Route path="/" element={<Home />} />
      <Route path="/search" element={<SearchResults />} />
      <Route path="/images" element={<ImageSearch />} />
      <Route path="/videos" element={<VideoSearch />} />
      <Route path="/apps" element={<NaslumAppStore />} />
      <Route path="/games" element={<NaslumGames />} />
      <Route path="/help" element={<NaslumHelp />} />
      <Route path="/video-editor" element={<NaslumVideoEditor />} />
      <Route path="/console" element={<NaslumConsole />} />

      {/* Protected pages — require authentication */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/welcome" replace />} />}>
        <Route path="/mail" element={<NaslumMail />} />
        <Route path="/market" element={<NaslumMarket />} />
        <Route path="/friends" element={<NaslumFriends />} />
        <Route path="/messages" element={<NaslumMessages />} />
        <Route path="/docs" element={<NaslumDocs />} />
        <Route path="/slides" element={<NaslumSlides />} />
        <Route path="/polls" element={<NaslumPolls />} />
        <Route path="/music" element={<NaslumMusic />} />
        <Route path="/upload" element={<NaslumUpload />} />
        <Route path="/stocks" element={<NaslumStocks />} />
        <Route path="/drive" element={<NaslumDrive />} />
        <Route path="/extensions" element={<NaslumExtensions />} />
        <Route path="/customize" element={<NaslumCustomize />} />
        <Route path="/settings" element={<NaslumSettings />} />
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
