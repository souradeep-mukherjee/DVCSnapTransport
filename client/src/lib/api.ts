import { apiRequest } from "./queryClient";

// Admin API calls
export const adminLogin = async (username: string, password: string) => {
  try {
    console.log("api.ts: Making admin login request to /api/admin/login");
    
    // Direct fetch for login to avoid circular dependency with authorization
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      credentials: 'include'
    });
    
    console.log("api.ts: Login response status:", res.status);
    
    // Parse response data first, regardless of status
    let responseData;
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseData = await res.json();
      console.log("api.ts: Parsed JSON response:", responseData);
    } else {
      responseData = await res.text();
      console.log("api.ts: Got text response:", responseData);
    }
    
    // Handle error cases
    if (!res.ok) {
      console.error("api.ts: Login failed with status", res.status);
      const errorMessage = typeof responseData === 'string' 
        ? responseData 
        : (responseData.message || res.statusText);
      throw new Error(errorMessage);
    }
    
    console.log("api.ts: Login successful, token received");
    return responseData;
  } catch (error) {
    console.error('api.ts: Login error:', error);
    throw error;
  }
};

export const getPendingUsers = async () => {
  try {
    const res = await apiRequest('GET', '/api/admin/users/pending');
    return await res.json();
  } catch (error) {
    console.error('Error fetching pending users:', error);
    throw error;
  }
};

export const updateUserStatus = async (id: number, status: string) => {
  try {
    const res = await apiRequest('PUT', '/api/admin/users/status', { id, status });
    return await res.json();
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
};

export const getPendingBookings = async () => {
  try {
    const res = await apiRequest('GET', '/api/admin/bookings/pending');
    return await res.json();
  } catch (error) {
    console.error('Error fetching pending bookings:', error);
    throw error;
  }
};

export const updateBookingStatus = async (id: number, status: string) => {
  try {
    const res = await apiRequest('PATCH', '/api/admin/bookings/status', { id, status });
    return await res.json();
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw error;
  }
};

export const getApprovedBookings = async () => {
  try {
    const res = await apiRequest('GET', '/api/admin/bookings/approved');
    return await res.json();
  } catch (error) {
    console.error('Error fetching approved bookings:', error);
    throw error;
  }
};

export const getAllDrivers = async () => {
  try {
    const res = await apiRequest('GET', '/api/admin/drivers');
    return await res.json();
  } catch (error) {
    console.error('Error fetching drivers:', error);
    throw error;
  }
};

export const allocateDriver = async (bookingId: number, driverId: number) => {
  try {
    const res = await apiRequest('POST', '/api/admin/allocate', { bookingId, driverId });
    return await res.json();
  } catch (error) {
    console.error('Error allocating driver:', error);
    throw error;
  }
};
