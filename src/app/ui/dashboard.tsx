'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAuthenticatedUser } from '../services/auth';
import { useAuth } from '../context/auth-content';

// UserData type is now defined and managed by AuthContext.tsx
// type UserData = { ... };

export default function Dashboard() {
  // Get global auth state and logout function from context
  const { user, isAuthenticated, isLoading } = useAuth();

  // Local state for dashboard-specific UI feedback
  const [error, setError] = useState<string | null>(null);
  // const [homeDataMessage, setHomeDataMessage] = useState<string | null>(null);

  const router = useRouter();

  // useEffect to redirect if user becomes unauthenticated after the initial check
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log("Dashboard useEffect: Global auth check complete, user not authenticated, redirecting to login.");
      router.push('/login');
    }
    // Effect depends on global auth state and router
  }, [isLoading, isAuthenticated, router]);

  // Handle click for testing fetching authenticated data
  // async function handleFetchHomeClick() {
  //   setHomeDataMessage('Fetching Home data...');
  //   try {
  //     const data = await fetchHomeData();
  //     setHomeDataMessage(`Home data: ${data.message}`);
  //     console.log("Successfully fetched Home data:", data);
  //   } catch (error) {
  //     setHomeDataMessage(`Failed to fetch Home data: ${error.message}`);
  //     console.error("Error fetching Home data:", error);
  //     // Consider checking for 401 here and potentially logging out/redirecting if access token expired and refresh failed
  //   }
  // }

  // Handle click for logging out the user
  // Render logic based on global auth state (isLoading, isAuthenticated, user)
  if (isLoading) {
    return <p>Loading user data...</p>;
  }

  // If not loading and not authenticated, the useEffect should redirect.
  // This provides a fallback UI if redirect is delayed or fails.
  if (!isAuthenticated) {
    return <p>You are not authenticated. Redirecting...</p>;
  }

  // If not loading and isAuthenticated is true, user object should be available from context
  if (user) {
    return (
      <div>
        <h1>Hello, {user.username}!</h1>


        {error && <div style={{ color: 'red' }}>{error}</div>}

      </div>
    );
  }

  // Fallback case (should ideally not be reached in a correct flow)
  return null;
}
