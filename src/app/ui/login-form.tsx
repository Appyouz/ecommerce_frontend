'use client'
import { useState } from "react"
import { login } from "../services/auth";
// import { useRouter } from "next/router";

// To display error messages
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

export default function LoginForm() {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
  });

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    // validation
    const { username, password } = formData;
    const newErrors: FormErrors = {};

    if (!username.trim()) newErrors.username = 'Username is required';
    if (!password) newErrors.password = 'Password is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await login(username, password);
      console.log('Login Successful', response);

      // Redirect or handle sucessful login
      // router.push('./dashbaord')
    } catch (error) {
      console.error('Login error:', error);
      setErrors({
        general: error instanceof Error ? error.message : 'Login failed'
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {errors.general && (
        <div style={{ color: 'red', marginBottom: '1rem' }}>
          {errors.general}
        </div>
      )}

      <div>
        <label htmlFor="username">Username</label>
        <input
          name="username"
          value={formData.username}
          onChange={handleChange}
          type="text"
          disabled={isSubmitting}
        />
        <FieldError message={errors.username} />
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input
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
    </form>
  )
}
