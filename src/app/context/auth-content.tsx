'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { fetchAuthenticatedUser } from "../services/auth";

// Define the shape of the user data
type User = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

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
  loginSuccess: () => { },
  logoutSuccess: () => { },
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
      setIsLoading(true);
      try {
        const authenticatedUser = await fetchAuthenticatedUser();
        if (authenticatedUser) {
          setUser(authenticatedUser);
          setIsAuthenticated(true);
          console.log("AuthContext: User authenticated on app load.");
        } else {
          setUser(null);
          setIsAuthenticated(false);
          console.log("AuthContext: User not authenticated on app load.");
        }
      } catch (error) {
        console.error("AuthContext: Error during initial auth check", error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
        console.log("AuthContext: Initial auth check complete.")
      }
    }

    checkAuthentication();
  }, []);

  // Function called by login component after successful API login
  const loginSuccess = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
    setIsLoading(false); // Authentication check is implicitly done by logging in
    console.log("AuthContext: State updated - User logged in.");
  }

  // Function called by logout component after successful API logout
  const logoutSuccess = () => {
    setUser(null);
    setIsAuthenticated(false);
    console.log("AuthContext: State updated - User logged out.");
  }

  return (
    < AuthContext.Provider value={{ user, isAuthenticated, isLoading, loginSuccess, logoutSuccess }
    }>
      {children}
    </AuthContext.Provider >
  )
}
