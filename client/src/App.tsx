import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Sidebar } from "@/components/Sidebar";
import { BottomNavigation } from "@/components/BottomNavigation";
import { OfflineBanner } from "@/components/OfflineBanner";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import Home from "./pages/Home";
import OfficesList from "./pages/OfficesList";
import OfficeProfile from "./pages/OfficeProfile";
import AdvancedSearch from "./pages/AdvancedSearch";
import CreateOffice from "./pages/CreateOffice";
import MyOffices from "./pages/MyOffices";
import Templates from "./pages/Templates";
import TemplateDetail from "./pages/TemplateDetail";
import BookingsList from "./pages/BookingsList";
import BookOffice from "./pages/BookOffice";
import MyDocuments from "./pages/MyDocuments";
import AdminDashboard from "./pages/AdminDashboard";
import OfficeDashboard from "./pages/OfficeDashboard";
import Profile from "./pages/Profile";
import LoyaltyDashboard from "./pages/LoyaltyDashboard";
import ReferFriends from "./pages/ReferFriends";
import Analytics from "./pages/Analytics";
import AdminAnalytics from "./pages/AdminAnalytics";
import OfficeOwnerDashboard from "./pages/OfficeOwnerDashboard";
import TemplateManager from "./pages/TemplateManager";
import TemplateUploadManager from "./pages/TemplateUploadManager";
import ChatInbox from "./pages/ChatInbox";
import ChatAnalytics from "./pages/ChatAnalytics";
import CannedResponses from "./pages/CannedResponses";
import StaffManagement from "./pages/StaffManagement";
import StaffPerformance from "./pages/StaffPerformance";
import FollowUpSettings from "./pages/FollowUpSettings";
import ContentTranslation from "./pages/ContentTranslation";
import TranslationRequestQueue from "./pages/TranslationRequestQueue";
import TranslationAnalytics from "./pages/TranslationAnalytics";
import RegionalStatistics from "./pages/RegionalStatistics";
import RegionalLeaderboards from "./pages/RegionalLeaderboards";
import TranslationQualityDashboard from "./pages/TranslationQualityDashboard";
import ReviewQueue from "./pages/ReviewQueue";
import SmartBatchProcessing from "./pages/SmartBatchProcessing";
import TranslatorTraining from "./pages/TranslatorTraining";
import TranslationManagement from "./pages/TranslationManagement";
import NotificationPreferences from "./pages/NotificationPreferences";
import LanguageSettings from "./pages/LanguageSettings";
import AuthError from "./pages/AuthError";
import RequestServicePage from "./pages/RequestServicePage";
import RequestServiceWizard from "./pages/RequestServiceWizard";
import RequestSuccessPage from "./pages/RequestSuccessPage";
import MarketplaceBrowser from "./pages/MarketplaceBrowser";
import MyServiceRequests from "./pages/MyServiceRequests";
import OfficeRegistration from "./pages/OfficeRegistration";
import ServiceCatalog from "./pages/ServiceCatalog";
import ServiceBundles from "./pages/ServiceBundles";
import DocumentExpiryDashboard from "./pages/DocumentExpiryDashboard";
import CustomerReviews from "./pages/CustomerReviews";
import BundleAnalytics from "./pages/BundleAnalytics";
import BundleRecommendations from "./pages/BundleRecommendations";
import UserManagement from "./pages/UserManagement";
import OfficeVerification from "./pages/OfficeVerification";
import OnboardingWizard from "./pages/OnboardingWizard";
import OfficeAnalytics from "./pages/OfficeAnalytics";
import OfficeRequestMessages from "./pages/OfficeRequestMessages";
import AuditLogs from "./pages/AuditLogs";
import MFASettings from "./pages/MFASettings";
import { VerifyEmail } from "./pages/VerifyEmail";
import { RequestPasswordReset } from "./pages/RequestPasswordReset";
import { ResetPassword } from "./pages/ResetPassword";
import { SessionManagement } from "./pages/SessionManagement";
import SecurityDashboard from "./pages/admin/SecurityDashboard";
import LoginAnalytics from "./pages/admin/LoginAnalytics";
import ClientList from "./pages/ClientList";
import ClientProfile from "./pages/ClientProfile";
import FinancialDashboard from "./pages/FinancialDashboard";
import { useNotifications } from "./hooks/useNotifications";
import { useMarketplaceNotifications } from "./hooks/useMarketplaceNotifications";
import { SocketProvider } from "./contexts/SocketContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      
      {/* Sanad Offices */}
      <Route path="/offices" component={OfficesList} />
      <Route path="/leaderboards" component={RegionalLeaderboards} />
      <Route path="/search" component={AdvancedSearch} />
      <Route path="/offices/:id" component={OfficeProfile} />
      <Route path="/register-office" component={OfficeRegistration} />
      <Route path="/onboarding" component={OnboardingWizard} />
      <Route path="/create-office" component={CreateOffice} />
      <Route path="/my-offices" component={MyOffices} />
      
      {/* Document Templates */}
      <Route path="/templates" component={Templates} />
      <Route path="/templates/:id" component={TemplateDetail} />
      
      {/* Bookings */}
      <Route path="/offices/:id/book" component={BookOffice} />
      <Route path="/bookings" component={BookingsList} />
      
      {/* Marketplace */}
      <Route path="/request-service" component={RequestServicePage} />
      <Route path="/marketplace" component={MarketplaceBrowser} />
      <Route path="/marketplace/request" component={RequestServiceWizard} />
      <Route path="/marketplace/requests/:id/success" component={RequestSuccessPage} />
      <Route path="/my-requests" component={MyServiceRequests} />
      <Route path="/my-service-requests" component={MyServiceRequests} />
      
      {/* Documents */}
      <Route path="/documents" component={MyDocuments} />
      
      {/* Admin Panel */}
      <Route path="/admin">
        <ProtectedRoute requirePermission="canAccessAdminPanel">
          <AdminDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/users">
        <ProtectedRoute requirePermission="canManageUsers">
          <UserManagement />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/office-verification">
        <ProtectedRoute requirePermission="canVerifyOffices">
          <OfficeVerification />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/audit-logs">
        <ProtectedRoute requirePermission="canAccessAdminPanel">
          <AuditLogs />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/analytics">
        <ProtectedRoute requirePermission="canViewSystemAnalytics">
          <AdminAnalytics />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/translation-requests">
        <ProtectedRoute requirePermission="canManageTranslations">
          <TranslationRequestQueue />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/translation-analytics">
        <ProtectedRoute requirePermission="canManageTranslations">
          <TranslationAnalytics />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/regional-statistics">
        <ProtectedRoute requirePermission="canViewSystemAnalytics">
          <RegionalStatistics />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/translation-quality">
        <ProtectedRoute requirePermission="canManageTranslations">
          <TranslationQualityDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/review-queue">
        <ProtectedRoute requirePermission="canManageTranslations">
          <ReviewQueue />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/batch-processing">
        <ProtectedRoute requirePermission="canManageTranslations">
          <SmartBatchProcessing />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/training">
        <ProtectedRoute requirePermission="canManageTranslations">
          <TranslatorTraining />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/translation-management">
        <ProtectedRoute requirePermission="canManageTranslations">
          <TranslationManagement />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/security-dashboard">
        <ProtectedRoute requirePermission="canAccessAdminPanel">
          <SecurityDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/login-analytics">
        <ProtectedRoute requirePermission="canAccessAdminPanel">
          <LoginAnalytics />
        </ProtectedRoute>
      </Route>
      
      {/* Office Dashboard */}
      <Route path="/office-dashboard">
        <ProtectedRoute requirePermission="canManageOffice">
          <OfficeDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/service-catalog">
        <ProtectedRoute requirePermission="canManageOffice">
          <ServiceCatalog />
        </ProtectedRoute>
      </Route>
      <Route path="/service-bundles">
        <ProtectedRoute requirePermission="canManageOffice">
          <ServiceBundles />
        </ProtectedRoute>
      </Route>
      <Route path="/document-expiry">
        <ProtectedRoute requirePermission="canManageOffice">
          <DocumentExpiryDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/customer-reviews">
        <ProtectedRoute requirePermission="canManageOffice">
          <CustomerReviews />
        </ProtectedRoute>
      </Route>
      <Route path="/bundle-analytics">
        <ProtectedRoute requirePermission="canManageOffice">
          <BundleAnalytics />
        </ProtectedRoute>
      </Route>
      <Route path="/bundle-recommendations">
        <ProtectedRoute requirePermission="canManageOffice">
          <BundleRecommendations />
        </ProtectedRoute>
      </Route>
      <Route path="/office-messages">
        <ProtectedRoute requirePermission="canManageOffice">
          <OfficeRequestMessages />
        </ProtectedRoute>
      </Route>
      
      {/* Client Management */}
      <Route path="/clients">
        <ProtectedRoute requirePermission="canManageOffice">
          <ClientList />
        </ProtectedRoute>
      </Route>
      <Route path="/clients/:id">
        <ProtectedRoute requirePermission="canManageOffice">
          <ClientProfile />
        </ProtectedRoute>
      </Route>
      
      {/* Profile */}
      <Route path="/profile" component={Profile} />
      <Route path="/notifications" component={NotificationPreferences} />
      <Route path="/language-settings" component={LanguageSettings} />
      <Route path="/auth-error" component={AuthError} />
      <Route path="/security/mfa" component={MFASettings} />
      
      {/* Account Recovery */}
      <Route path="/verify-email" component={VerifyEmail} />
      <Route path="/request-password-reset" component={RequestPasswordReset} />
      <Route path="/reset-password" component={ResetPassword} />
      
      {/* Session Management */}
      <Route path="/security/sessions" component={SessionManagement} />
      
      {/* Loyalty */}
      <Route path="/loyalty" component={LoyaltyDashboard} />
      <Route path="/refer" component={ReferFriends} />
      
      {/* Analytics */}
      <Route path="/analytics" component={Analytics} />
      <Route path="/admin/analytics" component={AdminAnalytics} />
      
      {/* Office Owner */}
      <Route path="/owner/dashboard">
        <ProtectedRoute requirePermission="canViewOfficeAnalytics">
          <OfficeOwnerDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/owner/analytics">
        <ProtectedRoute requirePermission="canViewOfficeAnalytics">
          <OfficeAnalytics />
        </ProtectedRoute>
      </Route>
      <Route path="/owner/financial">
        <ProtectedRoute requirePermission="canManageOffice">
          <FinancialDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/owner/templates">
        <ProtectedRoute requirePermission="canManageTemplates">
          <TemplateManager />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/template-upload">
        <ProtectedRoute requirePermission="canManageTemplates">
          <TemplateUploadManager />
        </ProtectedRoute>
      </Route>
      <Route path="/owner/chat">
        <ProtectedRoute requirePermission="canAccessChatInbox">
          <ChatInbox />
        </ProtectedRoute>
      </Route>
      <Route path="/owner/chat-analytics">
        <ProtectedRoute requirePermission="canViewChatAnalytics">
          <ChatAnalytics />
        </ProtectedRoute>
      </Route>
      <Route path="/owner/canned-responses">
        <ProtectedRoute requirePermission="canManageCannedResponses">
          <CannedResponses />
        </ProtectedRoute>
      </Route>
      <Route path="/owner/staff">
        <ProtectedRoute requirePermission="canManageStaff">
          <StaffManagement />
        </ProtectedRoute>
      </Route>
      <Route path="/owner/staff-performance">
        <ProtectedRoute requirePermission="canManageStaff">
          <StaffPerformance />
        </ProtectedRoute>
      </Route>
      <Route path="/owner/follow-up-settings">
        <ProtectedRoute requirePermission="canManageOffice">
          <FollowUpSettings />
        </ProtectedRoute>
      </Route>
      
      {/* 404 */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Initialize real-time notifications
  useNotifications();
  useMarketplaceNotifications();

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <SocketProvider>
          <NotificationProvider>
            <TooltipProvider>
            <Toaster />
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <OfflineBanner />
            <main className="flex-1 overflow-y-auto bg-background pb-16 lg:pb-0">
              <div className="transition-opacity duration-200">
                <Router />
              </div>
            </main>
            <BottomNavigation />
            <PWAInstallPrompt />
          </div>
            </TooltipProvider>
          </NotificationProvider>
        </SocketProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
