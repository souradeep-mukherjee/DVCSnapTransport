# DVC SnapE Frontend

This is the frontend client for the DVC SnapE Transport Booking System.

## Features

- User registration and approval system
- OTP-based authentication
- Booking request management
- Driver allocation workflow
- Admin dashboard with analytics

## Requirements

- Node.js v20 or higher

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
VITE_API_URL=http://localhost:5000
```

For production, create a `.env.production` file:

```
VITE_API_URL=https://api.dvcsnape.example.com
```

## Development

### Installation

```bash
npm install
```

### Running the Development Server

```bash
npm run dev
```

The app will be available at http://localhost:5173

### Building for Production

```bash
npm run build
```

This will create a `dist` directory with the compiled production code.

### Serving the Production Build Locally

```bash
npm run preview
```

## Docker Deployment

Build the Docker image:

```bash
docker build -t dvc-snape-client .
```

Run the container:

```bash
docker run -p 80:80 dvc-snape-client
```

## API Integration

The frontend communicates with the backend API at the URL specified in `VITE_API_URL`. 

## Authentication

The application uses JWT token-based authentication. The token is stored in localStorage and included in the Authorization header for API requests.

## Project Structure

```
dvc-snape-client/
├── public/                # Static assets
├── src/
│   ├── components/        # UI components
│   │   ├── ui/            # Shadcn UI components 
│   │   └── Layout.tsx     # Layout component
│   ├── contexts/          # React contexts
│   │   └── AuthContext.tsx
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions
│   │   ├── api.ts         # API client
│   │   ├── queryClient.ts # React Query client
│   │   └── utils.ts       # Utility functions
│   ├── pages/             # Page components
│   ├── App.tsx            # Main application component
│   ├── index.css          # Global styles
│   └── main.tsx           # Entry point
├── .env                   # Environment variables (for development)
├── .env.production        # Production environment variables
├── index.html
├── package.json
├── tailwind.config.ts
├── theme.json
└── vite.config.ts
```

## License

This project is proprietary and confidential.