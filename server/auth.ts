import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { storage } from './storage';

// JWT secret - in production this should be stored in an environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'snapetransportsecret2024';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

// Generate JWT token
export function generateToken(userId?: number, isAdmin = false): string {
  return jwt.sign(
    { 
      userId, 
      isAdmin
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

// Middleware to authenticate admin requests
export function authenticateAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized - No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId?: number, isAdmin: boolean };
    
    if (!decoded.isAdmin) {
      return res.status(403).json({ message: 'Forbidden - Admin access required' });
    }
    
    req.body.auth = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized - Invalid token' });
  }
}

// Middleware to authenticate user requests
export function authenticateUser(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized - No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId?: number, isAdmin: boolean };
    
    if (!decoded.userId) {
      return res.status(403).json({ message: 'Forbidden - User access required' });
    }
    
    req.body.auth = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized - Invalid token' });
  }
}

// Admin login function
export async function adminLogin(username: string, password: string): Promise<string | null> {
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    return generateToken(undefined, true);
  }
  return null;
}

// User login function (after OTP verification)
export async function userLogin(userId: number): Promise<string> {
  // Generate token
  const token = generateToken(userId, false);
  
  // Store token in session
  const expires = new Date();
  expires.setHours(expires.getHours() + 24);
  
  await storage.createSession({
    userId,
    token,
    expiresAt: expires,
  });
  
  return token;
}

// Logout function
export async function logout(token: string): Promise<boolean> {
  return await storage.deleteSession(token);
}
