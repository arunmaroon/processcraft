import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: 'super_admin' | 'admin' | 'viewer';
    email: string;
  };
}

export interface AdminUser {
  id: string;
  email: string;
  password: string;
  role: 'super_admin' | 'admin' | 'viewer';
  mfa_enabled: boolean;
  mfa_secret?: string;
  last_login?: Date;
  created_at: Date;
}

// In-memory admin users (in production, use database)
const adminUsers: AdminUser[] = [
  {
    id: '1',
    email: 'admin@processcraft.com',
    password: '$2b$10$rQZ8K9mN2pL3sT4uV5wX6yZ7aB8cD9eF0gH1iJ2kL3mN4oP5qR6sT7uV8wX9yZ', // 'admin123'
    role: 'super_admin',
    mfa_enabled: false,
    created_at: new Date()
  }
];

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Hash password
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

// Verify password
export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

// Generate JWT token
export const generateToken = (user: { id: string; email: string; role: string }): string => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// Verify JWT token
export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// Authentication middleware
export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required',
      code: 'TOKEN_REQUIRED'
    });
  }

  try {
    const decoded = verifyToken(token);
    const user = adminUsers.find(u => u.id === decoded.id);
    
    if (!user) {
      return res.status(401).json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    req.user = {
      id: user.id,
      role: user.role,
      email: user.email
    };
    
    next();
  } catch (error) {
    return res.status(403).json({ 
      error: 'Invalid or expired token',
      code: 'TOKEN_INVALID'
    });
  }
};

// Role-based authorization middleware
export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        required_roles: roles,
        user_role: req.user.role
      });
    }

    next();
  };
};

// Admin login endpoint
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, passcode } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
        code: 'MISSING_CREDENTIALS'
      });
    }

    // Check passcode for additional security
    const expectedPasscode = process.env.ADMIN_PASSCODE || '01234';
    if (passcode !== expectedPasscode) {
      return res.status(401).json({
        error: 'Invalid passcode',
        code: 'INVALID_PASSCODE'
      });
    }

    // Find user
    const user = adminUsers.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Update last login
    user.last_login = new Date();

    // Generate token
    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        mfa_enabled: user.mfa_enabled
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'LOGIN_ERROR'
    });
  }
};

// Logout endpoint
export const logout = (req: Request, res: Response) => {
  // In a real application, you might want to blacklist the token
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

// Get user profile
export const getProfile = (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
  }

  const user = adminUsers.find(u => u.id === req.user!.id);
  if (!user) {
    return res.status(404).json({
      error: 'User not found',
      code: 'USER_NOT_FOUND'
    });
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      mfa_enabled: user.mfa_enabled,
      last_login: user.last_login,
      created_at: user.created_at
    }
  });
};

// Refresh token
export const refreshToken = (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
  }

  const user = adminUsers.find(u => u.id === req.user!.id);
  if (!user) {
    return res.status(404).json({
      error: 'User not found',
      code: 'USER_NOT_FOUND'
    });
  }

  const token = generateToken(user);
  
  res.json({
    success: true,
    token
  });
};



