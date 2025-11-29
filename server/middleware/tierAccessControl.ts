import { Request, Response, NextFunction } from 'express';
import { db } from '../utils/db';
import { profiles, feature_gates, tier_access_history } from '../../shared/enhanced-schema';
import { eq, and } from 'drizzle-orm';
import { logger } from '../utils/logger';

// Tier definitions
export const TIER_LEVELS = {
  TIER_1_UNVERIFIED: 'tier_1',
  TIER_2_KYC_VERIFIED: 'tier_2',
};

// Custom error for tier-related access issues
export class TierAccessError extends Error {
  constructor(
    public feature: string,
    public requiredTier: string,
    public userTier: string,
    public requiresKYC: boolean = false
  ) {
    super(`Access denied to ${feature}. Required: ${requiredTier}, You have: ${userTier}`);
    this.name = 'TierAccessError';
  }
}

export class KYCRequiredError extends Error {
  constructor(public feature: string) {
    super(`KYC verification required to access ${feature}`);
    this.name = 'KYCRequiredError';
  }
}

/**
 * Get user's current tier and profile information
 */
export async function getUserTierInfo(userId: string) {
  try {
    const userProfile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.user_id, userId))
      .limit(1);

    if (!userProfile.length) {
      return null;
    }

    const profile = userProfile[0];
    return {
      userId,
      tierLevel: profile.tier_level || TIER_LEVELS.TIER_1_UNVERIFIED,
      kycVerified: profile.tier_upgraded_at !== null,
      kycVerifiedAt: profile.tier_upgraded_at,
      kycTriggerReason: profile.kyc_trigger_reason,
    };
  } catch (error) {
    logger.error('Error getting user tier info:', error);
    return null;
  }
}

/**
 * Get feature gate configuration
 */
export async function getFeatureGate(featureName: string) {
  try {
    const gate = await db
      .select()
      .from(feature_gates)
      .where(eq(feature_gates.feature_name, featureName))
      .limit(1);

    if (!gate.length) {
      logger.warn(`Feature gate not found for: ${featureName}`);
      return null;
    }

    return gate[0];
  } catch (error) {
    logger.error('Error getting feature gate:', error);
    return null;
  }
}

/**
 * Check if user can access a feature based on tier
 */
export async function canAccessFeature(
  userId: string,
  featureName: string
): Promise<{ allowed: boolean; reason?: string; requiresKYC?: boolean }> {
  try {
    const userTier = await getUserTierInfo(userId);
    if (!userTier) {
      return { allowed: false, reason: 'User profile not found' };
    }

    const featureGate = await getFeatureGate(featureName);
    if (!featureGate) {
      // If feature gate doesn't exist, allow access (backwards compatibility)
      return { allowed: true };
    }

    // Check tier-based access
    const isTier1 = userTier.tierLevel === TIER_LEVELS.TIER_1_UNVERIFIED;
    const isTier2 = userTier.tierLevel === TIER_LEVELS.TIER_2_KYC_VERIFIED;

    if (isTier1 && !featureGate.tier_1_access) {
      const requiresKYC = featureGate.requires_kyc;
      return {
        allowed: false,
        reason: requiresKYC
          ? 'This feature requires KYC verification'
          : 'This feature is only available to premium members',
        requiresKYC,
      };
    }

    if (isTier2 && !featureGate.tier_2_access) {
      return { allowed: false, reason: 'This feature is not available in your region' };
    }

    return { allowed: true };
  } catch (error) {
    logger.error('Error checking feature access:', error);
    return { allowed: false, reason: 'Error checking access permissions' };
  }
}

/**
 * Log tier upgrade/downgrade
 */
export async function logTierChange(
  userId: string,
  fromTier: string | null,
  toTier: string,
  actionType: 'upgrade' | 'downgrade' | 'reactivate',
  reason?: string
) {
  try {
    const kycVerifiedAt = toTier === TIER_LEVELS.TIER_2_KYC_VERIFIED ? new Date() : null;

    await db.insert(tier_access_history).values({
      user_id: userId,
      from_tier: fromTier,
      to_tier: toTier,
      kyc_verified_at: kycVerifiedAt,
      action_type: actionType,
      reason,
    });

    logger.info(`Tier change logged: ${userId} ${fromTier} -> ${toTier} (${actionType})`);
  } catch (error) {
    logger.error('Error logging tier change:', error);
  }
}

/**
 * Middleware: Check tier access for specific feature
 */
export function requireTierAccess(featureName: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          error: 'Authentication required',
          code: 'UNAUTHENTICATED',
        });
      }

      const access = await canAccessFeature(userId, featureName);

      if (!access.allowed) {
        const statusCode = access.requiresKYC ? 403 : 402; // 402 Payment Required for tier, 403 Forbidden for KYC
        return res.status(statusCode).json({
          error: access.reason,
          code: access.requiresKYC ? 'KYC_REQUIRED' : 'TIER_UPGRADE_REQUIRED',
          feature: featureName,
          requiresKYC: access.requiresKYC,
          userTier: (await getUserTierInfo(userId))?.tierLevel,
        });
      }

      next();
    } catch (error) {
      logger.error('Error in tier access middleware:', error);
      res.status(500).json({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      });
    }
  };
}

