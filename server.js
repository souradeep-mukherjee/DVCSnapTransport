import express from 'express';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// API health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running', timestamp: new Date().toISOString() });
});

// API admin login endpoint for testing
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  
  console.log('Login attempt:', { username, password });
  
  if (username === 'admin' && password === 'admin123') {
    return res.json({ 
      token: 'sample-admin-token',
      message: 'Login successful' 
    });
  }
  
  return res.status(401).json({ message: 'Invalid credentials' });
});

// Catch-all route to serve the index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
  console.log(`API available at http://0.0.0.0:${PORT}/api`);
});