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
