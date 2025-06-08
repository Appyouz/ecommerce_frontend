
import { render, screen } from '@testing-library/react';
import RegisterForm from '../register-form';
import { AuthContext, useAuth } from '@/context/auth-context';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('@/context/auth-content');
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;


describe('RegisterForm', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      loginSuccess: jest.fn(), // Even though not used by RegisterForm directly, it's part of the context
      logoutSuccess: jest.fn(), // Same here
    });
  });

  it('renders all required registration fields', () => {
    render(<RegisterForm />);

    // Query for input fields by their associated labels (case-insensitive regex)
    const usernameInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/email/i);
    // Use exact match for 'password' to differentiate from 'confirm password'
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);


    // Assert that each input field is present in the document
    expect(usernameInput).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(confirmPasswordInput).toBeInTheDocument();
  });

  it('renders a registration button', () => {
    render(<RegisterForm />);

    // Query for the button by its role and text content (case-insensitive regex)
    const registerButton = screen.getByRole('button', { name: /Sign Up|Register/i });

    // Assert that the button is present in the document
    expect(registerButton).toBeInTheDocument();
  });
});
