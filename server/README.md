# DVC SnapE Backend

This is the backend server for the DVC SnapE Transport Booking System.

## Features

- RESTful API for transport booking management
- User authentication and authorization
- OTP-based user verification
- Booking request processing
- Driver allocation management
- Admin user management

## Requirements

- Node.js v20 or higher
- MongoDB

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=5000
MONGO_URI=mongodb+srv://username:password@clustername.mongodb.net/
JWT_SECRET=your_secret_key
GUPSHUP_API_KEY=your_gupshup_api_key
GUPSHUP_USER_ID=your_gupshup_user_id
FRONTEND_URL=http://localhost:5173
```

For production, create a `.env.production` file with the appropriate values.

## Development

### Installation

```bash
npm install
```

### Running the Development Server

```bash
npm run dev
```

The server will start on the port specified in the `.env` file (default: 5000).

### Building for Production

```bash
npm run build
```

This will create a `dist` directory with the compiled production code.

### Running in Production

```bash
npm start
```

## Docker Deployment

Build the Docker image:

```bash
docker build -t dvc-snape-server .
```

Run the container:

```bash
docker run -p 5000:5000 --env-file .env.production dvc-snape-server
```

## API Documentation

### Authentication

- `POST /api/admin/login`: Admin login
- `POST /api/user/register`: Register a new user
- `POST /api/user/verify-otp`: Verify OTP
- `POST /api/user/login`: Generate OTP for login
- `POST /api/user/login/verify`: Verify OTP for login
- `POST /api/user/logout`: Logout (requires authentication)

### User Management

- `GET /api/admin/users/pending`: Get pending user registrations (admin only)
- `PUT /api/admin/users/status`: Update user status (admin only)

### Booking Management

- `POST /api/user/bookings`: Create a new booking (user only)
- `GET /api/admin/bookings/pending`: Get pending bookings (admin only)
- `PATCH /api/admin/bookings/status`: Update booking status (admin only)
- `GET /api/admin/bookings/approved`: Get approved bookings (admin only)

### Driver Management

- `GET /api/admin/drivers`: Get all drivers (admin only)
- `POST /api/admin/allocate`: Allocate driver to booking (admin only)

## Project Structure

```
dvc-snape-server/
├── dist/                # Compiled JavaScript (production)
├── auth.ts             # Authentication utilities
├── index.ts            # Entry point
├── mongoStorage.ts     # MongoDB implementation of storage
├── otp.ts              # OTP generation and verification
├── routes.ts           # API routes
├── server.d.ts         # TypeScript declarations
├── storage.ts          # Storage interface
├── vite.ts             # Vite server integration
├── .env                # Environment variables (for development)
├── .env.production     # Production environment variables
├── package.json
└── tsconfig.json
```

## Data Storage

The application uses MongoDB for data storage. The database schema includes:

- Users
- OTPs
- Bookings
- Drivers
- Allocations
- Sessions

## License

This project is proprietary and confidential.