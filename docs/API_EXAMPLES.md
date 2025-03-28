# DVC SnapE API Usage Examples

This document provides practical examples of how to interact with the DVC SnapE Transport Booking System API using different programming languages and tools.

## Prerequisites

- Base URL: `http://localhost:5000` (or your deployment URL)
- Authentication tokens as required

## Examples by Programming Language

### cURL

#### Admin Login

```bash
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

#### Get Pending User Registrations (Admin)

```bash
curl -X GET http://localhost:5000/api/admin/users/pending \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

#### Update User Status (Admin)

```bash
curl -X PUT http://localhost:5000/api/admin/users/status \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"id": 1, "status": "approved"}'
```

#### User Registration

```bash
curl -X POST http://localhost:5000/api/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "+919876543210",
    "employeeNumber": "EMP123",
    "department": "Finance"
  }'
```

#### Create Booking (User)

```bash
curl -X POST http://localhost:5000/api/user/bookings \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "purpose": "Client Meeting",
    "pickupAddress": "Office, Building A",
    "dropAddress": "Client Office, Downtown",
    "pickupDateTime": "2025-04-01T14:00:00",
    "returnDateTime": "2025-04-01T17:00:00"
  }'
```

### JavaScript (Node.js)

#### Admin Login and User Management

```javascript
const axios = require('axios');

// Base URL for API
const API_BASE_URL = 'http://localhost:5000';

// Admin Login
async function adminLogin(username, password) {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/admin/login`, {
      username,
      password
    });
    
    return response.data.token;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw error;
  }
}

