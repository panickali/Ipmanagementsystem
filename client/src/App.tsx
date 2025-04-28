
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { Route, Switch } from "wouter";
import AuthPage from "./pages/auth-page";
import HomePage from "./pages/home-page";
import IPDetailsPage from "./pages/ip-details-page";
import AdminDashboard from "./pages/admin-dashboard";
import NotFound from "./pages/not-found";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";

function App() {
  return (
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Switch>
          <Route path="/auth" component={AuthPage} />
          <ProtectedRoute path="/" component={HomePage} />
          <ProtectedRoute path="/ip/:id" component={IPDetailsPage} />
          <ProtectedRoute path="/admin" component={AdminDashboard} adminOnly={true} />
          <Route component={NotFound} />
        </Switch>
      </TooltipProvider>
    </AuthProvider>
  );
}

export default App;
