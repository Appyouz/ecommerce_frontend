'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { fetchAuthenticatedUser, clearAuthTokens } from "@/services/auth";
import { User } from "@/types";

// Define the shape of Authentication context state and functions
type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginSuccess: (user: User) => void;
  logoutSuccess: () => void;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  loginSuccess: () => { console.log("loginSuccess not implemented yet."); },
  logoutSuccess: () => { console.log("logoutSuccess not implemented yet."); },
})

// Custom hook to easily consume auth context
export const useAuth = () => useContext(AuthContext);

// AuthProvider component: Manages authentication state and provides it via context
type AuthProviderProps = {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  // State managed within the provider
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // useEffect for initial authentication check when the provider mounts
  useEffect(() => {
    async function checkAuthentication() {
      setIsLoading(true); // Indicate loading state
      try {
        const authenticatedUser = await fetchAuthenticatedUser(); // This uses requestWithAuth internally
        if (authenticatedUser) {
          setUser(authenticatedUser);
          setIsAuthenticated(true);
          console.log("AuthContext: User authenticated on app load.");
          /*temporary debugging*/
          console.log("AuthContext: User data on load:", authenticatedUser);
        } else {
          // If fetchAuthenticatedUser returns null (e.g., token expired or no token)
          setUser(null);
          setIsAuthenticated(false);
          // Explicitly clear tokens from localStorage if not authenticated on load
          // This covers cases where tokens might be stale but not yet cleared by requestWithAuth
          clearAuthTokens();
          console.log("AuthContext: User not authenticated on app load. Tokens cleared.");
        }
      } catch (error) {
        console.error("AuthContext: Error during initial auth check", error);
        // On any error during initial check, assume not authenticated and clear tokens
        setUser(null);
        setIsAuthenticated(false);
        clearAuthTokens();
      } finally {
        setIsLoading(false); // End loading state
        console.log("AuthContext: Initial auth check complete.")
      }
    }

    checkAuthentication();
  }, []); // Empty dependency array means this runs once on mount

  // Function called by login component after successful API login
  const loginSuccess = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
    setIsLoading(false); // Authentication check is implicitly done by logging in
    console.log("AuthContext: State updated - User logged in.");
    console.log("AuthContext: User data on login:", userData);
  }

  // Function called when the user explicitly logs out OR when an authentication failure
  // (like a failed token refresh) occurs that requires full re-login.
  const logoutSuccess = () => {
    clearAuthTokens(); // CRITICAL: Clear tokens from localStorage
    setUser(null);
    setIsAuthenticated(false);
    console.log("AuthContext: State updated - User logged out. Tokens cleared.");
    // Optionally, redirect to login page here or let the component that calls logoutSuccess handle it.
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, loginSuccess, logoutSuccess }}>
      {children}
    </AuthContext.Provider>
  )
}
