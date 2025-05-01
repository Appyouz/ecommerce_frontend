'use client'
import { useState } from "react"
import { login, fetchHomeData } from "../services/auth";
import { useRouter } from "next/navigation"; // For redirection (currently commented out)

// Simple component to display field-specific error messages
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
  user: { // User data added by custom backend view
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  }
}


export default function LoginForm() {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
  });

  // State for validation and submission errors
  const [errors, setErrors] = useState<FormErrors>({});

  // State for loading/submitting status
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for logged-in user data (null initially, populated on success)
  const [loggedInUser, setLoggedInUser] = useState<LoginSuccessResponse['user'] | null>(null);

  const router = useRouter(); // Initialize router


  // Handle input changes and update state
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' })); // Clear specific error on change
  }

  // Handle form submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); // Prevent default browser form submission (page reload)
    setIsSubmitting(true); // Set submitting state
    setLoggedInUser(null); // Clear previous user data
    setErrors({}); // Clear all previous errors

    // Client-side validation
    const { username, password } = formData;
    const newErrors: FormErrors = {};

    if (!username.trim()) newErrors.username = 'Username is required';
    if (!password) newErrors.password = 'Password is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return; // Stop if validation fails
    }

    try {
      // Call backend login service (expects LoginSuccessResponse shape)
      const response = await login(username, password) as LoginSuccessResponse;

      // Access data from successful response
      const accessToken = response.access;
      const refreshToken = response.refresh; // Corrected typo
      const user = response.user;

      console.log('Login Successful!', user);
      console.log('Access Token (likely also in HttpOnly cookie):', accessToken); // Token received in body
      console.log('Refresh Token (likely also in HttpOnly cookie):', refreshToken); // Token received in body

      localStorage.setItem('userUsername', user.username);

      // Store user data in state to display welcome message
      setLoggedInUser(user);

      // Optional: Redirect to dashboard after a delay or automatically
      // router.push('/dashboard');

    } catch (error) {
      console.error('Login error:', error);
      // Set general error message from caught error
      setErrors({
        general: error instanceof Error ? error.message : 'Login failed'
      });
    } finally {
      setIsSubmitting(false); // Always stop submitting state
    }
  }


  const [homeDataMessage, setHomeDataMessage] = useState<string | null>(null);
  //  Function to handle clicking the test button 
  async function handleFetchHomeClick() {
    setHomeDataMessage('Fetching Home data...'); // Indicate fetching state
    try {
      const data = await fetchHomeData();
      setHomeDataMessage(`Home data: ${data.message}`); // Display the success message from backend
      console.log("Successfully fetched Home data:", data); // Log success
    } catch (error) {
      setHomeDataMessage(`Failed to fetch Home data: ${error.message}`); // Display error message
      console.error("Error fetching Home data:", error); // Log error
    }
  }


  // Render the form or welcome message
  return (
    <form onSubmit={handleSubmit}> {/* Form wrapper */}
      {/* Display general error message */}
      {errors.general && (
        <div style={{ color: 'red', marginBottom: '1rem' }}>
          {errors.general}
        </div>
      )}

      {/* Conditional rendering: Show welcome message if loggedInUser state is truthy */}
      {loggedInUser ? (
        // Show welcome message
        <div style={{ color: 'green' }}>
          Login successful! Welcome, {loggedInUser.username}!

          <button type="button" onClick={handleFetchHomeClick} style={{ marginLeft: '10px' }}>
            Test Fetch Home Data
          </button>

          {/* Display the result of the Home data fetch */}
          {homeDataMessage && (
            <p>{homeDataMessage}</p>
          )}
        </div>
      ) : (
        // Show login form elements if no user is logged in yet (in state)
        <>
          <div>
            <label htmlFor="username">Username</label>
            <input
              id="username" // For accessibility
              name="username"
              value={formData.username}
              onChange={handleChange}
              type="text"
              disabled={isSubmitting} // Disable while submitting
            />
            <FieldError message={errors.username} /> {/* Field-specific error */}
          </div>

          <div>
            <label htmlFor="password">Password</label>
            <input
              id="password" // For accessibility
              name="password"
              value={formData.password}
              onChange={handleChange}
              type="password"
              disabled={isSubmitting} // Disable while submitting
            />
            <FieldError message={errors.password} /> {/* Field-specific error */}
          </div>

          <button
            type="submit"
            disabled={isSubmitting} // Disable while submitting
          >
            {isSubmitting ? 'Logging in...' : 'Login'} {/* Change text based on status */}
          </button>
        </>
      )}
    </form>
  )
}
