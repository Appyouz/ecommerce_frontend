import { User } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// --- Token Management Functions ---
const ACCESS_TOKEN_KEY = "access";
const REFRESH_TOKEN_KEY = "refresh";

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
    clearAuthTokens();
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
    const newAccessToken = data.access;
    const newRefreshToken = data.refresh || refreshToken; // Refresh token rotation if backend sends new one

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
    !url.toString().includes("/dj-rest-auth/registration/")
  ) {
    console.warn("Received 401. Attempting token refresh...");
    try {
      const newAccessToken = await refreshAccessToken(); // Attempt to refresh
      headers = { ...headers, Authorization: `Bearer ${newAccessToken}` }; // Update header
      // Retry the original request with the new token
      console.log("Retrying original request with new access token...");
      response = await fetch(url, { ...options, headers });
    } catch (refreshError) {
      console.error("Failed to refresh token. Redirecting to login.");
      // If refresh fails, clear tokens and re-throw to trigger logout/login page
      clearAuthTokens();
      throw new Error("Authentication required. Please log in.");
    }
  }

  // If after refresh (or initial attempt), the response is still 401
  if (response.status === 401) {
    console.warn("Request still resulted in 401 after refresh attempt.");
    clearAuthTokens(); // Ensure tokens are cleared if still unauthorized
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

    const data = await response.json();
    console.log("Login successful. Full response data:", data); // Log full data to see tokens

    // Store the tokens received from the backend
    if (data.access_token && data.refresh_token) {
      // dj-rest-auth with JWTSerializer uses access_token and refresh_token
      setAuthTokens(data.access_token, data.refresh_token);
    } else if (data.key) {
      console.warn(
        "Received 'key' instead of JWT tokens. Check backend configuration.",
      );
      setAuthTokens(data.key, ""); // Store as access token, no refresh
    } else {
      console.error(
        "Login response did not contain expected access/refresh tokens.",
      );
      throw new Error("Login successful, but tokens not found in response.");
    }

    return data.user;
  } catch (error) {
    console.error("Error during login:", error);
    throw new Error(
      error instanceof Error ? error.message : "Network error during login",
    );
  }
};

// Service function to handle user registration
export const registerUser = async (formData: {
  username: string;
  email: string;
  password1: string;
  password2: string;
}): Promise<User> => {
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

    const contentType = response.headers.get("content-type");
    const responseData = contentType?.includes("application/json")
      ? await response.json()
      : await response.text();

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

    // After successful registration, dj-rest-auth/registration might return tokens.
    // If it does, store them.
    if (responseData.access_token && responseData.refresh_token) {
      setAuthTokens(responseData.access_token, responseData.refresh_token);
    } else {
      console.warn(
        "Registration response did not contain new access/refresh tokens. User might need to log in separately.",
      );
      // If registration doesn't return tokens, the user will need to explicitly log in.
      // Might want to handle this UI flow in your component.
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

// Service function to fetch the authenticated user's data
// This function will now use the requestWithAuth wrapper
export const fetchAuthenticatedUser = async (): Promise<User | null> => {
  const endpoint = `${API_URL}/dj-rest-auth/user/`;
  console.log(`Attempting to fetch authenticated user via API: ${endpoint}`);

  try {
    // Use the new requestWithAuth wrapper
    const response = await requestWithAuth(endpoint, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    // requestWithAuth already handles 401 for token expiry/refresh.
    // If it reaches here, it implies a successful request or a persistent 401
    // that was re-thrown by requestWithAuth.
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
    // If requestWithAuth threw an error (e.g., auth required), return null to indicate no user
    return null;
  }
};

// Service function to handle user logout
export const logoutUser = async (): Promise<void> => {
  const endpoint = `${API_URL}/dj-rest-auth/logout/`;
  console.log(`Attempting to log out via API: ${endpoint}`);

  try {
    // Use requestWithAuth for logout as well, though it doesn't need a token,
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

    // Always clear local tokens on successful logout
    clearAuthTokens();
    console.log("Logout successful.");
  } catch (error) {
    console.error("Error during logout:", error);
    // Even if logout API call fails, clear local tokens to ensure client-side state is clean
    clearAuthTokens();
    throw new Error(
      error instanceof Error ? error.message : "Network error during logout",
    );
  }
};
