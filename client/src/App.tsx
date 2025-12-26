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
import { useNotifications } from "./hooks/useNotifications";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      
      {/* Sanad Offices */}
      <Route path="/offices" component={OfficesList} />
      <Route path="/offices/:slug" component={OfficeProfile} />
      <Route path="/create-office" component={CreateOffice} />
      <Route path="/my-offices" component={MyOffices} />
      
      {/* Document Templates */}
      <Route path="/templates" component={Templates} />
      <Route path="/templates/:id" component={TemplateDetail} />
      
      {/* Bookings */}
      <Route path="/offices/:slug/book" component={BookOffice} />
      <Route path="/bookings" component={BookingsList} />
      
      {/* Documents */}
      <Route path="/documents" component={MyDocuments} />
      
      {/* Admin */}
      <Route path="/admin" component={AdminDashboard} />
      
      {/* Office Dashboard */}
      <Route path="/office-dashboard" component={OfficeDashboard} />
      
      {/* Profile */}
      <Route path="/profile" component={Profile} />
      
      {/* Loyalty */}
      <Route path="/loyalty" component={LoyaltyDashboard} />
      <Route path="/refer" component={ReferFriends} />
      
      {/* Analytics */}
      <Route path="/analytics" component={Analytics} />
      <Route path="/admin/analytics" component={AdminAnalytics} />
      
      {/* Office Owner */}
      <Route path="/owner/dashboard" component={OfficeOwnerDashboard} />
      <Route path="/owner/templates" component={TemplateManager} />
      <Route path="/owner/chat" component={ChatInbox} />
      <Route path="/owner/chat-analytics" component={ChatAnalytics} />
      <Route path="/owner/canned-responses" component={CannedResponses} />
      <Route path="/owner/staff" component={StaffManagement} />
      
      {/* 404 */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Initialize real-time notifications
  useNotifications();

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
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
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
