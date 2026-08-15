// src/lib/api.ts

/**
 * Central API client for the AU718 Gold Store frontend.
 *
 * Development:
 *   - Uses Vite's /api proxy when VITE_API_URL is not defined.
 *
 * Production:
 *   - Uses the Railway backend automatically.
 *
 */

const RAILWAY_API_URL = 'https://au718git-production.up.railway.app';

const ENV_API_URL =
  typeof import.meta.env.VITE_API_URL === 'string'
    ? import.meta.env.VITE_API_URL.trim()
    : '';

/**
 * Remove trailing slashes so URLs don't become:
 * https://example.com//api/products
 */
const normalizeBaseURL = (url: string): string => {
  return url.replace(/\/+$/, '');
};

/**
 * In production, always use the Railway backend unless
 * VITE_API_URL has explicitly been configured.
 *
 * In development, leave the base URL empty when no
 * VITE_API_URL is supplied so Vite's /api proxy works.
 */
const isProduction = import.meta.env.PROD;

const baseURL = ENV_API_URL
  ? normalizeBaseURL(ENV_API_URL)
  : isProduction
    ? RAILWAY_API_URL
    : '';

/**
 * Build the final request URL.
 */
const buildURL = (path: string): string => {
  const trimmedPath = path.trim();

  // Allow callers to provide a complete URL.
  if (
    trimmedPath.startsWith('http://') ||
    trimmedPath.startsWith('https://')
  ) {
    return trimmedPath;
  }

  const normalizedPath = trimmedPath.startsWith('/')
    ? trimmedPath
    : `/${trimmedPath}`;

  return `${baseURL}${normalizedPath}`;
};

/**
 * Generic API request helper.
 */
export async function api<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = buildURL(path);

  /**
   * Don't force Content-Type on GET/DELETE requests.
   *
   * This helps avoid unnecessary CORS preflight requests.
   */
  const headers = new Headers(options.headers);

  if (
    options.body &&
    !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json');
  }

  const config: RequestInit = {
    ...options,

    /**
     * Keep credentials enabled because your authentication
     * system uses cookies/JWT authentication.
     */
    credentials: 'include',

    headers,
  };

  try {
    const response = await fetch(url, config);

    /**
     * Handle 204 No Content.
     */
    if (response.status === 204) {
      return { success: true } as T;
    }

    /**
     * Read the response safely.
     */
    const contentType = response.headers.get('content-type') || '';

    let data: any;

    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();

      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = text;
      }
    }

    /**
     * Convert HTTP errors into useful JavaScript errors.
     */
    if (!response.ok) {
      const errorMessage =
        data?.message ||
        data?.error ||
        (typeof data === 'string' && data.trim()
          ? data
          : `HTTP Error: ${response.status} ${response.statusText}`);

      throw new Error(errorMessage);
    }

    return data as T;
  } catch (error: any) {
    console.error(`API Error [${path}]`, {
      url,
      message: error?.message,
      error,
    });

    /**
     * Fetch/network failures normally arrive as TypeError.
     */
    if (
      error instanceof TypeError ||
      error?.name === 'TypeError'
    ) {
      throw new Error(
        `Network error: Cannot connect to the backend at ${url}. ` +
        `Please check the Railway server, CORS configuration, ` +
        `and network connection.`
      );
    }

    throw error;
  }
}

/**
 * Convenience helpers.
 */

export async function get<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  return api<T>(path, {
    ...options,
    method: 'GET',
  });
}

export async function post<T = any>(
  path: string,
  body?: unknown,
  options: RequestInit = {}
): Promise<T> {
  return api<T>(path, {
    ...options,
    method: 'POST',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export async function put<T = any>(
  path: string,
  body?: unknown,
  options: RequestInit = {}
): Promise<T> {
  return api<T>(path, {
    ...options,
    method: 'PUT',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export async function patch<T = any>(
  path: string,
  body?: unknown,
  options: RequestInit = {}
): Promise<T> {
  return api<T>(path, {
    ...options,
    method: 'PATCH',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export async function del<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  return api<T>(path, {
    ...options,
    method: 'DELETE',
  });
}

/**
 * Export the resolved API URL for debugging if needed.
 */
export { baseURL };