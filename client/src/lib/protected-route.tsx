import { Route, useLocation } from "wouter";
import { useAuth } from "../hooks/use-auth";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ 
  component: Component, 
  path,
  adminOnly = false,
  requiredPermission,
}: { 
  component: React.ComponentType<any>;
  path: string;
  adminOnly?: boolean;
  requiredPermission?: string;
}) {
  const { user, isLoading, isAdmin, hasPermission } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (isLoading) return; // Don't redirect while loading
    
    // If user is not authenticated, redirect to auth page
    if (!user) {
      console.log("Not authenticated, redirecting to /auth");
      setLocation("/auth");
      return;
    }

    // If admin-only route but user is not admin, redirect to home
    if (user && adminOnly && !isAdmin) {
      console.log("Not admin, redirecting to /");
      setLocation("/");
      return;
    }

    // If route requires specific permission but user doesn't have it, redirect to home
    if (user && requiredPermission && !hasPermission(requiredPermission as any)) {
      console.log(`Missing permission ${requiredPermission}, redirecting to /`);
      setLocation("/");
      return;
    }
  }, [user, isLoading, isAdmin, hasPermission, setLocation, adminOnly, requiredPermission, location]);

  // Show loading state while authentication is being checked
  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  // If not authenticated, don't render anything (will redirect in useEffect)
  if (!user) {
    return <Route path={path}><div /></Route>;
  }

  // If admin check fails, don't render anything (will redirect in useEffect)
  if (adminOnly && !isAdmin) {
    return <Route path={path}><div /></Route>;
  }

  // If permission check fails, don't render anything (will redirect in useEffect)
  if (requiredPermission && !hasPermission(requiredPermission as any)) {
    return <Route path={path}><div /></Route>;
  }

  // If all checks pass, render the component
  return <Route path={path} component={Component} />;
}