'use client';
import { useState } from "react";

// Component: Register
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

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));

    // clear error for that field as user types
    setErrors(prevErrors => ({
      ...prevErrors,
      [name]: ''
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const { username, email, password1, password2 } = formData;
    const newErrors: FormErrors = {};

    //validation rules
    if (!username.trim()) newErrors.username = 'Username is required';
    if (!email.trim()) newErrors.email = 'Email is required'
    if (!password1) newErrors.password1 = 'Password is required'
    if (!password2) newErrors.password2 = 'Confirm your password'
    else if (password1 != password2) newErrors.password2 = 'Passwords do not match'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});



    console.log('Form submitted:', formData)

    // if (!formData.username || !formData.email || !formData.password1 || !formData.password2) {
    //   alert('Fields are required!')
    // }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="username">username</label>
        <input name="username" value={formData.username} onChange={handleChange} type="text" id="username" />
        {errors.username && <p style={{ color: 'red' }}>{errors.username}</p>}
      </div>

      <div>
        <label htmlFor="email">Email</label>
        <input name="email" value={formData.email} onChange={handleChange} type="email" id="email" />
        {errors.email && <p style={{ color: 'red' }}>{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="password1">Password</label>
        <input name="password1" value={formData.password1} onChange={handleChange} type="password" id="password1" />
        {errors.password1 && <p style={{ color: 'red' }}>{errors.password1}</p>}
      </div>

      <div>
        <label htmlFor="password2">Confirm password</label>
        <input name="password2" value={formData.password2} onChange={handleChange} type="password" id="password2" />
        {errors.password2 && <p style={{ color: 'red' }}>{errors.password2}</p>}
      </div>

      <button type="submit">Register</button>
    </form>
  );
}
