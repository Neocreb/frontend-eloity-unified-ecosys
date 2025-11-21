import { logger } from '../utils/logger.js';

export interface VelocityCheckResult {
  allowed: boolean;
  reason?: string;
  limit?: number;
  current?: number;
  resetTime?: string;
}

export interface AnomalyDetectionResult {
  flagged: boolean;
  riskScore: number;
  reasons: string[];
  recommendedAction: 'approve' | 'review' | 'block';
}

export interface GeoLocation {
  country: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  ipAddress: string;
  timestamp: string;
}

class FraudDetectionService {
  /**
   * Check daily withdrawal velocity
   */
  checkDailyWithdrawalVelocity(
    dailyTotal: number,
    newAmount: number,
    dailyLimit: number
  ): VelocityCheckResult {
    const total = dailyTotal + newAmount;
    if (total > dailyLimit) {
      const resetTime = new Date();
      resetTime.setDate(resetTime.getDate() + 1);
      resetTime.setHours(0, 0, 0, 0);

      return {
        allowed: false,
        reason: `Daily limit exceeded. Limit: $${dailyLimit}, Current: $${dailyTotal}, Requested: $${newAmount}`,
        limit: dailyLimit,
        current: dailyTotal,
        resetTime: resetTime.toISOString(),
      };
    }

    return { allowed: true };
  }

  /**
   * Check hourly transaction velocity
   */
  checkHourlyVelocity(transactionsInLastHour: number, maxPerHour: number = 5): VelocityCheckResult {
    if (transactionsInLastHour >= maxPerHour) {
      const resetTime = new Date(Date.now() + 60 * 60 * 1000);

      return {
        allowed: false,
        reason: `Too many transactions in a short time. Max: ${maxPerHour}/hour`,
        limit: maxPerHour,
        current: transactionsInLastHour,
        resetTime: resetTime.toISOString(),
      };
    }

    return { allowed: true };
  }

  /**
   * Check monthly withdrawal velocity
   */
  checkMonthlyVelocity(monthlyTotal: number, newAmount: number, monthlyLimit: number): VelocityCheckResult {
    const total = monthlyTotal + newAmount;
    if (total > monthlyLimit) {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      nextMonth.setDate(1);
      nextMonth.setHours(0, 0, 0, 0);

      return {
        allowed: false,
        reason: `Monthly limit exceeded. Limit: $${monthlyLimit}, Current: $${monthlyTotal}, Requested: $${newAmount}`,
        limit: monthlyLimit,
        current: monthlyTotal,
        resetTime: nextMonth.toISOString(),
      };
    }

    return { allowed: true };
  }

  /**
   * Detect geolocation anomalies
   */
  detectGeolocationAnomaly(
    currentLocation: GeoLocation,
    lastKnownLocation: GeoLocation | null,
    hoursElapsed: number
  ): AnomalyDetectionResult {
    const reasons: string[] = [];
    let riskScore = 0;

    if (!lastKnownLocation) {
      return { flagged: false, riskScore: 0, reasons, recommendedAction: 'approve' };
    }

    const distance = this.calculateDistance(
      currentLocation.latitude || 0,
      currentLocation.longitude || 0,
      lastKnownLocation.latitude || 0,
      lastKnownLocation.longitude || 0
    );

    const speed = distance / hoursElapsed;
    const maxReasonableSpeed = 900; // km/hour (approximate speed of commercial flight)

    if (speed > maxReasonableSpeed) {
      reasons.push(
        `Impossible travel distance (${distance.toFixed(0)}km in ${hoursElapsed}h, speed: ${speed.toFixed(0)}km/h)`
      );
      riskScore += 50;
    }

    if (currentLocation.country !== lastKnownLocation.country) {
      reasons.push('Transaction from different country');
      riskScore += 20;
    }

    return {
      flagged: riskScore >= 50,
      riskScore,
      reasons,
      recommendedAction: riskScore >= 70 ? 'block' : riskScore >= 50 ? 'review' : 'approve',
    };
  }

