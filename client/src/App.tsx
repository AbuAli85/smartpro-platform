import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Sidebar } from "./components/Sidebar";
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
import ChatInbox from "./pages/ChatInbox";
import ChatAnalytics from "./pages/ChatAnalytics";
import CannedResponses from "./pages/CannedResponses";
import StaffManagement from "./pages/StaffManagement";
import StaffPerformance from "./pages/StaffPerformance";
import FollowUpSettings from "./pages/FollowUpSettings";
import ContentTranslation from "./pages/ContentTranslation";
import TranslationRequestQueue from "./pages/TranslationRequestQueue";
import TranslationAnalytics from "./pages/TranslationAnalytics";
import TranslationQualityDashboard from "./pages/TranslationQualityDashboard";
import ReviewQueue from "./pages/ReviewQueue";
import SmartBatchProcessing from "./pages/SmartBatchProcessing";
import TranslatorTraining from "./pages/TranslatorTraining";
import NotificationPreferences from "./pages/NotificationPreferences";
import RequestServicePage from "./pages/RequestServicePage";
import MarketplaceBrowser from "./pages/MarketplaceBrowser";
import MyServiceRequests from "./pages/MyServiceRequests";
import OfficeRegistration from "./pages/OfficeRegistration";
import UserManagement from "./pages/UserManagement";
import OfficeVerification from "./pages/OfficeVerification";
import OnboardingWizard from "./pages/OnboardingWizard";
import OfficeAnalytics from "./pages/OfficeAnalytics";
import { useNotifications } from "./hooks/useNotifications";
import { useMarketplaceNotifications } from "./hooks/useMarketplaceNotifications";
import { SocketProvider } from "./contexts/SocketContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      
      {/* Sanad Offices */}
      <Route path="/offices" component={OfficesList} />
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
      <Route path="/my-requests" component={MyServiceRequests} />
      
      {/* Documents */}
      <Route path="/documents" component={MyDocuments} />
      
      {/* Admin Panel */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/users" component={UserManagement} />
      <Route path="/admin/office-verification" component={OfficeVerification} />
      <Route path="/admin/analytics" component={AdminAnalytics} />
      <Route path="/admin/translation-requests" component={TranslationRequestQueue} />
      <Route path="/admin/translation-analytics" component={TranslationAnalytics} />
      <Route path="/admin/translation-quality" component={TranslationQualityDashboard} />
      <Route path="/admin/review-queue" component={ReviewQueue} />
      <Route path="/admin/batch-processing" component={SmartBatchProcessing} />
      <Route path="/admin/training" component={TranslatorTraining} />
      
      {/* Office Dashboard */}
      <Route path="/office-dashboard" component={OfficeDashboard} />
      
      {/* Profile */}
      <Route path="/profile" component={Profile} />
      <Route path="/notifications" component={NotificationPreferences} />
      
      {/* Loyalty */}
      <Route path="/loyalty" component={LoyaltyDashboard} />
      <Route path="/refer" component={ReferFriends} />
      
      {/* Analytics */}
      <Route path="/analytics" component={Analytics} />
      <Route path="/admin/analytics" component={AdminAnalytics} />
      
      {/* Office Owner */}
      <Route path="/owner/dashboard" component={OfficeOwnerDashboard} />
      <Route path="/owner/analytics" component={OfficeAnalytics} />
      <Route path="/owner/templates" component={TemplateManager} />
      <Route path="/owner/chat" component={ChatInbox} />
      <Route path="/owner/chat-analytics" component={ChatAnalytics} />
      <Route path="/owner/canned-responses" component={CannedResponses} />
      <Route path="/owner/staff" component={StaffManagement} />
      <Route path="/owner/staff-performance" component={StaffPerformance} />
      <Route path="/owner/follow-up-settings" component={FollowUpSettings} />
      
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
          <TooltipProvider>
            <Toaster />
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto bg-background">
              <div className="transition-opacity duration-200">
                <Router />
              </div>
            </main>
          </div>
          </TooltipProvider>
        </SocketProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
