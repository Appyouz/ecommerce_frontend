import { render, screen } from '@testing-library/react';
import RegisterForm from '../register-form';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock the entire auth-context module
jest.mock('@/context/auth-context');
import { mockUseAuth } from '@/context/auth-context';

describe('RegisterForm', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      loginSuccess: jest.fn(),
      logoutSuccess: jest.fn(),
    });
  });

  it('renders all required registration fields', () => {
    render(<RegisterForm />);

    const usernameInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    expect(usernameInput).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(confirmPasswordInput).toBeInTheDocument();
  });

  it('renders a registration button', () => {
    render(<RegisterForm />);

    const registerButton = screen.getByRole('button', { name: /Sign Up|Register/i });

    expect(registerButton).toBeInTheDocument();
  });
});
