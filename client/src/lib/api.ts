import { apiRequest } from "./queryClient";

// Admin API calls
export const adminLogin = async (username: string, password: string) => {
  try {
    const res = await apiRequest('POST', '/api/admin/login', { username, password });
    return await res.json();
  } catch (error) {
    console.error('Login error:', error);
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