/**
 * Middleware: Check tier and capture KYC trigger reason
 */
export function triggerKYCIfNeeded(reason: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return next();
      }

      const userTier = await getUserTierInfo(userId);

      if (
        userTier &&
        userTier.tierLevel === TIER_LEVELS.TIER_1_UNVERIFIED &&
        !userTier.kycTriggerReason
      ) {
        // Update user's KYC trigger reason
        await db
          .update(profiles)
          .set({ kyc_trigger_reason: reason })
          .where(eq(profiles.user_id, userId));

        logger.info(`KYC trigger reason set for user ${userId}: ${reason}`);
      }

      next();
    } catch (error) {
      logger.error('Error in KYC trigger middleware:', error);
      next();
    }
  };
}

/**
 * Upgrade user from Tier 1 to Tier 2 after KYC verification
 */
export async function upgradeTierAfterKYC(userId: string): Promise<boolean> {
  try {
    const userTier = await getUserTierInfo(userId);

    if (!userTier) {
      logger.error(`User not found: ${userId}`);
      return false;
    }

    if (userTier.tierLevel === TIER_LEVELS.TIER_2_KYC_VERIFIED) {
      logger.info(`User already Tier 2: ${userId}`);
      return true;
    }

    // Update user tier
    await db
      .update(profiles)
      .set({
        tier_level: TIER_LEVELS.TIER_2_KYC_VERIFIED,
        tier_upgraded_at: new Date(),
      })
      .where(eq(profiles.user_id, userId));

    // Log the tier change
    await logTierChange(
      userId,
      TIER_LEVELS.TIER_1_UNVERIFIED,
      TIER_LEVELS.TIER_2_KYC_VERIFIED,
      'upgrade',
      'KYC verification completed'
    );

    logger.info(`User upgraded to Tier 2: ${userId}`);
    return true;
  } catch (error) {
    logger.error('Error upgrading tier:', error);
    return false;
  }
}

/**
 * Check if user is in Tier 2 (KYC verified)
 */
export async function isTier2Verified(userId: string): Promise<boolean> {
  try {
    const userTier = await getUserTierInfo(userId);
    return userTier ? userTier.tierLevel === TIER_LEVELS.TIER_2_KYC_VERIFIED : false;
  } catch (error) {
    logger.error('Error checking tier 2 status:', error);
    return false;
  }
}

/**
 * Require Tier 2 verification
 */
export function requireTier2() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          error: 'Authentication required',
          code: 'UNAUTHENTICATED',
        });
      }

      const isTier2 = await isTier2Verified(userId);

      if (!isTier2) {
        return res.status(403).json({
          error: 'KYC verification required',
          code: 'KYC_REQUIRED',
          message: 'You must complete KYC verification to access this feature',
        });
      }

      next();
    } catch (error) {
      logger.error('Error in tier 2 middleware:', error);
      res.status(500).json({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      });
    }
  };
}

/**
 * Middleware: Check user role access
 */
export function tierAccessControl(allowedRoles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;

      if (!userId) {
        return res.status(401).json({
          error: 'Authentication required',
          code: 'UNAUTHENTICATED',
        });
      }

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          error: 'Insufficient permissions',
          code: 'FORBIDDEN',
          requiredRole: allowedRoles,
          userRole: userRole,
        });
      }

      next();
    } catch (error) {
      logger.error('Error in tier access control middleware:', error);
      res.status(500).json({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      });
    }
  };
}

/**
 * Get tier access summary for user
 */
export async function getTierAccessSummary(userId: string) {
  try {
    const userTier = await getUserTierInfo(userId);

    if (!userTier) {
      return null;
    }

    // Get all features
    const allGates = await db.select().from(feature_gates);

    const accessibleFeatures = allGates.filter((gate) => {
      if (userTier.tierLevel === TIER_LEVELS.TIER_1_UNVERIFIED) {
        return gate.tier_1_access;
      }
      return gate.tier_2_access;
    });

    const restrictedFeatures = allGates.filter((gate) => {
      if (userTier.tierLevel === TIER_LEVELS.TIER_1_UNVERIFIED) {
        return !gate.tier_1_access;
      }
      return !gate.tier_2_access;
    });

    return {
      userId,
      currentTier: userTier.tierLevel,
      kycVerified: userTier.kycVerified,
      kycVerifiedAt: userTier.kycVerifiedAt,
      accessibleFeatures: accessibleFeatures.map((g) => g.feature_name),
      restrictedFeatures: restrictedFeatures.map((g) => ({
        name: g.feature_name,
        requiresKYC: g.requires_kyc,
      })),
      totalAccessibleFeatures: accessibleFeatures.length,
      totalRestrictedFeatures: restrictedFeatures.length,
    };
  } catch (error) {
    logger.error('Error getting tier access summary:', error);
    return null;
  }
}
