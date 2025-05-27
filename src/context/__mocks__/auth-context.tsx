
// Mock the AuthContext Type
const mockAuthContextValue = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  loginSuccess: jest.fn(),
  logoutSuccess: jest.fn(),
};

// Create a mock context object that has a Provider
const AuthContext = {
  Provider: ({ children, value }: { children: React.ReactNode, value: any }) => (
    <div data-testid="AuthContext.Provider">
      {children}
    </div>
  ),
};

// Mock the useAuth hook
const useAuth = () => mockAuthContextValue;


// Export the mocks so the test can import them
export { AuthContext, useAuth, mockAuthContextValue };

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthContext.Provider value={mockAuthContextValue}>
      {children}
    </AuthContext.Provider>
  );
};
