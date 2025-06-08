import { User } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
      credentials: "include",
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
    console.log("Login successful. User data:", data.user);

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
      },
      credentials: "include",
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
  } catch (error) {
    console.error("Error during logout:", error);
    throw new Error(
      error instanceof Error ? error.message : "Network error during logout",
    );
  }
};
