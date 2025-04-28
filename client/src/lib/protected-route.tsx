import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route, useLocation } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  return (
    <Route path={path}>
      {(params) => {
        try {
          const { user, isLoading } = useAuth();
          const [, navigate] = useLocation();
          
          if (isLoading) {
            return (
              <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-border" />
              </div>
            );
          }
          
          if (!user) {
            // Use navigate instead of Redirect for more reliable redirection
            navigate("/auth");
            return null;
          }
          
          return <Component />;
        } catch (error) {
          console.error("Error in ProtectedRoute:", error);
          return (
            <div className="flex flex-col items-center justify-center min-h-screen">
              <p className="text-red-500 mb-4">Authentication error</p>
              <a href="/auth" className="text-blue-500 underline">Go to login page</a>
            </div>
          );
        }
      }}
    </Route>
  );
}
