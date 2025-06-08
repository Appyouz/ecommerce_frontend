import { User } from "@/types";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Define the shape of the login response when using header authentication
type LoginResponseWithTokens = {
  user: User;
  access: string; // Changed from access_token
  refresh: string; // Changed from refresh_token
};

// Helper function to get the current access token from localStorage
const getAccessToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("access_token");
  }
  return null;
};

// Helper function to clear all auth tokens from localStorage
export const clearAuthTokens = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token"); // If store refresh token
  }
};

// Helper function to get authorization headers
export const getAuthHeaders = () => {
  const token = getAccessToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
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

    const data: LoginResponseWithTokens = await response.json();
    // CHANGE 2: Check for 'data.access' instead of 'data.access_token'
    if (data.access) {
      if (typeof window !== "undefined") {
        // We store it as 'access_token' in localStorage for consistency with `getAccessToken`
        localStorage.setItem("access_token", data.access);
        // CHANGE 3: Check for 'data.refresh' instead of 'data.refresh_token'
        // If backend also returns refresh_token in the body, store it:
        if (data.refresh) {
          localStorage.setItem("refresh_token", data.refresh);
        }
      }
    } else {
      // This case indicates backend didn't return tokens as expected
      console.error("Login successful but no tokens received:", data);
      throw new Error("Login successful, but failed to retrieve tokens.");
    }

    console.log("Login successful:", data.user);
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
      // Handle Django REST framework error format
      const errorMessage =
        responseData?.username?.join(" ") ||
        responseData?.email?.join(" ") ||
        responseData?.password1?.join(" ") ||
        responseData?.password2?.join(" ") ||
        responseData?.non_field_errors?.join(" ") ||
        "Registration failed";

      throw new Error(errorMessage);
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
export const fetchAuthenticatedUser = async (): Promise<User | null> => {
  const endpoint = `${API_URL}/dj-rest-auth/user/`;
  console.log(`Attempting to fetch authenticated user via API: ${endpoint}`);

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (response.status === 401) {
      // User is not authenticated. Clear any stale tokens.
      console.log(
        "fetchAuthenticatedUser: User not authenticated (401). Clearing tokens.",
      );
      clearAuthTokens();
      return null;
    }

    if (!response.ok) {
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
    return null;
  }
};

// Service function to handle user logout
export const logoutUser = async (): Promise<void> => {
  const endpoint = `${API_URL}/dj-rest-auth/logout/`;
  console.log(`Attempting to log out via API: ${endpoint}`);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: getAuthHeaders(),
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

    console.log("Logout successful.");
    clearAuthTokens();
  } catch (error) {
    console.error("Error during logout:", error);
    throw new Error(
      error instanceof Error ? error.message : "Network error during logout",
    );
  }
};
