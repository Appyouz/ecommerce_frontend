const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
export async function registerUser(formData: {
  username: string;
  email: string;
  password1: string;
  password2: string;
}) {
  const endpoint = `${API_URL}/dj-rest-auth/registration/`;
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(formData),
    });

    // First check if response is JSON
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

    return responseData;
  } catch (error) {
    console.error("Registration error:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Network error during registration",
    );
  }
}

export const login = async (username: string, password: string) => {
  const endpoint = `${API_URL}/dj-rest-auth/login/`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      credentials: "include", // Important for cookies
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    // Check if response is JSON
    const contentType = response.headers.get("content-type");
    const responseData = contentType?.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      // Handle Django REST framework error format
      const errorMessage =
        responseData?.non_field_errors?.join(" ") ||
        responseData?.detail ||
        "Login failed";

      throw new Error(errorMessage);
    }

    return responseData;
  } catch (error) {
    console.error("Login error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Network error during login",
    );
  }
};

export const fetchHomeData = async () => {
  const endpoint = `${API_URL}/`;

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    });

    // Check if response is JSON before parsing
    const contentType = response.headers.get("content-type");
    const responseData = contentType?.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      // If authentication fails (e.g., 401 status), throw an error
      const errorMessage =
        responseData?.detail ||
        responseData?.message ||
        "Failed to fetch home data";
      throw new Error(errorMessage);
    }

    return responseData; // { message: "Hello world" } on success
  } catch (error) {
    console.error("Error fetching home data:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Network error fetching home data",
    );
  }
};

export const logoutUser = async () => {
  const endpoint = `${API_URL}/dj-rest-auth/logout/`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      credentials: "include", // IMPORTANT: Sends authentication cookies to backend!
      headers: {
        "X-CSRFToken": getCookie("csrftoken") || "",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      // Handle non-2xx responses (logout might return 200, 204 No Content)
      const errorData = await response.json().catch(() => null); // Try parsing JSON, ignore if fails
      const errorMessage = errorData?.detail || "Logout failed";
      throw new Error(errorMessage);
    }

    // If response.ok is true, logout was successful on backend
    console.log("Logout successful on backend");
    // No need to return data, just confirm success
  } catch (error) {
    console.error("Error during logout:", error);
    throw new Error(
      error instanceof Error ? error.message : "Network error during logout",
    );
  }
};

// Helper function to send a cookie value by name
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

type AuthenticatedUserResponse = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
};

export const fetchAuthenticatedUser =
  async (): Promise<AuthenticatedUserResponse | null> => {
    const endpoint = `${API_URL}/dj-rest-auth/user/`;

    try {
      const response = await fetch(endpoint, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      if (response.status === 401) {
        console.log("User is not authenticated (401 response)");
        return null;
      }

      if (!response.ok) {
        // Handle other non-2xx errors (e.g., 403 Forbidden, 500 Internal Server Error)
        const errorData = await response.json().catch(() => null);
        const errorMessage =
          errorData?.detail ||
          errorData?.message ||
          `Failed to fetch user data (Status: ${response.status})`;
        console.error("Error fetching authenticated user:", errorMessage);
        throw new Error(errorMessage); // Throw error for unexpected failures
      }

      // If response is OK (2xx) and not 401, parse and return user data
      const userData: AuthenticatedUserResponse = await response.json();
      console.log("User is authenticated:", userData);
      return userData; // Return user data
    } catch (error) {
      console.error(
        "Network or unexpected error fetching authenticated user:",
        error,
      );
      return null;
    }
  };
