'use client'
import { useState, useEffect } from "react"
import { login, fetchHomeData, logoutUser, fetchAuthenticatedUser } from "../services/auth";
import { useRouter } from "next/navigation";

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

type AuthenticatedUserResponse = LoginSuccessResponse['user'];

export default function LoginForm() {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

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
      const response = await login(username, password) as LoginSuccessResponse;
      const accessToken = response.access;
      const refreshToken = response.refresh;
      const user = response.user;

      console.log('Login Successful!', user);
      console.log('Access Token (likely also in HttpOnly cookie):', accessToken);
      console.log('Refresh Token (likely also in HttpOnly cookie):', refreshToken);

      localStorage.setItem('userUsername', user.username);
      setCheckingAuth(false);
      router.push('/dashboard');

    } catch (error) {
      console.error('Login error:', error);
      setErrors({
        general: error instanceof Error ? error.message : 'Login failed'
      });
      setCheckingAuth(false);
    } finally {
      setIsSubmitting(false);
    }
  }



  useEffect(() => {
    async function checkAuthAndRedirect() {
      setCheckingAuth(true);
      const user = await fetchAuthenticatedUser();

      if (user) {
        console.log("User authenticated on /login page load, redirecting...");
        router.push('/dashboard');
      } else {
        console.log("User not authenticated on /login page load, staying on login page.");
      }

      setCheckingAuth(false);
    }

    checkAuthAndRedirect();
  }, [router]);

  return (
    <form onSubmit={handleSubmit}> {/* Form wrapper */}
      {/* Display general error message (only when not checking auth) */}
      {errors.general && !checkingAuth && (
        <div style={{ color: 'red', marginBottom: '1rem' }}>
          {errors.general}
        </div>
      )}

      {/* Conditional rendering: Show loading or the form */}
      {checkingAuth ? (
        <p> Checking authentication status...</p>
      ) : (
        <>
          < div >
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              type="text"
              disabled={isSubmitting}
            />
            <FieldError message={errors.username} />
          </div >

          <div>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              type="password"
              disabled={isSubmitting}
            />
            <FieldError message={errors.password} />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </>
      )
      }
    </form >
  );
}
