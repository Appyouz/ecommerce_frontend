import { User } from "@/types";
import { LoginResponseWithTokens } from "@/types";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Define the shape of the login response when using header authentication
// IMPORTANT: Matches what your backend is currently sending ('access' and 'refresh')

// --- Token Management Functions ---
const ACCESS_TOKEN_KEY = "access_token"; // Key for localStorage
const REFRESH_TOKEN_KEY = "refresh_token"; // Key for localStorage

/**
 * Stores access and refresh tokens in localStorage.
 * @param accessToken The JWT access token.
 * @param refreshToken The JWT refresh token.
 */
export const setAuthTokens = (
  accessToken: string,
  refreshToken: string,
): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    console.log("Tokens saved to localStorage.");
  }
};

/**
 * Retrieves the access token from localStorage.
 * @returns The access token string or null if not found.
 */
export const getAccessToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }
  return null;
};

/**
 * Retrieves the refresh token from localStorage.
 * @returns The refresh token string or null if not found.
 */
const getRefreshToken = (): string | null => {
  // Not exported, for internal use in refreshAccessToken
  if (typeof window !== "undefined") {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }
  return null;
};

/**
 * Clears all authentication tokens from localStorage.
 */
export const clearAuthTokens = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    console.log("Tokens cleared from localStorage.");
  }
};

/**
 * Generates headers with the Authorization: Bearer token.
 * @returns An object containing the Authorization header, or an empty object if no token.
 */
export const getAuthHeaders = (): HeadersInit => {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// --- API Service Functions ---

/**
 * Attempts to refresh the access token using the stored refresh token.
 * @returns A Promise that resolves with the new access token if successful,
 * or rejects if refresh fails.
 */
export const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    console.warn("No refresh token available. Cannot refresh.");
    clearAuthTokens(); // No refresh token, so user needs to re-login
    throw new Error("No refresh token available.");
  }

  const endpoint = `${API_URL}/api/token/refresh/`; // Direct Simple JWT refresh endpoint
  console.log("Attempting to refresh access token...");

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error("Refresh token API error:", errorData);
      clearAuthTokens(); // Clear tokens on refresh failure (refresh token is likely invalid)
      throw new Error("Failed to refresh token. Please log in again.");
    }

    const data = await response.json();
    const newAccessToken = data.access; // Backend sends 'access'
    const newRefreshToken = data.refresh || refreshToken; // Backend sends 'refresh', or use old if rotation not active

    setAuthTokens(newAccessToken, newRefreshToken); // Store new tokens
    console.log("Access token refreshed successfully.");
    return newAccessToken;
  } catch (error) {
    console.error("Error during token refresh:", error);
    clearAuthTokens(); // Ensure tokens are cleared if refresh fails
    throw error; // Re-throw to propagate the error
  }
};

/**
 * A wrapper function for making authenticated fetch requests.
 * Handles adding the Authorization header, token expiration, and refreshing.
 * @param url The URL for the fetch request.
 * @param options Fetch options.
 * @returns The response object from the fetch request.
 */
export const requestWithAuth = async (
  url: RequestInfo,
  options?: RequestInit,
): Promise<Response> => {
  let currentAccessToken = getAccessToken();
  let headers: HeadersInit = { ...options?.headers };

  if (currentAccessToken) {
    headers = { ...headers, Authorization: `Bearer ${currentAccessToken}` };
  }

  let response = await fetch(url, { ...options, headers });

  // If unauthorized AND it's not the login/register endpoint itself, try to refresh
  if (
    response.status === 401 &&
    !url.toString().includes("/dj-rest-auth/login/") &&
    !url.toString().includes("/dj-rest-auth/registration/") &&
    !url.toString().includes("/register/seller/")
  ) {
    console.warn("Received 401. Attempting token refresh...");
    try {
      const newAccessToken = await refreshAccessToken(); // Attempt to refresh
      headers = { ...headers, Authorization: `Bearer ${newAccessToken}` }; // Update header
      // Retry the original request with the new token
      console.log("Retrying original request with new access token...");
      response = await fetch(url, { ...options, headers });
    } catch (refreshError) {
      console.error(
        "Failed to refresh token. Redirecting to login or handling globally.",
      );
      // If refresh fails, the error is propagated. Your AuthContext should handle this.
      throw new Error("Authentication required. Please log in."); // Re-throw to indicate required auth
    }
  }

  // If after retry, still 401 or initial was 401 for auth required pages
  if (response.status === 401) {
    console.warn("Request still resulted in 401 after authentication attempt.");
    // No need to clear here if refreshAccessToken already did it.
    // This error will be caught by the component and should trigger logout/redirect.
    throw new Error("Authentication required. Please log in.");
  }

  return response;
};

// Service function to handle user login
export const login = async (
  username: string,
  password: string,
): Promise<User> => {
  const endpoint = `${API_URL}/dj-rest-auth/login/`;
  console.log(`Attempting to log in user: ${username} via API: ${endpoint}`);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage =
        errorData?.non_field_errors?.join(" ") ||
        errorData?.detail ||
        errorData?.message ||
        `Login failed (Status: ${response.status})`;
      console.error("Login API Error response:", errorData);
      throw new Error(errorMessage);
    }

    const data: LoginResponseWithTokens = await response.json(); // Use the explicit type here
    console.log("Login successful. Full response data:", data);

    if (data.access && data.refresh) {
      setAuthTokens(data.access, data.refresh);
    } else {
      // This indicates a problem if refresh is empty (which is your current backend issue)
      console.error(
        "Login response did not contain expected valid access/refresh tokens. Backend sent:",
        data,
      );
      throw new Error("Login successful, but tokens not found in response.");
    }

    return data.user; // Assuming user data is nested under 'user' key as per your previous setup
  } catch (error) {
    console.error("Error during login:", error);
    throw new Error(
      error instanceof Error ? error.message : "Network error during login",
    );
  }
};

