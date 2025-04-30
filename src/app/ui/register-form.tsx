'use client';
import { useState } from "react";
import { registerUser } from "../services/auth";

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
    <form onSubmit={handleSubmit}>
      {isSuccess ? (
        <div style={{ color: 'green' }}>
          Registration successful! Please check your email to verify your account.
        </div>
      ) : (
        <>
          <div>
            <label htmlFor="username">Username</label>
            <input
              name="username"
              value={formData.username}
              onChange={handleChange}
              type="text"
              id="username"
            />
            <FieldError message={errors.username} />

          </div>

          <div>
            <label htmlFor="email">Email</label>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              type="email"
              id="email"
            />

            <FieldError message={errors.email} />
          </div>

          <div>
            <label htmlFor="password1">Password</label>
            <input
              name="password1"
              value={formData.password1}
              onChange={handleChange}
              type="password"
              id="password1"
            />

            <FieldError message={errors.password1} />
          </div>

          <div>
            <label htmlFor="password2">Confirm password</label>
            <input
              name="password2"
              value={formData.password2}
              onChange={handleChange}
              type="password"
              id="password2"
            />

            <FieldError message={errors.password2} />
          </div>

          {submitError && <p style={{ color: 'red' }}>{submitError}</p>}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Registering...' : 'Register'}
          </button>
        </>
      )}
    </form>
  );
}
