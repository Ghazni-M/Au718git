// src/lib/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL?.trim();

if (!API_BASE_URL) {
  throw new Error("❌ VITE_API_URL is not configured in your .env file");
}

// Ensure proper URL formatting
const baseURL = API_BASE_URL.endsWith('/') 
  ? API_BASE_URL.slice(0, -1) 
  : API_BASE_URL;

export async function api<T = any>(
  path: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${baseURL}${path.startsWith('/') ? '' : '/'}${path}`;

  const config: RequestInit = {
    credentials: "include",           // Important for cookies/auth
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    // Handle HTTP errors
    if (!response.ok) {
      let errorMessage = `HTTP Error: ${response.status}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        // Ignore if can't parse JSON
      }

      throw new Error(errorMessage);
    }

    // Some endpoints return no content (204)
    if (response.status === 204) {
      return { success: true } as T;
    }

    // Return parsed JSON
    return await response.json();

  } catch (error: any) {
    console.error(`API Error [${path}]:`, error.message);
    
    // Re-throw with better message for network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error("Network error: Cannot connect to server. Check if backend is running.");
    }
    
    throw error;
  }
}