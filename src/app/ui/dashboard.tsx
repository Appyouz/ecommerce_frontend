'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAuthenticatedUser, fetchHomeData, logoutUser } from '../services/auth';

type UserData = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
};

export default function Dashboard() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [homeDataMessage, setHomeDataMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadUserData() {
      setLoading(true);
      setError(null);

      try {
        const authenticatedUser = await fetchAuthenticatedUser();

        if (authenticatedUser) {
          setUser(authenticatedUser);
          console.log("Dashboard: Authenticated user loaded.");
        } else {
          console.log("Dashboard: User not authenticated, redirecting to login.");
          router.push('/login');
          return;
        }

      } catch (err) {
        console.error("Dashboard: Error fetching user data:", err);
        setError("Failed to load user data. Please try logging in again.");
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, [router]);

  async function handleFetchHomeClick() {
    setHomeDataMessage('Fetching Home data...');
    try {
      const data = await fetchHomeData();
      setHomeDataMessage(`Home data: ${data.message}`);
      console.log("Successfully fetched Home data:", data);
    } catch (error) {
      setHomeDataMessage(`Failed to fetch Home data: ${error.message}`);
      console.error("Error fetching Home data:", error);
    }
  }

  async function handleLogout() {
    try {
      await logoutUser();
      console.log("Logout successful on backend and frontend state cleared.");
      router.push('/login');
    } catch (error) {
      console.error("Error during frontend logout process:", error);
      setError("Failed to log out.");
    }
  }

  if (loading) {
    return <p>Loading user data...</p>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  if (user) {
    return (
      <div>
        <h1>Hello, {user.username}!</h1>
        <button type="button" onClick={handleFetchHomeClick} style={{ marginLeft: '10px' }}>
          Test Fetch Home Data
        </button>
        {homeDataMessage && (
          <p>{homeDataMessage}</p>
        )}
        <button type="button" onClick={handleLogout} style={{ marginLeft: '10px' }}>
          Logout
        </button>
      </div>
    );
  }

  return null;
}
