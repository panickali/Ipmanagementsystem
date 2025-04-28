import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Redirect } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck, Database, Lock } from "lucide-react";

// Login form schema
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Registration form schema
const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const Feature = ({ icon, title, description }: FeatureProps) => (
  <div className="flex items-start">
    <div className="flex-shrink-0 bg-white/10 p-2 rounded-lg mr-4">
      {icon}
    </div>
    <div>
      <h3 className="text-xl font-semibold mb-1">{title}</h3>
      <p className="text-white/80">{description}</p>
    </div>
  </div>
);

const AuthPage = () => {
  // Set page title
  useEffect(() => {
    document.title = "Login | IP Chain";
  }, []);
  
  // State to track auth errors
  const [authError, setAuthError] = useState(false);
  
  // Setup forms first
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      name: "",
      email: "",
      password: "",
    },
  });
  
  // Get auth context
  const { 
    user, 
    isLoading, 
    loginMutation, 
    registerMutation 
  } = useAuth();

  // After successful login/register, redirect to home
  useEffect(() => {
    if (user) {
      console.log("User authenticated, redirecting to /");
      window.location.href = "/"; // Force full page navigation
    }
  }, [user]);
  
  // Show loading spinner during authentication check
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Don't render the login form if user is already authenticated
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Redirecting...</span>
      </div>
    );
  }
  
  // Show error UI if auth context failed
  if (authError) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Authentication Error</h2>
          <p className="mb-4">There was a problem loading the authentication service. Please try refreshing the page.</p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-primary hover:bg-primary-dark"
          >
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }
  
  // Define submission handlers
  const onLoginSubmit = (data: LoginFormValues) => {
    if (loginMutation) {
      loginMutation.mutate(data);
    }
  };

  const onRegisterSubmit = (data: RegisterFormValues) => {
    if (registerMutation) {
      registerMutation.mutate({
        ...data,
        role: "user", // Default role
      });
    }
  };

  // Main auth UI
  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl w-full flex flex-col lg:flex-row gap-8">
        {/* Left side: Auth forms */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="w-full max-w-md mx-auto">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-primary">IP Chain</h1>
              <p className="mt-2 text-neutral-600">Secure your intellectual property with blockchain</p>
            </div>
            
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Card>
                  <CardHeader>
                    <CardTitle>Welcome Back</CardTitle>
                    <CardDescription>
                      Sign in to access your IP management dashboard
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your username" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder="Enter your password" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full bg-primary hover:bg-primary-dark"
                          disabled={loginMutation?.isPending}
                        >
                          {loginMutation?.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Signing in...
                            </>
                          ) : (
                            "Sign in"
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="register">
                <Card>
                  <CardHeader>
                    <CardTitle>Create an Account</CardTitle>
                    <CardDescription>
                      Register to start managing your intellectual property
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                        <FormField
                          control={registerForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input placeholder="Choose a username" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your full name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input 
                                  type="email" 
                                  placeholder="Enter your email" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder="Create a password" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full bg-primary hover:bg-primary-dark"
                          disabled={registerMutation?.isPending}
                        >
                          {registerMutation?.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating account...
                            </>
                          ) : (
                            "Create Account"
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        {/* Right side: Hero/Info */}
        <div className="flex-1 bg-gradient-to-br from-primary to-primary-dark text-white p-8 rounded-lg hidden lg:flex lg:flex-col lg:justify-center">
          <h2 className="text-3xl font-bold mb-6">Protect Your Intellectual Property with Blockchain Technology</h2>
          <p className="text-lg mb-8">
            Secure, transparent, and immutable registration of your IP assets with GDPR compliance built-in.
          </p>
          
          <div className="space-y-6">
            <Feature 
              icon={<ShieldCheck className="h-8 w-8 text-white" />}
              title="Secure Verification"
              description="Immutably verify ownership and existence of your IP assets on the blockchain"
            />
            <Feature 
              icon={<Database className="h-8 w-8 text-white" />}
              title="Decentralized Storage"
              description="Store your assets securely with IPFS decentralized storage"
            />
            <Feature 
              icon={<Lock className="h-8 w-8 text-white" />}
              title="GDPR Compliant"
              description="Full compliance with data protection regulations and right to be forgotten"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;