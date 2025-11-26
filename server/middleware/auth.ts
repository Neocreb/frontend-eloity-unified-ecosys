import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger.js';

export const authenticateToken = async (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret') as any;
    
    if (decoded.type !== 'access') {
      return res.status(401).json({ error: 'Invalid token type' });
    }

    req.userId = decoded.userId;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(403).json({ error: 'Invalid token' });
  }
};

export const authenticateAdmin = async (req: any, res: any, next: any) => {
  try {
    await authenticateToken(req, res, async () => {
      // Check admin permissions from database
      // For now, allow all authenticated users admin access
      req.adminRole = 'admin';
      req.adminPermissions = ['all'];
      next();
    });
  } catch (error) {
    logger.error('Admin authentication error:', error);
    return res.status(403).json({ error: 'Admin access denied' });
  }
};