  /**
   * Detect transaction amount anomalies
   */
  detectAmountAnomaly(currentAmount: number, averageAmount: number, stdDeviation: number): AnomalyDetectionResult {
    const reasons: string[] = [];
    let riskScore = 0;

    if (averageAmount === 0) {
      return { flagged: false, riskScore: 0, reasons, recommendedAction: 'approve' };
    }

    const percentageChange = Math.abs((currentAmount - averageAmount) / averageAmount) * 100;
    const standardDeviations = (currentAmount - averageAmount) / (stdDeviation || averageAmount * 0.1);

    if (standardDeviations > 3) {
      reasons.push(
        `Amount significantly differs from average (${percentageChange.toFixed(0)}% change, ${standardDeviations.toFixed(1)} std dev)`
      );
      riskScore += 40;
    } else if (standardDeviations > 2) {
      reasons.push(
        `Amount moderately differs from average (${percentageChange.toFixed(0)}% change, ${standardDeviations.toFixed(1)} std dev)`
      );
      riskScore += 20;
    }

    return {
      flagged: riskScore >= 40,
      riskScore,
      reasons,
      recommendedAction: riskScore >= 40 ? 'review' : 'approve',
    };
  }

  /**
   * Detect transaction timing anomalies
   */
  detectTimingAnomaly(
    transactionHour: number,
    typicalTransactionHours: number[]
  ): AnomalyDetectionResult {
    const reasons: string[] = [];
    let riskScore = 0;

    if (typicalTransactionHours.length === 0) {
      return { flagged: false, riskScore: 0, reasons, recommendedAction: 'approve' };
    }

    const isTypicalHour = typicalTransactionHours.some(
      (h) => Math.abs(h - transactionHour) <= 2
    );

    if (!isTypicalHour) {
      reasons.push(
        `Transaction at unusual time (hour: ${transactionHour}, typical hours: ${typicalTransactionHours.join(', ')})`
      );
      riskScore += 15;
    }

    return {
      flagged: riskScore >= 20,
      riskScore,
      reasons,
      recommendedAction: riskScore >= 30 ? 'review' : 'approve',
    };
  }

  /**
   * Detect payment method change anomalies
   */
  detectPaymentMethodAnomaly(
    currentMethod: string,
    previousMethods: string[],
    methodChangeFrequency: number
  ): AnomalyDetectionResult {
    const reasons: string[] = [];
    let riskScore = 0;

    if (previousMethods.length === 0) {
      return { flagged: false, riskScore: 0, reasons, recommendedAction: 'approve' };
    }

    const isNewMethod = !previousMethods.includes(currentMethod);

    if (isNewMethod) {
      reasons.push(`New payment method: ${currentMethod}`);
      riskScore += 10;

      if (methodChangeFrequency > 3) {
        reasons.push(`High payment method change frequency`);
        riskScore += 20;
      }
    }

    return {
      flagged: riskScore >= 25,
      riskScore,
      reasons,
      recommendedAction: riskScore >= 30 ? 'review' : 'approve',
    };
  }

  /**
   * Calculate overall fraud score
   */
  calculateFraudScore(
    velocityResult: VelocityCheckResult,
    geolocationResult: AnomalyDetectionResult,
    amountResult: AnomalyDetectionResult,
    timingResult: AnomalyDetectionResult,
    methodResult: AnomalyDetectionResult
  ): { score: number; recommendation: 'approve' | 'review' | 'block' } {
    let score = 0;

    if (!velocityResult.allowed) score += 30;
    score += geolocationResult.riskScore;
    score += amountResult.riskScore;
    score += timingResult.riskScore;
    score += methodResult.riskScore;

    let recommendation: 'approve' | 'review' | 'block' = 'approve';
    if (score >= 80) {
      recommendation = 'block';
    } else if (score >= 50) {
      recommendation = 'review';
    }

    return { score: Math.min(100, score), recommendation };
  }

  /**
   * Calculate distance between two geographic points (Haversine formula)
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   */
  private toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  /**
   * Get risk assessment message
   */
  getRiskMessage(recommendation: 'approve' | 'review' | 'block'): string {
    const messages: Record<string, string> = {
      approve: 'Transaction approved. Low risk detected.',
      review: 'Transaction flagged for manual review. A compliance officer will review your request.',
      block: 'Transaction blocked for security. Please contact support for assistance.',
    };
    return messages[recommendation] || '';
  }

  /**
   * Lock account temporarily after multiple failed attempts
   */
  calculateLockoutDuration(failedAttempts: number): { locked: boolean; durationMinutes: number } {
    if (failedAttempts < 3) {
      return { locked: false, durationMinutes: 0 };
    } else if (failedAttempts < 5) {
      return { locked: true, durationMinutes: 15 };
    } else if (failedAttempts < 10) {
      return { locked: true, durationMinutes: 60 };
    }
    return { locked: true, durationMinutes: 1440 }; // 24 hours
  }
}

export const fraudDetectionService = new FraudDetectionService();
