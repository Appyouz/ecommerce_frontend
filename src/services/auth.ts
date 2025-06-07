import { LoginResponse, User } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Define the shape of the registration response
type RegisterResponse = {
  user: User;
};

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

    const data: LoginResponse = await response.json();

    // Store access token in localStorage
    if (data.access_token) {
      localStorage.setItem("access_token", data.access_token);
    } else {
      console.warn("No access_token returned in login response.");
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

export const fetchAuthenticatedUser = async (): Promise<User | null> => {
  const endpoint = `${API_URL}/dj-rest-auth/user/`;
  console.log(`Attempting to fetch authenticated user via API: ${endpoint}`);

  const token = localStorage.getItem("access_token");
  if (!token) {
    console.log("No access token found, user not authenticated.");
    return null;
  }

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
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
    console.log("Authenticated user fetched successfully.", userData);
    return userData;
  } catch (error) {
    console.error("Error fetching authenticated user:", error);
    return null;
  }
};

export const logoutUser = async (): Promise<void> => {
  console.log("Logging out user...");

  // Optionally: you can still call /dj-rest-auth/logout/ if you want to tell backend
  try {
    const endpoint = `${API_URL}/dj-rest-auth/logout/`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage =
        errorData?.detail ||
        errorData?.message ||
        `Logout failed (Status: ${response.status})`;
      console.error("Logout API Error response:", errorData);
      // Do not throw here — we will still clear token on client
    } else {
      console.log("Backend logout successful.");
    }
  } catch (error) {
    console.error("Error during logout:", error);
    // Proceed to clear token anyway
  }

  // Always clear access_token locally
  localStorage.removeItem("access_token");
  console.log("Access token removed from localStorage. Logout complete.");
};
