'use client'
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { login, fetchAuthenticatedUser } from "@/services/auth";

// Icons
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

const FieldError = ({ message }: { message?: string }) =>
  message ? <p style={{ color: 'red' }}>{message}</p> : null;

type FormData = {
  username: string;
  password: string;
}

type FormErrors = {
  username?: string;
  password?: string;
  general?: string;
}

type LoginSuccessResponse = {
  access_token: string;
  refresh_token: string;
}


export default function LoginForm() {
  // Local state for form data and submission status
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Get state and the loginSuccess function
  const { isAuthenticated, isLoading, loginSuccess } = useAuth();

  const router = useRouter();

  // Handle input changes and update form state
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  }

  // Handle form submission for login
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    // Client-side validation (basic)
    const { username, password } = formData;
    const newErrors: FormErrors = {};
    if (!username.trim()) newErrors.username = 'Username is required';
    if (!password) newErrors.password = 'Password is required';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      await login(username, password)
      console.log('Login attempt successful (cookies should be set).');

      const authenticatedUser = await fetchAuthenticatedUser();

      if (authenticatedUser) {
        // If user data is successfully fetched, update the auth context state
        console.log("LoginForm handleSubmit: Fetched authenticated user data:", authenticatedUser);
        loginSuccess(authenticatedUser); // Call the context function with the fetched user data
        console.log("LoginForm handleSubmit: Called loginSuccess with fetched user.");

        // Redirect immediately after the form submission logic
        console.log("LoginForm handleSubmit: Attempting redirect to dashboard");
        router.push('/dashboard');

      } else {
        // If fetchAuthenticatedUser returns null, it means authentication failed
        // even after the login call. This is unexpected but handled.
        console.error("LoginForm handleSubmit: Login attempt succeeded, but fetching authenticated user failed.");
        setErrors({ general: 'Login successful, but failed to retrieve user data. Please try refreshing.' });
      }




    } catch (error) {
      console.error('Login error:', error);
      setErrors({
        general: error instanceof Error ? error.message : 'Login failed'
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // useEffect to redirect if user is already authenticated when landing on /login
  useEffect(() => {
    // Only redirect if the global auth check is finished AND the user is authenticated
    if (!isLoading && isAuthenticated) {
      console.log("/login useEffect: User authenticated (via global state), redirecting to dashboard.");
      router.push('/dashboard');
    }
    // Effect depends on global auth state and router
  }, [isLoading, isAuthenticated, router]);

  // Render logic based on global auth state (isLoading, isAuthenticated)
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="px-8 py-6 mx-4 mt-4 text-left bg-white shadow-lg md:w-1/3 sm:w-1/3 rounded-lg">
        <h3 className="text-2xl font-bold text-center text-gray-800">Log in to your account</h3>

        {/* General error message display */}
        {errors.general && (
          <div className="text-red-500 text-center mb-4 p-2 bg-red-100 border border-red-400 rounded">
            {errors.general}
          </div>
        )}

        {isLoading ? (
          <p className="text-center text-gray-600">Checking authentication status...</p>
        ) : isAuthenticated ? (
          // If authenticated, render nothing here, as the useEffect handles redirection
          null
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mt-4">
              <label htmlFor="username" className="block font-semibold mb-2 text-gray-700">Username</label>
              <input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                type="text"
                placeholder="Enter your username"
                disabled={isSubmitting}
                className="w-full px-4 py-2 mt-2 border rounded-md text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition ease-in-out duration-150"
              />
              <FieldError message={errors.username} />
            </div>
            <div className="mt-4">
              <label htmlFor="password" className="block font-semibold mb-2 text-gray-700">Password</label>
              <input
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                type="password"
                placeholder="Enter your password"
                disabled={isSubmitting}
                className="w-full px-4 py-2 mt-2 border rounded-md text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition ease-in-out duration-150"
              />
              <FieldError message={errors.password} />
            </div>
            <div className="mt-4 flex justify-end items-center">
              <a href="#" className="text-sm text-blue-600 hover:underline">Forgot Password?</a>
            </div>
            <div className="mt-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-4 py-2 tracking-wide text-white transition-colors duration-200 transform bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? 'Logging in...' : 'Login'}
              </button>
            </div>

            <div className="mt-6 text-center border-t pt-6 border-gray-200">
              <p className="text-sm text-gray-600 mb-4">Or login with</p>
              <div className="flex justify-center space-x-4">
                <button
                  type="button"
                  className="flex items-center justify-center w-1/2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 transition ease-in-out duration-150 cursor-pointer"
                >
                  <FcGoogle className="w-5 h-5 mr-2" />
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center w-1/2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 transition ease-in-out duration-150 cursor-pointer"
                >
                  <FaGithub className="w-5 h-5 mr-2"></FaGithub>
                </button>
              </div>
              <p className="mt-6 text-sm text-gray-600">
                Don&apos;t have an account?
                <a href="#" className="ml-1 text-blue-600 hover:underline">Sign up</a>
              </p>
            </div>
          </form>
        )}


      </div>
    </div>
  );

}
