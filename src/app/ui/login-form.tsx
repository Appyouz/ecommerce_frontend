'use client'
import { useState, useEffect } from "react"
import { login, fetchAuthenticatedUser } from "../services/auth";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/auth-content";

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
  access: string;
  refresh: string;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  }
}

// AuthenticatedUserResponse type is defined in AuthContext.tsx
// type AuthenticatedUserResponse = LoginSuccessResponse['user']; // REMOVED

export default function LoginForm() {
  // Local state for form data and submission status
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Get state and the loginSuccess function
  const { user, isAuthenticated, isLoading, loginSuccess } = useAuth();

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
      // Call backend login service
      const response = await login(username, password) as LoginSuccessResponse;
      const accessToken = response.access;
      const refreshToken = response.refresh;
      const user = response.user; // Get user data from login response

      console.log('Login Successful!', user);
      console.log('Access Token (likely also in HttpOnly cookie):', accessToken);
      console.log('Refresh Token (likely also in HttpOnly cookie):', refreshToken);

      localStorage.setItem('userUsername', user.username); // Keep for now

      loginSuccess(user); // Call the context function
      console.log("LoginForm handleSubmit: Called loginSuccess.");

      // Explicitly redirect immediately after the form submission logic
      console.log("LoginForm handleSubmit: Attempting redirect to dashboard");
      router.push('/dashboard'); // Redirect immediately after login button click

    } catch (error) {
      console.error('Login error:', error);
      setErrors({
        general: error instanceof Error ? error.message : 'Login failed'
      });
      // setCheckingAuth(false); // REMOVED local state
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
