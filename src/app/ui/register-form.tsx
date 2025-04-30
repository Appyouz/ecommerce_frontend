// Component: Register
export default function RegisterForm() {
  return (
    <form>
      <div>
        <label htmlFor="username">username</label>
        <input type="username" id="username" />
      </div>

      <div>
        <label htmlFor="email">Email</label>
        <input type="email" id="email" />
      </div>
      <div>
        <label htmlFor="password1">Password</label>
        <input type="password1" id="password1" />
      </div>
      <div>
        <label htmlFor="password2">Confirm password</label>
        <input type="password2" id="password2" />
      </div>
      <button type="submit">Register</button>
    </form>
  );
}
