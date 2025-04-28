import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import IPDetailsPage from "@/pages/ip-details-page";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/ip/:id" component={IPDetailsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

// This is a separate AuthWrapper component to ensure proper context usage
function AuthWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      {/* We are adding AuthProvider here and removing from main.tsx to prevent nested providers */}
      <AuthWrapper>
        <Router />
      </AuthWrapper>
    </TooltipProvider>
  );
}

export default App;
