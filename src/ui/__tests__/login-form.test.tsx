// ecommerce-frontend/src/ui/__tests__/login-flow.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginForm from '../login-form'; // Adjust path if necessary
import { AuthContext, useAuth } from '@/context/auth-content';

// --- Ensure ALL used functions from your API service are mocked ---
jest.mock('@/services/auth', () => ({
  login: jest.fn(), // Keep mocking 'login'
  fetchAuthenticatedUser: jest.fn(), // Ensure this is explicitly mocked!
}));
import * as authService from '@/services/auth';

// Mock useRouter from next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));
import { useRouter } from 'next/navigation';

// Mock auth-context and get its mocked functions
jest.mock('@/context/auth-content');
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockPush = useRouter().push as jest.Mock;


describe('Login Flow Integration Test', () => {
  // Declare mockLoginSuccess here so it's a fresh Jest mock for each test case
  // but accessible within the describe block
  const mockLoginSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks(); // Clear all mocks for a clean slate before each test

    // --- CRITICAL FIX: Default mock for fetchAuthenticatedUser ---
    // This resolves the 'is not a function' error that happens when AuthContext mounts
    // It makes the initial authentication check return 'null' (no user)
    (authService.fetchAuthenticatedUser as jest.Mock).mockResolvedValue(null);

    // Default mock for useAuth context state
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      loginSuccess: mockLoginSuccess, // Assign the fresh mockLoginSuccess for each test
      logoutSuccess: jest.fn(),
    });
  });

  // --- Test Case 1: Successful Login ---
  it('allows a user to log in successfully and redirects to dashboard', async () => {
    // Arrange: Set up mock API behavior for successful login
    (authService.login as jest.Mock).mockResolvedValue({
      token: 'mock-jwt-token',
    });

    // Define the mock user data that should be passed to loginSuccess
    const mockUser = { username: 'testuser', email: 'test@example.com', id: 1 };


    // Now, we need to explicitly mock `fetchAuthenticatedUser` to return our mockUser
    // for the *successful login flow* that happens *after* the initial mount check.
    // This is because after `authService.login` succeeds, AuthContext will re-check
    // authentication or fetch user details.
    (authService.fetchAuthenticatedUser as jest.Mock).mockResolvedValue(mockUser);


    render(<LoginForm />); // Render the component. AuthContext's initial useEffect runs here.

    // Act: Simulate user typing and submitting the form
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /Login/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpassword123' } });

    fireEvent.click(loginButton);

    // Assert: Verify the outcomes asynchronously
    await waitFor(() => {
      // Check if the authService.login function was called with the correct credentials
      expect(authService.login).toHaveBeenCalledWith('testuser', 'testpassword123');

      // Check if fetchAuthenticatedUser was called (once on mount, once after login)
      expect(authService.fetchAuthenticatedUser).toHaveBeenCalledTimes(2);

      // Check if the loginSuccess function from AuthContext was called with the correct user data
      expect(mockLoginSuccess).toHaveBeenCalledWith(mockUser);

      // Check if the user was redirected
      expect(mockPush).toHaveBeenCalledWith('/dashboard'); // Adjust '/dashboard' to your actual route
    });

    expect(loginButton).toBeEnabled();
  });

  // --- Test Case 2: Failed Login ---
  it('displays an error message on failed login', async () => {
    // Arrange: Set up mock API behavior for failure
    (authService.login as jest.Mock).mockRejectedValue(new Error('Invalid credentials'));

    render(<LoginForm />);

    // Act: Simulate user typing and submitting the form
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /Login/i });

    fireEvent.change(usernameInput, { target: { value: 'wronguser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(loginButton);

    // Assert: Verify the outcomes asynchronously
    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument(); // Adjust to your actual error message
      expect(mockPush).not.toHaveBeenCalled();
      expect(mockLoginSuccess).not.toHaveBeenCalled();
      // fetchAuthenticatedUser is still called once on mount
      expect(authService.fetchAuthenticatedUser).toHaveBeenCalledTimes(1);
    });

    expect(loginButton).toBeEnabled();
  });
});
