import React from 'react';

// Mock the AuthContext value
const mockAuthContextValue = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  loginSuccess: jest.fn(),
  logoutSuccess: jest.fn(),
};

// Mock the useAuth hook as a Jest mock function
const mockUseAuth = jest.fn(() => mockAuthContextValue);

// Mock the AuthContext.Provider (for components that use the Provider directly)
const AuthContext = {
  Provider: ({ children, value }: { children: React.ReactNode; value: any }) => (
    <div data-testid="AuthContext.Provider">{children}</div>
  ),
};

// Optional: If AuthProvider is also somewhere in app, keep this mock
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthContext.Provider value={mockAuthContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Export everything needed for tests
export { AuthContext, mockUseAuth, mockAuthContextValue };

// Export useAuth hook (this is what the component imports)
export const useAuth = mockUseAuth;
