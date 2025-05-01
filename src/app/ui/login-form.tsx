'use client'
import { useState } from "react"

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
}

export default function LoginForm() {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
  });

  const [errors, setErrors] = useState<FormErrors>({})

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;

    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // validation
    const { username, password } = formData;
    const newErrors: FormErrors = {};

    if (!username.trim()) newErrors.username = 'Username is required';
    if (!password) newErrors.password = 'Password is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="username">username</label>
        <input name="username"
          value={formData.username}
          onChange={handleChange}
          type="text" />
        <FieldError message={errors.username} />
      </div>

      <div>
        <label htmlFor="password">Passwrod</label>
        <input name="password" value={formData.password} onChange={handleChange} type="password" />
        <FieldError message={errors.password} />
      </div>
      <button type="submit">login</button>
    </form>
  )
}
