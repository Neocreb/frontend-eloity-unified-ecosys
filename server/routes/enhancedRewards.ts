// @ts-nocheck
import { Router } from 'express';
import { supabase } from '../../src/integrations/supabase/client';
import { enhancedEloitsService } from '../../src/services/enhancedEloitsService';
import { isTier2Verified } from '../middleware/tierAccessControl.js';

const router = Router();

// Middleware to verify authentication
const verifyAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No authentication token provided' });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid authentication token' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

// Middleware to verify admin access
const verifyAdmin = async (req, res, next) => {
  await verifyAuth(req, res, async () => {
    try {
      const { data: adminUser, error } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', req.user.id)
        .single();

      if (error || !adminUser || adminUser.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      
      next();
    } catch (error) {
      return res.status(500).json({ error: 'Failed to verify admin access' });
    }
  });
};

// Get user's reward data
router.get('/user/:userId', verifyAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify user is accessing their own data or is admin
    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const userData = await enhancedEloitsService.getUserEloitsData(userId);
    if (!userData) {
      return res.status(404).json({ error: 'User reward data not found' });
    }
    
    res.json({ success: true, data: userData });
  } catch (error) {
    console.error('Error fetching user reward data:', error);
    res.status(500).json({ error: 'Failed to fetch user reward data' });
  }
});

// Get user's transaction history
router.get('/user/:userId/transactions', verifyAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    // Verify user is accessing their own data or is admin
    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const transactions = await enhancedEloitsService.getTransactionHistory(userId, parseInt(limit), parseInt(offset));
    res.json({ success: true, data: transactions });
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    res.status(500).json({ error: 'Failed to fetch transaction history' });
  }
});

// Get user's trust history
router.get('/user/:userId/trust-history', verifyAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20 } = req.query;
    
    // Verify user is accessing their own data or is admin
    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const trustHistory = await enhancedEloitsService.getTrustHistory(userId, parseInt(limit));
    res.json({ success: true, data: trustHistory });
  } catch (error) {
    console.error('Error fetching trust history:', error);
    res.status(500).json({ error: 'Failed to fetch trust history' });
  }
});

// Get user's referrals
router.get('/user/:userId/referrals', verifyAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify user is accessing their own data or is admin
    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const referrals = await enhancedEloitsService.getUserReferrals(userId);
    res.json({ success: true, data: referrals });
  } catch (error) {
    console.error('Error fetching referrals:', error);
    res.status(500).json({ error: 'Failed to fetch referrals' });
  }
});

// Get user's redemptions
router.get('/user/:userId/redemptions', verifyAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;
    
    // Verify user is accessing their own data or is admin
    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const redemptions = await enhancedEloitsService.getRedemptions(userId, status?.toString());
    res.json({ success: true, data: redemptions });
  } catch (error) {
    console.error('Error fetching redemptions:', error);
    res.status(500).json({ error: 'Failed to fetch redemptions' });
  }
});