// Get Pending Users
async function getPendingUsers(token) {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/admin/users/pending`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching pending users:', error.response?.data || error.message);
    throw error;
  }
}

// Approve User
async function approveUser(token, userId) {
  try {
    const response = await axios.put(`${API_BASE_URL}/api/admin/users/status`, {
      id: userId,
      status: 'approved'
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error approving user:', error.response?.data || error.message);
    throw error;
  }
}

// Example usage
async function manageUsers() {
  try {
    // 1. Login as admin
    const token = await adminLogin('admin', 'admin123');
    console.log('Admin login successful, token:', token);
    
    // 2. Get pending users
    const pendingUsers = await getPendingUsers(token);
    console.log('Pending users:', pendingUsers);
    
    // 3. Approve the first pending user if any exists
    if (pendingUsers.length > 0) {
      const updatedUser = await approveUser(token, pendingUsers[0].id);
      console.log('User approved:', updatedUser);
    }
  } catch (error) {
    console.error('Operation failed:', error);
  }
}

manageUsers();
```

#### Booking Management and Driver Allocation

```javascript
const axios = require('axios');

// Base URL for API
const API_BASE_URL = 'http://localhost:5000';

// Get token from previous login
const ADMIN_TOKEN = 'YOUR_ADMIN_TOKEN';

// Get Approved Bookings
async function getApprovedBookings() {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/admin/bookings/approved`, {
      headers: {
        Authorization: `Bearer ${ADMIN_TOKEN}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching approved bookings:', error.response?.data || error.message);
    throw error;
  }
}

// Get Available Drivers
async function getAllDrivers() {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/admin/drivers`, {
      headers: {
        Authorization: `Bearer ${ADMIN_TOKEN}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching drivers:', error.response?.data || error.message);
    throw error;
  }
}

// Allocate Driver to Booking
async function allocateDriver(bookingId, driverId) {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/admin/allocate`, {
      bookingId,
      driverId
    }, {
      headers: {
        Authorization: `Bearer ${ADMIN_TOKEN}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error allocating driver:', error.response?.data || error.message);
    throw error;
  }
}

// Example usage
async function manageAllocations() {
  try {
    // 1. Get approved bookings waiting for allocation
    const approvedBookings = await getApprovedBookings();
    console.log('Approved bookings:', approvedBookings);
    
    // Find a booking that needs allocation
    const unallocatedBooking = approvedBookings.find(booking => !booking.allocation);
    
    if (unallocatedBooking) {
      // 2. Get all drivers
      const drivers = await getAllDrivers();
      console.log('Available drivers:', drivers);
      
      // 3. Allocate a driver to the booking if any driver is available
      if (drivers.length > 0) {
        const allocation = await allocateDriver(unallocatedBooking.id, drivers[0].id);
        console.log('Driver allocated:', allocation);
      } else {
        console.log('No drivers available for allocation');
      }
    } else {
      console.log('No bookings waiting for allocation');
    }
  } catch (error) {
    console.error('Operation failed:', error);
  }
}

manageAllocations();
```

### Python

#### User Registration and Login

```python
import requests
import json

# Base URL for API
API_BASE_URL = 'http://localhost:5000'

# User Registration
def register_user(name, email, phone_number, employee_number, department):
    url = f"{API_BASE_URL}/api/user/register"
    payload = {
        "name": name,
        "email": email,
        "phoneNumber": phone_number,
        "employeeNumber": employee_number,
        "department": department
    }
    
    headers = {'Content-Type': 'application/json'}
    
    response = requests.post(url, headers=headers, data=json.dumps(payload))
    
    if response.status_code == 201:
        return response.json()
    else:
        print(f"Registration failed: {response.text}")
        return None

# Verify OTP
def verify_otp(phone_number, otp):
    url = f"{API_BASE_URL}/api/user/verify-otp"
    payload = {
        "phoneNumber": phone_number,
        "otp": otp
    }
    
    headers = {'Content-Type': 'application/json'}
    
    response = requests.post(url, headers=headers, data=json.dumps(payload))
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"OTP verification failed: {response.text}")
        return None

# User Login (Request OTP)
def request_login_otp(phone_number):
    url = f"{API_BASE_URL}/api/user/login"
    payload = {"phoneNumber": phone_number}
    
    headers = {'Content-Type': 'application/json'}
    
    response = requests.post(url, headers=headers, data=json.dumps(payload))
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Login OTP request failed: {response.text}")
        return None

# Verify Login OTP
def verify_login_otp(phone_number, otp):
    url = f"{API_BASE_URL}/api/user/login/verify"
    payload = {
        "phoneNumber": phone_number,
        "otp": otp
    }
    
    headers = {'Content-Type': 'application/json'}
    
    response = requests.post(url, headers=headers, data=json.dumps(payload))
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Login OTP verification failed: {response.text}")
        return None

# Example usage
def main():
    # 1. Register a new user
    new_user = register_user(
        name="Alice Johnson",
        email="alice@example.com",
        phone_number="+919876543212",
        employee_number="EMP125",
        department="Technology"
    )
    
    if new_user:
        print(f"User registered successfully: {new_user}")
        
        # In a real app, you would get the OTP from the user
        # Here we're simulating receiving an OTP
        otp = input("Enter the OTP received: ")
        
        # 2. Verify registration OTP
        verification = verify_otp("+919876543212", otp)
        if verification:
            print("Registration verification successful!")
            
            # 3. Try logging in (after admin approval in real scenario)
            print("After admin approval, you can login...")
            
            # 4. Request login OTP
            login_request = request_login_otp("+919876543212")
            if login_request:
                print("Login OTP sent successfully")
                
                # Again, get OTP from user input
                login_otp = input("Enter the login OTP received: ")
                
                # 5. Verify login OTP
                login_result = verify_login_otp("+919876543212", login_otp)
                if login_result:
                    print(f"Login successful! Token: {login_result['token']}")
                    print(f"User details: {login_result['user']}")

if __name__ == "__main__":
    main()
```

#### Creating and Managing Bookings

```python
import requests
import json

# Base URL for API
API_BASE_URL = 'http://localhost:5000'

# Token from previous login
USER_TOKEN = 'YOUR_USER_TOKEN'

# Create a booking
def create_booking(purpose, pickup_address, drop_address, pickup_date_time, return_date_time=None):
    url = f"{API_BASE_URL}/api/user/bookings"
    
    # Prepare payload
    payload = {
        "purpose": purpose,
        "pickupAddress": pickup_address,
        "dropAddress": drop_address,
        "pickupDateTime": pickup_date_time
    }
    
    # Add return date time if provided
    if return_date_time:
        payload["returnDateTime"] = return_date_time
    
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {USER_TOKEN}'
    }
    
    response = requests.post(url, headers=headers, data=json.dumps(payload))
    
    if response.status_code == 201:
        return response.json()
    else:
        print(f"Booking creation failed: {response.text}")
        return None

# Example usage
def main():
    # Create a new booking
    booking = create_booking(
        purpose="Team Outing",
        pickup_address="Office HQ, Tech Park",
        drop_address="Adventure Resort, Highway 66",
        pickup_date_time="2025-04-15T09:00:00",
        return_date_time="2025-04-15T18:00:00"
    )
    
    if booking:
        print(f"Booking created successfully: {booking}")
        print("Waiting for admin approval...")

if __name__ == "__main__":
    main()
```

## Postman Collection

You can import the following Postman collection to test all the API endpoints:

```json
{
  "info": {
    "_postman_id": "8f5e3b4a-2c1d-4c7e-a85e-6e9d7fb7b123",
    "name": "DVC SnapE API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Admin",
      "item": [
        {
          "name": "Admin Login",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n    \"username\": \"admin\",\n    \"password\": \"admin123\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/admin/login",
              "host": ["{{baseUrl}}"],
              "path": ["api", "admin", "login"]
            }
          },
          "response": []
        },
        {
          "name": "Get Pending Users",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{adminToken}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/admin/users/pending",
              "host": ["{{baseUrl}}"],
              "path": ["api", "admin", "users", "pending"]
            }
          },
          "response": []
        },
        {
          "name": "Update User Status",
          "request": {
            "method": "PUT",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{adminToken}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n    \"id\": 1,\n    \"status\": \"approved\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/admin/users/status",
              "host": ["{{baseUrl}}"],
              "path": ["api", "admin", "users", "status"]
            }
          },
          "response": []
        },
        {
          "name": "Get Pending Bookings",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{adminToken}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/admin/bookings/pending",
              "host": ["{{baseUrl}}"],
              "path": ["api", "admin", "bookings", "pending"]
            }
          },
          "response": []
        },
        {
          "name": "Update Booking Status",
          "request": {
            "method": "PATCH",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{adminToken}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n    \"id\": 1,\n    \"status\": \"approved\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/admin/bookings/status",
              "host": ["{{baseUrl}}"],
              "path": ["api", "admin", "bookings", "status"]
            }
          },
          "response": []
        },
        {
          "name": "Get Approved Bookings",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{adminToken}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/admin/bookings/approved",
              "host": ["{{baseUrl}}"],
              "path": ["api", "admin", "bookings", "approved"]
            }
          },
          "response": []
        },
        {
          "name": "Get All Drivers",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{adminToken}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/admin/drivers",
              "host": ["{{baseUrl}}"],
              "path": ["api", "admin", "drivers"]
            }
          },
          "response": []
        },
        {
          "name": "Allocate Driver",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{adminToken}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n    \"bookingId\": 1,\n    \"driverId\": 1\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/admin/allocate",
              "host": ["{{baseUrl}}"],
              "path": ["api", "admin", "allocate"]
            }
          },
          "response": []
        }
      ]
    },
    {
      "name": "User",
      "item": [
        {
          "name": "Register User",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n    \"name\": \"John Doe\",\n    \"email\": \"john@example.com\",\n    \"phoneNumber\": \"+919876543210\",\n    \"employeeNumber\": \"EMP123\",\n    \"department\": \"Finance\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/user/register",
              "host": ["{{baseUrl}}"],
              "path": ["api", "user", "register"]
            }
          },
          "response": []
        },
        {
          "name": "Verify Registration OTP",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n    \"phoneNumber\": \"+919876543210\",\n    \"otp\": \"123456\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/user/verify-otp",
              "host": ["{{baseUrl}}"],
              "path": ["api", "user", "verify-otp"]
            }
          },
          "response": []
        },
        {
          "name": "User Login (Request OTP)",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n    \"phoneNumber\": \"+919876543210\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/user/login",
              "host": ["{{baseUrl}}"],
              "path": ["api", "user", "login"]
            }
          },
          "response": []
        },
        {
          "name": "Verify Login OTP",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n    \"phoneNumber\": \"+919876543210\",\n    \"otp\": \"123456\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/user/login/verify",
              "host": ["{{baseUrl}}"],
              "path": ["api", "user", "login", "verify"]
            }
          },
          "response": []
        },
        {
          "name": "User Logout",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{userToken}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/api/user/logout",
              "host": ["{{baseUrl}}"],
              "path": ["api", "user", "logout"]
            }
          },
          "response": []
        },
        {
          "name": "Create Booking",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{userToken}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n    \"purpose\": \"Client Meeting\",\n    \"pickupAddress\": \"Office, Building A\",\n    \"dropAddress\": \"Client Office, Downtown\",\n    \"pickupDateTime\": \"2025-04-01T14:00:00\",\n    \"returnDateTime\": \"2025-04-01T17:00:00\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/user/bookings",
              "host": ["{{baseUrl}}"],
              "path": ["api", "user", "bookings"]
            }
          },
          "response": []
        }
      ]
    }
  ],
  "event": [
    {
      "listen": "prerequest",
      "script": {
        "type": "text/javascript",
        "exec": [""]
      }
    },
    {
      "listen": "test",
      "script": {
        "type": "text/javascript",
        "exec": [""]
      }
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5000"
    },
    {
      "key": "adminToken",
      "value": "YOUR_ADMIN_TOKEN"
    },
    {
      "key": "userToken",
      "value": "YOUR_USER_TOKEN"
    }
  ]
}
```

To use this collection:
1. Copy the JSON above
2. In Postman, click on Import > Paste Raw Text
3. Paste the JSON and import
4. Update the `baseUrl`, `adminToken`, and `userToken` variables in the collection settings

## Testing Workflow

A recommended testing workflow:

1. Register a new user using the `/api/user/register` endpoint
2. Verify the OTP using the `/api/user/verify-otp` endpoint
3. Login as admin using the `/api/admin/login` endpoint
4. Approve the user using the `/api/admin/users/status` endpoint
5. Login as the user using the `/api/user/login` and `/api/user/login/verify` endpoints
6. Create a booking using the `/api/user/bookings` endpoint
7. Approve the booking as admin using the `/api/admin/bookings/status` endpoint
8. Allocate a driver to the booking using the `/api/admin/allocate` endpoint