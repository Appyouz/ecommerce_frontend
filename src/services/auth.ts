import { LoginResponse, User } from "@/types";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Define the shape of the registration response
type RegisterResponse = {
  user: User;
};

type GetAccessTokenResponse = {
  access_token: string;
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
      credentials: "include",
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

    // If login is successful, the HttpOnly cookies are set by the backend.
    // The response body might contain user data, but not necessarily the tokens.
    const data: LoginResponse = await response.json();
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
      headers: {
        Accept: "application/json",
      },
      credentials: "include",
    });

    if (response.status === 401) {
      // User is not authenticated based on the cookie
      console.log("fetchAuthenticatedUser: User not authenticated (401).");
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
    // Return null or re-throw depending on desired error handling
    // If there's a network error, it might mean the user *is* authenticated but the request failed.
    // However, for initial auth check, returning null on error is often acceptable.
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
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        // Include CSRF token for POST requests if CSRF protection is enabled
        "X-CSRFToken": getCookie("csrftoken") || "",
      },
      credentials: "include",
      // Some logout endpoints might require sending the refresh token in the body
      // Check dj-rest-auth docs if needed, but often cookie is sufficient.
      // body: JSON.stringify({ refresh_token: '...' })
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
    // No need to handle tokens here as they are removed via HttpOnly cookie on backend
  } catch (error) {
    console.error("Error during logout:", error);
    throw new Error(
      error instanceof Error ? error.message : "Network error during logout",
    );
  }
};

// Helper function to send a cookie value by name (used for CSRF token)
function getCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }
  return null;
}

// Implement the secure getAuthToken function
// This function calls the backend endpoint to retrieve the access token string
// from the HttpOnly cookie.
export const getAuthToken = async (): Promise<string | null> => {
  const endpoint = `${API_URL}/auth/get-token/`;
  console.log(`Attempting to retrieve access token from backend: ${endpoint}`);

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      credentials: "include",
    });

    if (response.status === 401) {
      console.log(
        "getAuthToken: User not authenticated (401 response from backend).",
      );
      return null;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage =
        errorData?.detail ||
        errorData?.message ||
        `Failed to retrieve access token (Status: ${response.status})`;
      console.error("getAuthToken API Error response:", errorData);
      throw new Error(errorMessage);
    }

    // Parse the response body which should contain the access token string
    const data: GetAccessTokenResponse = await response.json();
    console.log("getAuthToken: Access token retrieved successfully.");
    return data.access_token;
  } catch (error) {
    console.error("Error retrieving access token:", error);
    // If there's a network error, assume token is not available
    return null;
  }
};