// Award points for an activity
router.post('/award-points', verifyAuth, async (req, res) => {
  try {
    const { userId, actionType, metadata } = req.body;
    
    // Verify user is accessing their own data or is admin
    if (req.user.id !== userId && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const result = await enhancedEloitsService.awardPoints(userId, actionType, metadata);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error awarding points:', error);
    res.status(500).json({ error: 'Failed to award points' });
  }
});

// Update trust score
router.post('/update-trust-score', verifyAuth, async (req, res) => {
  try {
    const { userId, scoreChange, reason, activityType } = req.body;
    
    // Verify user is accessing their own data or is admin
    if (req.user.id !== userId && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const result = await enhancedEloitsService.updateTrustScore(userId, scoreChange, reason, activityType);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error updating trust score:', error);
    res.status(500).json({ error: 'Failed to update trust score' });
  }
});

// Request redemption
// Requires Tier 2 verification to withdraw earnings
router.post('/request-redemption', verifyAuth, async (req, res) => {
  try {
    const { userId, amount, payoutMethod, payoutDetails } = req.body;

    // Verify user is accessing their own data
    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check Tier 2 verification
    const isTier2 = await isTier2Verified(userId);
    if (!isTier2) {
      return res.status(403).json({
        error: 'KYC verification required to withdraw earnings',
        code: 'KYC_REQUIRED',
        message: 'Complete KYC verification to access withdrawal features'
      });
    }

    const result = await enhancedEloitsService.requestRedemption(userId, amount, payoutMethod, payoutDetails);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error requesting redemption:', error);
    res.status(500).json({ error: 'Failed to request redemption' });
  }
});

// Process referral
router.post('/process-referral', verifyAuth, async (req, res) => {
  try {
    const { referrerId, refereeId, referralCode } = req.body;
    
    // Verify user is the referrer or is admin
    if (req.user.id !== referrerId && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const result = await enhancedEloitsService.processMultiLevelReferral(referrerId, refereeId, referralCode);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error processing referral:', error);
    res.status(500).json({ error: 'Failed to process referral' });
  }
});

// Admin routes
// Get system configuration
router.get('/admin/config', verifyAdmin, async (req, res) => {
  try {
    const config = await enhancedEloitsService.getSystemConfig();
    res.json({ success: true, data: config });
  } catch (error) {
    console.error('Error fetching system config:', error);
    res.status(500).json({ error: 'Failed to fetch system config' });
  }
});

// Update system configuration
router.post('/admin/config', verifyAdmin, async (req, res) => {
  try {
    const { config } = req.body;
    const result = await enhancedEloitsService.updateSystemConfig(config);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error updating system config:', error);
    res.status(500).json({ error: 'Failed to update system config' });
  }
});

// Get reward rules
router.get('/admin/reward-rules', verifyAdmin, async (req, res) => {
  try {
    const rules = await enhancedEloitsService.getRewardRules();
    res.json({ success: true, data: rules });
  } catch (error) {
    console.error('Error fetching reward rules:', error);
    res.status(500).json({ error: 'Failed to fetch reward rules' });
  }
});

// Get all redemptions (admin)
router.get('/admin/redemptions', verifyAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = supabase
      .from('redemptions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching redemptions:', error);
    res.status(500).json({ error: 'Failed to fetch redemptions' });
  }
});

// Update redemption status (admin)
router.patch('/admin/redemptions/:redemptionId', verifyAdmin, async (req, res) => {
  try {
    const { redemptionId } = req.params;
    const { status, approvedBy } = req.body;
    
    const { data, error } = await supabase
      .from('redemptions')
      .update({
        status,
        approved_by: approvedBy,
        approved_at: status === 'approved' ? new Date().toISOString() : undefined,
        processed_at: status === 'processed' ? new Date().toISOString() : undefined,
        updated_at: new Date().toISOString()
      })
      .eq('id', redemptionId)
      .select()
      .single();
    
    if (error) throw error;
    
    // If approved and in automated mode, deduct balance
    if (status === 'approved') {
      const config = await enhancedEloitsService.getSystemConfig();
      if (config.payout_mode === 'automated') {
        const redemption = data;
        const userEloData = await enhancedEloitsService.getUserEloitsData(redemption.user_id);
        if (userEloData) {
          const newBalance = userEloData.current_balance - redemption.amount;
          await supabase
            .from('user_rewards')
            .update({
              current_balance: newBalance,
              total_spent: userEloData.total_spent + redemption.amount,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', redemption.user_id);
          
          // Log transaction
          await supabase
            .from('reward_transactions')
            .insert({
              user_id: redemption.user_id,
              action_type: 'redemption',
              amount: -redemption.amount,
              balance_after: newBalance,
              description: `Redemption approved for $${await enhancedEloitsService.calculateCashValue(redemption.amount)}`,
              status: 'completed',
              reference_id: redemptionId,
              created_at: new Date().toISOString()
            });
        }
      }
    }
    
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error updating redemption:', error);
    res.status(500).json({ error: 'Failed to update redemption' });
  }
});

export default router;
