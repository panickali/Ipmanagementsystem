import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type LoginData = Pick<InsertUser, "username" | "password">;

// Define the Auth Context Type explicitly for better error checking
interface AuthContextValue {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  hasPermission: (permission: keyof SelectUser) => boolean;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, InsertUser>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  // User data query
  const {
    data: user,
    error,
    isLoading,
    refetch: refetchUser
  } = useQuery<SelectUser | undefined, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    staleTime: 0, // Don't cache this query to ensure fresh data
    refetchOnWindowFocus: true, // Refetch when window regains focus
    retry: 1, // Retry once in case of network issues
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      // Invalidate and refetch user data after login
      queryClient.setQueryData(["/api/user"], user);
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      refetchUser(); // Force immediate refetch
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.name}!`,
      });
      
      // Redirect after successful login
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: InsertUser) => {
      const res = await apiRequest("POST", "/api/register", userData);
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      // Update cache and refetch
      queryClient.setQueryData(["/api/user"], user);
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      refetchUser(); // Force immediate refetch
      
      toast({
        title: "Registration successful",
        description: `Welcome, ${user.name}!`,
      });
      
      // Redirect after successful registration
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message || "Username or email already exists",
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Admin helpers
  const isAdmin = !!user && (user.role === 'admin' || user.role === 'superadmin');
  const isSuperAdmin = !!user && user.role === 'superadmin';
  
  const hasPermission = (permission: keyof SelectUser): boolean => {
    if (!user) return false;
    if (user.role === 'superadmin') return true;
    return !!user[permission];
  };

  // Create the context value object
  const value: AuthContextValue = {
    user: user ?? null,
    isLoading,
    error,
    isAdmin,
    isSuperAdmin,
    hasPermission,
    loginMutation,
    logoutMutation,
    registerMutation,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export { AuthProvider, useAuth };
