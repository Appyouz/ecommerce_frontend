'use client';
import { useState } from "react";

// Component: Register

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password1: '',
    password2: ''
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    console.log('Form submitted:', formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="username">username</label>
        <input name="username" value={formData.username} onChange={handleChange} type="text" id="username" />
      </div>

      <div>
        <label htmlFor="email">Email</label>
        <input name="email" value={formData.email} onChange={handleChange} type="email" id="email" />
      </div>

      <div>
        <label htmlFor="password1">Password</label>
        <input name="password1" value={formData.password1} onChange={handleChange} type="password1" id="password1" />
      </div>
      <div>
        <label htmlFor="password2">Confirm password</label>
        <input name="password2" value={formData.password2} onChange={handleChange} type="password2" id="password2" />
      </div>
      <button type="submit">Register</button>
    </form>
  );
}
