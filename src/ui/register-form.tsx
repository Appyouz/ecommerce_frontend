'use client';
import { useState } from "react";
import { registerUser } from "@/services/auth";

// To display error messages
const FieldError = ({ message }: { message?: string }) =>
  message ? <p style={{ color: 'red' }}>{message}</p> : null;

type FormData = {
  username: string;
  email: string;
  password1: string;
  password2: string;
};

type FormErrors = {
  username?: string;
  email?: string;
  password1?: string;
  password2?: string;
};

export default function RegisterForm() {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password1: '',
    password2: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setIsSuccess(false);

    // Validation
    const { username, email, password1, password2 } = formData;
    const newErrors: FormErrors = {};

    if (!username.trim()) newErrors.username = 'Username is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    if (!password1) newErrors.password1 = 'Password is required';
    if (!password2) newErrors.password2 = 'Confirm your password';
    else if (password1 !== password2) newErrors.password2 = 'Passwords do not match';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      await registerUser(formData);
      setIsSuccess(true);
      // Optionally reset form here
      setFormData({ username: '', email: '', password1: '', password2: '' });
    } catch (error) {
      if (error instanceof Error) {
        setSubmitError(error.message);
      } else {
        setSubmitError('An unknown error occurred');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      {/* Main card container - Consistent with Login Form */}
      <div className="px-8 py-6 mx-4 mt-4 text-left bg-white shadow-lg md:w-1/3 sm:w-1/3 rounded-lg">
        {/* Adjusted width for larger screens (lg:w-1/4) and smaller (sm:w-1/2) for better fit */}
        <h3 className="text-2xl font-bold text-center text-gray-800">Register</h3>

        {/* Form Submission Messages */}
        {isSuccess ? (
          <div className="text-green-600 text-center mb-4 p-3 bg-green-100 border border-green-400 rounded">
            Registration successful! Please check your email to verify your account.
          </div>
          // Explanation:
          // - `text-green-600`: Sets text color to green.
          // - `p-3 bg-green-100 border border-green-400 rounded`: Provides a light green background, border, padding, and rounded corners for a success message box.
        ) : (
          <form onSubmit={handleSubmit}>
            {/* General submit error display */}
            {submitError && (
              <div className="text-red-500 text-center mb-4 p-2 bg-red-100 border border-red-400 rounded">
                {submitError}
              </div>
            )}

            {/* Username Field Group */}
            <div className="mt-4">
              <label htmlFor="username" className="block font-semibold text-gray-700">Username</label>
              <input
                name="username"
                value={formData.username}
                onChange={handleChange}
                type="text"
                id="username"
                placeholder="Enter your username"
                className="w-full px-4 py-2 mt-2 border rounded-md text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition ease-in-out duration-150"
              />
              <FieldError message={errors.username} />
            </div>

            {/* Email Field Group */}
            <div className="mt-4"> {/* Added mt-4 for consistent spacing between form groups */}
              <label htmlFor="email" className="block font-semibold text-gray-700">Email</label>
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                type="email"
                id="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 mt-2 border rounded-md text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition ease-in-out duration-150"
              />
              <FieldError message={errors.email} />
            </div>

            {/* Password Field Group */}
            <div className="mt-4"> {/* Added mt-4 */}
              <label htmlFor="password1" className="block font-semibold text-gray-700">Password</label>
              <input
                name="password1"
                value={formData.password1}
                onChange={handleChange}
                type="password"
                id="password1"
                placeholder="Create a password"
                className="w-full px-4 py-2 mt-2 border rounded-md text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition ease-in-out duration-150"
              />
              <FieldError message={errors.password1} />
            </div>

            {/* Confirm Password Field Group */}
            <div className="mt-4">
              <label htmlFor="password2" className="block font-semibold text-gray-700">Confirm password</label>
              <input
                name="password2"
                value={formData.password2}
                onChange={handleChange}
                type="password"
                id="password2"
                placeholder="Confirm your password"
                // Removed mb-6. Spacing handled by parent div's mt-4 or next element's mt.
                className="w-full px-4 py-2 mt-2 border rounded-md text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition ease-in-out duration-150"
              />
              <FieldError message={errors.password2} />
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 py-2 tracking-wide text-white transition-colors duration-200 transform bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-8"
            >
              {isSubmitting ? 'Registering...' : 'Register'}
            </button>
          </form>
        )}

        {/* "Already have an account? Login" Link */}
        <div className="mt-6 text-center border-t pt-6 border-gray-200">
          <p className="mt-6 text-sm text-gray-600">
            Already have an account?
            <a href="/login" className="ml-1 text-blue-600 hover:underline hover:text-blue-700 cursor-pointer">Login</a>
          </p>
        </div>
      </div>
    </div>
  );
}
