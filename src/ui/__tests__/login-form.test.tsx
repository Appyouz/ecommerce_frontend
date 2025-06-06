
import { render, screen } from '@testing-library/react';
import LoginForm from '../login-form';

// Mock the useRouter hook from next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Explicitly tell Jest to mock the auth-context module
// This tells Jest to use __mocks__/auth-context.tsx file
jest.mock('@/context/auth-content');
// Import the AuthContext and useAuth from the mocked module
import { AuthContext, useAuth } from '@/context/auth-content';

// Now, let's get the mocked functions from useAuth hook
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('LoginForm', () => {
  beforeEach(() => {
    // Reset mocks before each test to ensure isolation
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      loginSuccess: jest.fn(),
      logoutSuccess: jest.fn(),
    });
  });

  it('renders username and password fields', () => {
    render(<LoginForm />); // Now LoginForm will get the mocked context values directly

    // Check if username and password input fields are present
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);

    expect(usernameInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
  });

  it('renders a login button', () => {
    render(<LoginForm />);

    const loginButton = screen.getByRole('button', { name: /Login/i });
    expect(loginButton).toBeInTheDocument();
  });

});
