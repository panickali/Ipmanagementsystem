import { Route, useLocation } from "wouter";
import { useAuth } from "../hooks/use-auth";
import { useEffect } from "react";

export function ProtectedRoute({ component: Component, path }: { component: React.ComponentType, path: string }) {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/auth");
    }
  }, [isAuthenticated, setLocation]);

  return (
    <Route
      path={path}
      component={isAuthenticated ? Component : () => null}
    />
  );
}