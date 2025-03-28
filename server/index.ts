import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { config } from "dotenv";
import cors from "cors";

// Load environment variables
config();

// Custom logger function
const log = (message: string, source = "express") => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`${timestamp} [${source}] ${message}`);
};

const app = express();

// Enable CORS for frontend requests
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:3000', 'http://localhost:5173', 'https://' + process.env.REPL_SLUG + '.' + process.env.REPL_OWNER + '.repl.co'];

app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow: boolean) => void) => {
    // Allow requests with no origin (like mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      console.warn(`CORS blocked: ${origin} is not in allowed origins: ${allowedOrigins.join(', ')}`);
      const msg = `The CORS policy for this site does not allow access from the origin ${origin}.`;
      return callback(new Error(msg), false);
    }
    console.log(`CORS allowed for origin: ${origin}`);
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Create server and register routes
(async () => {
  const server = await registerRoutes(app);

  // Error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    console.error(err);
  });

  // Get port from environment variable or default to 5000
  const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
  
  server.listen(port, () => {
    log(`Server running at http://localhost:${port}`);
    log(`API available at http://localhost:${port}/api`);
  });
})();
