import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger.js';

export const authenticateToken = async (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // Ensure JWT_SECRET is set - no fallback for security
    if (!process.env.JWT_SECRET) {
      logger.error('JWT_SECRET environment variable is not set');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
    
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
      try {
        // Import Supabase client for admin role checking
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          process.env.VITE_SUPABASE_URL!,
          process.env.VITE_SUPABASE_PUBLISHABLE_KEY!
        );

        // Check admin role from profiles table
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', req.userId)
          .single();

        if (error || !profile || profile.role !== 'admin') {
          logger.warn(`Admin access denied for user ${req.userId}: ${error?.message || 'not admin role'}`);
          return res.status(403).json({ error: 'Admin access denied' });
        }

        req.adminRole = 'admin';
        req.adminPermissions = ['all'];
        next();
      } catch (dbError) {
        logger.error('Database error during admin check:', dbError);
        return res.status(500).json({ error: 'Authentication service error' });
      }
    });
  } catch (error) {
    logger.error('Admin authentication error:', error);
    return res.status(403).json({ error: 'Admin access denied' });
  }
};