// Type for the common registration form data (username, email, passwords)
export type CommonRegistrationFormData = {
  username: string;
  email: string;
  password1: string;
  password2: string;
};

// Service function to handle user registration (simplified, assumes backend sends tokens)
export const registerUser = async (
  formData: CommonRegistrationFormData,
): Promise<User> => {
  const endpoint = `${API_URL}/dj-rest-auth/registration/`;
  console.log(
    `Attempting to register user: ${formData.username} via API: ${endpoint}`,
  );

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(formData),
    });

    const responseData: LoginResponseWithTokens | any = await response
      .json()
      .catch(() => null);

    if (!response.ok) {
      const errorMessage =
        responseData?.username?.join(" ") ||
        responseData?.email?.join(" ") ||
        responseData?.password1?.join(" ") ||
        responseData?.password2?.join(" ") ||
        responseData?.non_field_errors?.join(" ") ||
        "Registration failed";

      throw new Error(errorMessage);
    }

    // After successful registration, dj-rest-auth/registration often returns tokens.
    // Store them if available.
    if (responseData && responseData.access && responseData.refresh) {
      setAuthTokens(responseData.access, responseData.refresh);
    } else {
      console.warn(
        "Registration response did not contain new access/refresh tokens. User might need to log in separately after registration.",
      );
      // If registration doesn't return tokens, the user will need to explicitly log in.
      // Might want to handle this UI flow in your component (e.g., redirect to login page).
    }

    const userData: User = responseData.user || responseData;

    console.log("Registration successful:", userData);
    return userData;
  } catch (error) {
    console.error("Registration error:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Network error during registration",
    );
  }
};

// Type for seller specific registration data
export type SellerRegistrationFormData = CommonRegistrationFormData & {
  seller_profile: {
    store_name: string;
    business_email: string;
    phone_number: string;
    business_address: string;
    tax_id?: string;
  };
};

// Service function to handle seller registration
export const registerSeller = async (
  formData: SellerRegistrationFormData,
): Promise<User> => {
  const endpoint = `${API_URL}/register/seller/`;
  console.log(
    `Attempting to register seller: ${formData.username} via API: ${endpoint}`,
  );

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(formData),
    });

    const responseData: LoginResponseWithTokens | any = await response
      .json()
      .catch(() => null);

    if (!response.ok) {
      // General error handling, as your custom serializer might return errors differently
      const errorMessage =
        responseData?.username?.join(" ") ||
        responseData?.email?.join(" ") ||
        responseData?.password1?.join(" ") ||
        responseData?.password2?.join(" ") ||
        responseData?.store_name?.join(" ") ||
        responseData?.business_email?.join(" ") ||
        responseData?.phone_number?.join(" ") ||
        responseData?.business_address?.join(" ") ||
        responseData?.tax_id?.join(" ") ||
        responseData?.non_field_errors?.join(" ") ||
        responseData?.detail ||
        "Seller registration failed";

      throw new Error(errorMessage);
    }

    if (responseData && responseData.access && responseData.refresh) {
      setAuthTokens(responseData.access, responseData.refresh);
    } else {
      console.warn(
        "Seller registration response did not contain new access/refresh tokens. User might need to log in separately after registration.",
      );
    }

    const userData: User = responseData.user || responseData;

    console.log("Seller registration successful:", userData);
    return userData;
  } catch (error) {
    console.error("Seller registration error:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Network error during seller registration",
    );
  }
};

// Service function to fetch the authenticated user's data
// This function will now use the requestWithAuth wrapper
export const fetchAuthenticatedUser = async (): Promise<User | null> => {
  const endpoint = `${API_URL}/dj-rest-auth/user/`;
  console.log(`Attempting to fetch authenticated user via API: ${endpoint}`);

  try {
    // Use the new requestWithAuth wrapper for all authenticated API calls
    const response = await requestWithAuth(endpoint, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      // If we reach here and it's not ok, it's a non-auth related API error
      const errorData = await response.json().catch(() => null);
      const errorMessage =
        errorData?.detail ||
        errorData?.message ||
        `Failed to fetch authenticated user (Status: ${response.status})`;
      console.error("fetchAuthenticatedUser API Error response:", errorData);
      throw new Error(errorMessage);
    }

    const userData: User = await response.json();
    console.log(
      "fetchAuthenticatedUser: User data fetched successfully.",
      userData,
    );
    return userData;
  } catch (error) {
    console.error("Error fetching authenticated user:", error);
    return null; // Return null on error to indicate no user data
  }
};

// Service function to handle user logout
export const logoutUser = async (): Promise<void> => {
  const endpoint = `${API_URL}/dj-rest-auth/logout/`;
  console.log(`Attempting to log out via API: ${endpoint}`);

  try {
    // Use requestWithAuth for logout as well for consistency
    const response = await requestWithAuth(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage =
        errorData?.detail ||
        errorData?.message ||
        `Logout failed (Status: ${response.status})`;
      console.error("Logout API Error response:", errorData);
      throw new Error(errorMessage);
    }

    clearAuthTokens(); // Always clear local tokens on successful logout
    console.log("Logout successful.");
  } catch (error) {
    console.error("Error during logout:", error);
    clearAuthTokens(); // Even if API fails, clear local tokens to ensure client-side state is clean
    throw new Error(
      error instanceof Error ? error.message : "Network error during logout",
    );
  }
};
