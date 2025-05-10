'use client'
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-content";
import { login, fetchAuthenticatedUser } from "@/services/auth";

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
    < form onSubmit={handleSubmit} >
      {
        errors.general && !isLoading && (
          <div style={{ color: 'red', marginBottom: '1rem' }}>
            {errors.general}
          </div>
        )
      }

      {
        isLoading ? (
          < p > Checking authentication status...</p >
        ) : (
          isAuthenticated ? (
            null
          ) : (
            <>
              <div>
                <label htmlFor="username">Username</label>
                <input id="username" name="username" value={formData.username} onChange={handleChange} type="text" disabled={isSubmitting || isLoading} />
                <FieldError message={errors.username} />
              </div>

              <div>
                <label htmlFor="password">Password</label>
                <input id="password" name="password" value={formData.password} onChange={handleChange} type="password" disabled={isSubmitting || isLoading} />
                <FieldError message={errors.password} />
              </div>

              <button type="submit" disabled={isSubmitting || isLoading}>
                {isSubmitting ? 'Logging in...' : 'Login'}
              </button>
            </>
          )
        )
      }
    </form >
  );
}
