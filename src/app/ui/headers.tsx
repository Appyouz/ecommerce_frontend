'use client'

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "../context/auth-content"
import { logoutUser } from "../services/auth"

// Header component to display global authentication status and actions
export default function Header() {
  // Consume global auth state and logout function from context
  const { user, isAuthenticated, isLoading, logoutSuccess } = useAuth();

  const router = useRouter();

  async function handleLogout() {
    try {
      // Call the backend logout service
      await logoutUser();
      console.log("Header handleLogout: Logout successful on backend.");

      // Call context function to update global state
      logoutSuccess()
      console.log("Header handleLogout: Called logoutSuccess.");

      // Explicitly redirect to login page
      router.push('/login')
    } catch (error) {
      console.error("Header: Error during logout process:", error);
    }
  }

  // Render logic
  return (
    <header style={{ padding: '10px 20px', borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <Link href="/">My App</Link>
      </div>

      {/* Navigation / Auth Status */}
      <nav>
        {isLoading ? (
          // Show loading state while initial check is in progress
          <span>Loading...</span>
        ) : (
          isAuthenticated ? (
            // If authenticated, show welcome message and Logout button
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: '10px' }}>Welcome, {user?.username}!</span>
              <button type="button" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            // If not authenticated, show Login and Signup links
            <div>
              <Link href="/login" style={{ marginRight: '10px' }}>Login</Link> {/* Link to login page */}
            </div>
          )
        )}
      </nav>
    </header>
  );
}
