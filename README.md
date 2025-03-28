# DVC SnapE Transport Booking System

A comprehensive transport booking management system designed to streamline transportation services with admin controls and user management capabilities.

## Features

- User registration and approval system
- OTP-based authentication via Gupshup service
- Booking request management
- Driver allocation workflow
- Admin dashboard with analytics
- MongoDB integration for data persistence
- JWT-based authentication

## Project Structure

The project is divided into two main components:

- **Client**: React.js frontend application
- **Server**: Node.js/Express backend API

## Requirements

- Node.js v20 or higher
- MongoDB database
- Gupshup account for OTP services

## Environment Variables

### Server Environment Variables
Create a `.env` file in the server directory with the following variables:

```
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<db-name>
JWT_SECRET=<your-jwt-secret>
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
GUPSHUP_API_KEY=<your-gupshup-api-key>
GUPSHUP_USER_ID=<your-gupshup-user-id>
```

### Client Environment Variables
Create a `.env` file in the client directory with the following variables:

```
VITE_API_URL=http://localhost:5000
```

## Development Setup

### Running the Server

```bash
cd server
npm install
npm run dev
```

### Running the Client

```bash
cd client
npm install
npm run dev
```

## Docker Deployment

The project includes Docker configuration for containerized deployment:

### Building and Running with Docker Compose

```bash
docker-compose up -d
```

This will start both the client and server services.

### Building Individual Images

```bash
# Build server image
cd server
docker build -t dvc-snape-server .

# Build client image
cd client
docker build -t dvc-snape-client .
```

## CI/CD Pipeline

The project includes GitHub Actions workflows for continuous integration and deployment. Configure the following secrets in your GitHub repository:

- `DOCKER_HUB_USERNAME`: Your Docker Hub username
- `DOCKER_HUB_TOKEN`: Your Docker Hub token
- Additional deployment secrets based on your hosting provider

## Admin Access

Default admin credentials:
- Username: admin
- Password: admin123

## API Documentation

### Auth Endpoints
- `POST /api/admin/login`: Admin login
- `POST /api/user/register`: User registration
- `POST /api/user/verify-otp`: OTP verification
- `POST /api/user/login`: User login with phone number
- `POST /api/user/login/verify`: User login OTP verification

### Admin Endpoints
- `GET /api/admin/users/pending`: Get pending user registrations
- `PUT /api/admin/users/status`: Update user approval status
- `GET /api/admin/bookings/pending`: Get pending booking requests
- `PATCH /api/admin/bookings/status`: Update booking status
- `GET /api/admin/bookings/approved`: Get approved bookings
- `GET /api/admin/drivers`: Get all drivers
- `POST /api/admin/allocate`: Allocate driver to booking

### User Endpoints
- `POST /api/user/bookings`: Create a new booking
- `GET /api/user/bookings`: Get user's bookings

## License

This project is proprietary and confidential.