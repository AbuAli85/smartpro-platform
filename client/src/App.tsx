import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import OfficesList from "./pages/OfficesList";
import OfficeProfile from "./pages/OfficeProfile";
import CreateOffice from "./pages/CreateOffice";
import MyOffices from "./pages/MyOffices";
import TemplatesList from "./pages/TemplatesList";
import TemplateView from "./pages/TemplateView";
import BookingsList from "./pages/BookingsList";
import MyDocuments from "./pages/MyDocuments";

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
      <Route path="/templates" component={TemplatesList} />
      <Route path="/templates/:id" component={TemplateView} />
      
      {/* Bookings */}
      <Route path="/bookings" component={BookingsList} />
      
      {/* Documents */}
      <Route path="/documents" component={MyDocuments} />
      
      {/* 404 */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
