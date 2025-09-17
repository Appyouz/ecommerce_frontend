'use client'
import Link from "next/link"
import { useRouter } from "next/navigation"
import { logoutUser } from "@/services/auth"
import { useAuth } from "@/context/auth-context"

export default function Header() {
  const { user, isAuthenticated, isLoading, logoutSuccess } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    try {
      await logoutUser();
      console.log("Header handleLogout: Logout successful on backend.");
    } catch (error) {
      console.error("Header: Error during logout process:", error);
    } finally {
      logoutSuccess();
      console.log("Header handleLogout: Called logoutSuccess.");
      router.push('/login');
    }
  }

  return (
    <header className="bg-gray-800 text-white p-4 shadow-md flex justify-between items-center">
      <div className="flex-shrink-0">
        <Link href="/" className="text-2xl font-bold tracking-tight text-white hover:text-gray-300 transition-colors duration-200 ease-in-out">
          My App
        </Link>
      </div>

      <nav className="flex items-center space-x-6">
        {isLoading ? (
          <span className="text-gray-400">Loading...</span>
        ) : (
          isAuthenticated ? (
            <>
              <Link href="/products" className="hover:text-gray-300 transition-colors duration-200 ease-in-out">
                Products
              </Link>
              <Link href="/cart" className="hover:text-gray-300 transition-colors duration-200 ease-in-out">
                Cart
              </Link>
              <Link href="/orders" className="hover:text-gray-300 transition-colors duration-200 ease-in-out">
                Orders
              </Link>
              <Link href="/dashboard" className="hover:text-gray-300 transition-colors duration-200 ease-in-out">
                Dashboard
              </Link>
              <span className="text-gray-400">Welcome, {user?.username}!</span>
              <button
                type="button"
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-md transition-colors duration-200 ease-in-out"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/products" className="hover:text-gray-300 transition-colors duration-200 ease-in-out">
                Products
              </Link>
              <Link href="/cart" className="hover:text-gray-300 transition-colors duration-200 ease-in-out">
                Cart
              </Link>
              <Link href="/login" className="hover:text-gray-300 transition-colors duration-200 ease-in-out">
                Login
              </Link>
              <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded-md transition-colors duration-200 ease-in-out">
                Register
              </Link>
            </>
          )
        )}
      </nav>
    </header>
  );
}
