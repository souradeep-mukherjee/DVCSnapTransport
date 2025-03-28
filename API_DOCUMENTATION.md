# DVC SnapE API Documentation

This document outlines the API endpoints for the DVC SnapE Transport Booking System.

## Base URL

- Development: `http://localhost:5000`
- Production: Configured via environment variables

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <token>
```

## Response Format

All responses are in JSON format with a common structure:

```json
{
  "success": true/false,
  "data": { ... } or [ ... ],
  "message": "Optional message string"
}
```

## Error Handling

Errors return a 4xx or 5xx status code with a JSON response:

```json
{
  "success": false,
  "message": "Error description",
  "error": { ... } // Optional detailed error information
}
```

## Admin API Endpoints

### Authentication

#### Admin Login

- **URL**: `/api/admin/login`
- **Method**: `POST`
- **Auth Required**: No
- **Body**:
  ```json
  {
    "username": "admin",
    "password": "admin123"
  }
  ```
- **Success Response**:
  ```json
  {
    "success": true,
    "data": {
      "token": "jwt_token_string"
    }
  }
  ```

### User Management

#### Get Pending Users

- **URL**: `/api/admin/users/pending`
- **Method**: `GET`
- **Auth Required**: Yes (Admin)
- **Success Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "phoneNumber": "+919876543210",
        "employeeNumber": "EMP001",
        "department": "Engineering",
        "status": "pending"
      }
    ]
  }
  ```

#### Update User Status

- **URL**: `/api/admin/users/status`
- **Method**: `PUT`
- **Auth Required**: Yes (Admin)
- **Body**:
  ```json
  {
    "id": 1,
    "status": "approved"
  }
  ```
- **Success Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "name": "John Doe",
      "status": "approved"
    }
  }
  ```

### Booking Management

#### Get Pending Bookings

- **URL**: `/api/admin/bookings/pending`
- **Method**: `GET`
- **Auth Required**: Yes (Admin)
- **Success Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "userId": 1,
        "purpose": "Client Meeting",
        "pickupAddress": "123 Main St",
        "dropAddress": "456 Oak St",
        "pickupDateTime": "2023-06-20T10:00:00Z",
        "status": "pending",
        "user": {
          "id": 1,
          "name": "John Doe",
          "email": "john@example.com",
          "phoneNumber": "+919876543210"
        }
      }
    ]
  }
  ```

#### Update Booking Status

- **URL**: `/api/admin/bookings/status`
- **Method**: `PATCH`
- **Auth Required**: Yes (Admin)
- **Body**:
  ```json
  {
    "id": 1,
    "status": "approved"
  }
  ```
- **Success Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "status": "approved"
    }
  }
  ```

#### Get Approved Bookings

- **URL**: `/api/admin/bookings/approved`
- **Method**: `GET`
- **Auth Required**: Yes (Admin)
- **Success Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "userId": 1,
        "purpose": "Client Meeting",
        "pickupAddress": "123 Main St",
        "dropAddress": "456 Oak St",
        "pickupDateTime": "2023-06-20T10:00:00Z",
        "status": "approved",
        "user": {
          "id": 1,
          "name": "John Doe",
          "email": "john@example.com",
          "phoneNumber": "+919876543210"
        }
      }
    ]
  }
  ```

### Driver Management

#### Get All Drivers

- **URL**: `/api/admin/drivers`
- **Method**: `GET`
- **Auth Required**: Yes (Admin)
- **Success Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "name": "Driver Name",
        "phoneNumber": "+919876543210",
        "licenseNumber": "DL12345678",
        "status": "available"
      }
    ]
  }
  ```

#### Allocate Driver

- **URL**: `/api/admin/allocate`
- **Method**: `POST`
- **Auth Required**: Yes (Admin)
- **Body**:
  ```json
  {
    "bookingId": 1,
    "driverId": 1
  }
  ```
- **Success Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "bookingId": 1,
      "driverId": 1,
      "status": "allocated"
    }
  }
  ```

## User API Endpoints

### Authentication

#### Register User

- **URL**: `/api/user/register`
- **Method**: `POST`
- **Auth Required**: No
- **Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "+919876543210",
    "employeeNumber": "EMP001",
    "department": "Engineering"
  }
  ```
- **Success Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "phoneNumber": "+919876543210"
    }
  }
  ```

#### Verify OTP

- **URL**: `/api/user/verify-otp`
- **Method**: `POST`
- **Auth Required**: No
- **Body**:
  ```json
  {
    "phoneNumber": "+919876543210",
    "otp": "123456"
  }
  ```
- **Success Response**:
  ```json
  {
    "success": true,
    "data": {
      "token": "jwt_token_string"
    }
  }
  ```

#### Login (Generate OTP)

- **URL**: `/api/user/login`
- **Method**: `POST`
- **Auth Required**: No
- **Body**:
  ```json
  {
    "phoneNumber": "+919876543210"
  }
  ```
- **Success Response**:
  ```json
  {
    "success": true,
    "message": "OTP sent successfully"
  }
  ```

#### Verify Login OTP

- **URL**: `/api/user/login/verify`
- **Method**: `POST`
- **Auth Required**: No
- **Body**:
  ```json
  {
    "phoneNumber": "+919876543210",
    "otp": "123456"
  }
  ```
- **Success Response**:
  ```json
  {
    "success": true,
    "data": {
      "token": "jwt_token_string",
      "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "phoneNumber": "+919876543210",
        "status": "approved"
      }
    }
  }
  ```

#### Logout

- **URL**: `/api/user/logout`
- **Method**: `POST`
- **Auth Required**: Yes
- **Success Response**:
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```

### Bookings

#### Create Booking

- **URL**: `/api/user/bookings`
- **Method**: `POST`
- **Auth Required**: Yes
- **Body**:
  ```json
  {
    "purpose": "Client Meeting",
    "pickupAddress": "123 Main St",
    "dropAddress": "456 Oak St",
    "pickupDateTime": "2023-06-20T10:00:00Z",
    "returnDateTime": "2023-06-20T17:00:00Z" // Optional
  }
  ```
- **Success Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "userId": 1,
      "purpose": "Client Meeting",
      "pickupAddress": "123 Main St",
      "dropAddress": "456 Oak St",
      "pickupDateTime": "2023-06-20T10:00:00Z",
      "returnDateTime": "2023-06-20T17:00:00Z",
      "status": "pending"
    }
  }
  ```

## Status Codes

- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication failed
- `403 Forbidden`: Permission denied
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Rate Limiting

API requests are limited to 100 requests per IP address per minute.

## Versioning

This API is currently at version 1 (v1) and is not explicitly versioned in the URL path.

## Contact

For API support, please contact the DVC SnapE development team at snapecabs@example.com