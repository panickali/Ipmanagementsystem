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
  const [, setLocation] = useLocation();

  useEffect(() => {
    // If not loading and user is not authenticated, redirect to auth page
    if (!isLoading && !user) {
      setLocation("/auth");
      return;
    }

    // If admin-only route but user is not admin, redirect to home
    if (!isLoading && user && adminOnly && !isAdmin) {
      setLocation("/");
      return;
    }

    // If route requires specific permission but user doesn't have it, redirect to home
    if (!isLoading && user && requiredPermission && !hasPermission(requiredPermission as any)) {
      setLocation("/");
      return;
    }
  }, [user, isLoading, isAdmin, hasPermission, setLocation, adminOnly, requiredPermission]);

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  // Create wrapper component with permission checking
  const RouteComponent = (props: any) => {
    // Only render if all conditions are met
    if (!user) return null; 
    if (adminOnly && !isAdmin) return null;
    if (requiredPermission && !hasPermission(requiredPermission as any)) return null;
    
    return <Component {...props} />;
  };

  return <Route path={path} component={RouteComponent} />;
}