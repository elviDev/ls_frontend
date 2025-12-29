"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api-client";

type User = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isApproved: boolean;
  profilePicture?: string | null;
  userType: 'user' | 'staff';
  firstName?: string;
  lastName?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string; user?: User }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const router = useRouter();
  const { toast } = useToast();

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
    
    // Set up unauthorized handler
    apiClient.setUnauthorizedHandler(() => {
      setUser(null);
      setIsAuthenticated(false);
      router.push("/signin");
      toast({
        title: "Session Expired",
        description: "Please log in again to continue.",
        variant: "destructive",
      });
    });
  }, []);

  const checkAuth = async () => {
    try {
      const data = await apiClient.auth.me();
      if (data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      const data = await apiClient.auth.login({ email, password, rememberMe });
      setUser(data.user);
      setIsAuthenticated(true);
      toast({
        title: "Welcome back!",
        description: "You have been successfully logged in.",
      });
      return { success: true, user: data.user };
    } catch (error: any) {
      const errorMessage = error.message || "Login failed";
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, error: errorMessage };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const data = await apiClient.auth.register({ name, email, password });
      if (data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
      }
      toast({
        title: "Account Created!",
        description: "Your account has been successfully created.",
      });
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || "Registration failed";
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await apiClient.auth.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      router.push("/signin");
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
