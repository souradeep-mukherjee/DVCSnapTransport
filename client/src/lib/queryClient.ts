import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Get the API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Utility function to prepend the API base URL if the url doesn't start with http
 */
function getFullUrl(url: string): string {
  if (url.startsWith('http')) {
    return url; // Already a full URL
  }
  return `${API_BASE_URL}${url}`;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Get token from localStorage for authorized requests
  const token = localStorage.getItem("adminToken");
  const headers: Record<string, string> = {
    ...(data ? { "Content-Type": "application/json" } : {})
  };
  
  // Add Authorization header if token exists
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  const fullUrl = getFullUrl(url);
  console.log(`Making ${method} request to ${fullUrl} with token: ${token ? 'Yes' : 'No'}`);

  // Use mode: 'cors' for cross-origin requests when frontend and backend are separate
  const res = await fetch(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
    mode: 'cors'
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`API error: ${res.status} - ${errorText || res.statusText}`);
    throw new Error(`${res.status}: ${errorText || res.statusText}`);
  }
  
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Get token from localStorage for authorized requests
    const token = localStorage.getItem("adminToken");
    const headers: Record<string, string> = {};
    
    // Add Authorization header if token exists
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const url = queryKey[0] as string;
      const fullUrl = getFullUrl(url);
      
      // Use mode: 'cors' for cross-origin requests when frontend and backend are separate
      const res = await fetch(fullUrl, {
        credentials: "include",
        headers,
        mode: 'cors'
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`API error ${res.status}: ${errorText || res.statusText}`);
      }
      
      return await res.json();
    } catch (error) {
      console.error("Query error:", error);
      
      // If it's a 401 and we want to return null, do that
      if (unauthorizedBehavior === "returnNull" && error instanceof Error && error.message.includes("401")) {
        return null;
      }
      
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
