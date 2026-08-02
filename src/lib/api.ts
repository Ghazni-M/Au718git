// src/lib/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL?.trim();

const baseURL = API_BASE_URL 
  ? (API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL)
  : '';   // Empty = use Vite proxy (recommended for dev)

export async function api<T = any>(
  path: string, 
  options: RequestInit = {}
): Promise<T> {
  // If path is already a full URL, use it as-is
  const isFullUrl = path.startsWith('http://') || path.startsWith('https://');
  const url = isFullUrl 
    ? path 
    : `${baseURL}${path.startsWith('/') ? '' : '/'}${path}`;

  const config: RequestInit = {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      let errorMessage = `HTTP Error: ${response.status}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        // Ignore JSON parse error
      }

      throw new Error(errorMessage);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return { success: true } as T;
    }

    return await response.json();

  } catch (error: any) {
    console.error(`API Error [${path}]:`, error.message);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(`Network error: Cannot connect to server (${url}). Check if backend is running.`);
    }
    
    throw error;
  }
}