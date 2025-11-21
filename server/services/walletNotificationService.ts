import { logger } from '../utils/logger.js';

export interface EmailTemplate {
  subject: string;
  htmlBody: string;
  textBody: string;
}

export interface NotificationPreferences {
  depositNotifications: boolean;
  withdrawalNotifications: boolean;
  failureAlerts: boolean;
  securityAlerts: boolean;
  kycReminders: boolean;
  promotionalEmails: boolean;
  smsEnabled: boolean;
  doNotDisturbHours?: { start: number; end: number };
  language: string;
}

class WalletNotificationService {
  /**
   * Generate deposit notification email
   */
  generateDepositNotificationEmail(data: {
    userName: string;
    amount: number;
    currency: string;
    destination: string;
    transactionId: string;
    timestamp: string;
  }): EmailTemplate {
    return {
      subject: `Deposit Received: ${data.amount} ${data.currency}`,
      htmlBody: `
        <h2>Deposit Received</h2>
        <p>Hi ${data.userName},</p>
        <p>We've successfully received your deposit of <strong>${data.amount} ${data.currency}</strong>.</p>
        
        <div style="background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <p><strong>Transaction Details:</strong></p>
          <p>Amount: ${data.amount} ${data.currency}</p>
          <p>Destination: ${data.destination}</p>
          <p>Transaction ID: ${data.transactionId}</p>
          <p>Time: ${new Date(data.timestamp).toLocaleString()}</p>
        </div>
        
        <p>Your wallet has been credited and is ready to use.</p>
        <p>Best regards,<br>The Eloity Team</p>
      `,
      textBody: `
        Deposit Received: ${data.amount} ${data.currency}
        
        Hi ${data.userName},
        
        We've successfully received your deposit of ${data.amount} ${data.currency}.
        
        Transaction Details:
        Amount: ${data.amount} ${data.currency}
        Destination: ${data.destination}
        Transaction ID: ${data.transactionId}
        Time: ${new Date(data.timestamp).toLocaleString()}
        
        Your wallet has been credited and is ready to use.
        
        Best regards,
        The Eloity Team
      `,
    };
  }

  /**
   * Generate withdrawal initiated email
   */
  generateWithdrawalInitiatedEmail(data: {
    userName: string;
    amount: number;
    currency: string;
    recipient: string;
    fee: number;
    netAmount: number;
    processingTime: string;
    withdrawalId: string;
  }): EmailTemplate {
    return {
      subject: `Withdrawal Initiated: ${data.amount} ${data.currency}`,
      htmlBody: `
        <h2>Withdrawal Request Initiated</h2>
        <p>Hi ${data.userName},</p>
        <p>Your withdrawal request has been initiated and is pending verification.</p>
        
        <div style="background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <p><strong>Withdrawal Details:</strong></p>
          <p>Amount Requested: ${data.amount} ${data.currency}</p>
          <p>Processing Fee: ${data.fee} ${data.currency}</p>
          <p>Amount You'll Receive: ${data.netAmount} ${data.currency}</p>
          <p>Recipient: ${data.recipient}</p>
          <p>Estimated Processing Time: ${data.processingTime}</p>
          <p>Withdrawal ID: ${data.withdrawalId}</p>
        </div>
        
        <p><strong>Next Step:</strong> Complete 2FA verification to confirm your withdrawal.</p>
        <p>Best regards,<br>The Eloity Team</p>
      `,
      textBody: `
        Withdrawal Request Initiated
        
        Hi ${data.userName},
        
        Your withdrawal request has been initiated and is pending verification.
        
        Withdrawal Details:
        Amount Requested: ${data.amount} ${data.currency}
        Processing Fee: ${data.fee} ${data.currency}
        Amount You'll Receive: ${data.netAmount} ${data.currency}
        Recipient: ${data.recipient}
        Estimated Processing Time: ${data.processingTime}
        Withdrawal ID: ${data.withdrawalId}
        
        Next Step: Complete 2FA verification to confirm your withdrawal.
        
        Best regards,
        The Eloity Team
      `,
    };
  }

  /**
   * Generate withdrawal completed email
   */
  generateWithdrawalCompletedEmail(data: {
    userName: string;
    amount: number;
    currency: string;
    recipient: string;
    processingTime: string;
    transactionId: string;
    timestamp: string;
  }): EmailTemplate {
    return {
      subject: `Withdrawal Completed: ${data.amount} ${data.currency}`,
      htmlBody: `
        <h2>Withdrawal Completed Successfully</h2>
        <p>Hi ${data.userName},</p>
        <p>Your withdrawal of <strong>${data.amount} ${data.currency}</strong> has been completed successfully.</p>
        
        <div style="background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <p><strong>Transaction Details:</strong></p>
          <p>Amount: ${data.amount} ${data.currency}</p>
          <p>Recipient: ${data.recipient}</p>
          <p>Processing Time: ${data.processingTime}</p>
          <p>Transaction ID: ${data.transactionId}</p>
          <p>Completed At: ${new Date(data.timestamp).toLocaleString()}</p>
        </div>
        
        <p>The funds should arrive in your account shortly. If you don't see them within the estimated time, please contact support.</p>
        <p>Best regards,<br>The Eloity Team</p>
      `,
      textBody: `
        Withdrawal Completed Successfully
        
        Hi ${data.userName},
        
        Your withdrawal of ${data.amount} ${data.currency} has been completed successfully.
        
        Transaction Details:
        Amount: ${data.amount} ${data.currency}
        Recipient: ${data.recipient}
        Processing Time: ${data.processingTime}
        Transaction ID: ${data.transactionId}
        Completed At: ${new Date(data.timestamp).toLocaleString()}
        
        The funds should arrive in your account shortly.
        
        Best regards,
        The Eloity Team
      `,
    };
  }

  /**
   * Generate withdrawal failed email
   */
  generateWithdrawalFailedEmail(data: {
    userName: string;
    amount: number;
    currency: string;
    reason: string;
    transactionId: string;
  }): EmailTemplate {
    return {
      subject: `Withdrawal Failed: ${data.amount} ${data.currency}`,
      htmlBody: `
        <h2>Withdrawal Failed</h2>
        <p>Hi ${data.userName},</p>
        <p>Your withdrawal request has failed. Your funds have been returned to your wallet.</p>
        
        <div style="background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <p><strong>Failure Details:</strong></p>
          <p>Amount: ${data.amount} ${data.currency}</p>
          <p>Reason: ${data.reason}</p>
          <p>Transaction ID: ${data.transactionId}</p>
        </div>
        
        <p><strong>What to do next:</strong></p>
        <ul>
          <li>Verify your withdrawal details are correct</li>
          <li>Check that your bank account information is accurate</li>
          <li>Try again or contact support for assistance</li>
        </ul>
        
        <p>Best regards,<br>The Eloity Team</p>
      `,
      textBody: `
        Withdrawal Failed
        
        Hi ${data.userName},
        
        Your withdrawal request has failed. Your funds have been returned to your wallet.
        
        Failure Details:
        Amount: ${data.amount} ${data.currency}
        Reason: ${data.reason}
        Transaction ID: ${data.transactionId}
        
        What to do next:
        - Verify your withdrawal details are correct
        - Check that your bank account information is accurate
        - Try again or contact support for assistance
        
        Best regards,
        The Eloity Team
      `,
    };
  }

  /**
   * Generate KYC status email
   */
  generateKYCStatusEmail(data: {
    userName: string;
    status: 'approved' | 'rejected' | 'pending';
    level: string;
    reason?: string;
  }): EmailTemplate {
    const subjectMap = {
      approved: `Your KYC Verification is Approved`,
      rejected: `Your KYC Verification Needs Attention`,
      pending: `Your KYC Verification is Under Review`,
    };

    const contentMap = {
      approved: `
        <p>Congratulations! Your KYC verification has been approved.</p>
        <p>You now have access to ${data.level} features with higher transaction limits.</p>
      `,
      rejected: `
        <p>Your KYC verification was not approved. Reason: ${data.reason || 'Document quality issues'}</p>
        <p>Please resubmit your documents for another review.</p>
      `,
      pending: `
        <p>Your KYC verification is being reviewed by our team.</p>
        <p>This process typically takes 24-48 hours. We'll notify you as soon as it's complete.</p>
      `,
    };

    return {
      subject: subjectMap[data.status],
      htmlBody: `
        <h2>KYC Verification Update</h2>
        <p>Hi ${data.userName},</p>
        ${contentMap[data.status]}
        <p>Best regards,<br>The Eloity Team</p>
      `,
      textBody: `
        KYC Verification Update
        
        Hi ${data.userName},
        
        ${contentMap[data.status].replace(/<[^>]*>/g, '')}
        
        Best regards,
        The Eloity Team
      `,
    };
  }

  /**
   * Generate 2FA code email
   */
  generate2FACodeEmail(data: {
    userName: string;
    code: string;
    expiresIn: number;
  }): EmailTemplate {
    return {
      subject: `Your Verification Code: ${data.code}`,
      htmlBody: `
        <h2>Two-Factor Authentication</h2>
        <p>Hi ${data.userName},</p>
        <p>Your verification code is:</p>
        <div style="background: #007bff; color: white; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; border-radius: 5px;">
          ${data.code}
        </div>
        <p>This code expires in ${data.expiresIn} minutes.</p>
        <p><strong>Security Note:</strong> Never share this code with anyone. Eloity support will never ask for this code.</p>
        <p>Best regards,<br>The Eloity Team</p>
      `,
      textBody: `
        Two-Factor Authentication
        
        Hi ${data.userName},
        
        Your verification code is: ${data.code}
        
        This code expires in ${data.expiresIn} minutes.
        
        Security Note: Never share this code with anyone.
        
        Best regards,
        The Eloity Team
      `,
    };
  }

  /**
   * Generate suspicious activity alert email
   */
  generateSuspiciousActivityEmail(data: {
    userName: string;
    activity: string;
    timestamp: string;
    location?: string;
  }): EmailTemplate {
    return {
      subject: `Security Alert: Suspicious Activity Detected`,
      htmlBody: `
        <h2 style="color: #dc3545;">Security Alert</h2>
        <p>Hi ${data.userName},</p>
        <p>We've detected suspicious activity on your account.</p>
        
        <div style="background: #f8d7da; padding: 15px; margin: 20px 0; border-left: 4px solid #dc3545; border-radius: 5px;">
          <p><strong>Activity Detected:</strong> ${data.activity}</p>
          <p><strong>Time:</strong> ${new Date(data.timestamp).toLocaleString()}</p>
          ${data.location ? `<p><strong>Location:</strong> ${data.location}</p>` : ''}
        </div>
        
        <p><strong>If this wasn't you:</strong></p>
        <ul>
          <li>Change your password immediately</li>
          <li>Enable or review your 2FA settings</li>
          <li>Contact support if you need assistance</li>
        </ul>
        
        <p>Best regards,<br>The Eloity Security Team</p>
      `,
      textBody: `
        Security Alert
        
        Hi ${data.userName},
        
        We've detected suspicious activity on your account.
        
        Activity Detected: ${data.activity}
        Time: ${new Date(data.timestamp).toLocaleString()}
        ${data.location ? `Location: ${data.location}` : ''}
        
        If this wasn't you:
        - Change your password immediately
        - Enable or review your 2FA settings
        - Contact support if you need assistance
        
        Best regards,
        The Eloity Security Team
      `,
    };
  }

  /**
   * Send email notification
   */
  async sendEmail(to: string, template: EmailTemplate): Promise<boolean> {
    try {
      const emailProvider = process.env.EMAIL_PROVIDER || 'sendgrid';

      if (emailProvider === 'sendgrid') {
        return await this.sendViaMailgun(to, template);
      } else if (emailProvider === 'mailgun') {
        return await this.sendViaMailgun(to, template);
      } else if (emailProvider === 'aws') {
        return await this.sendViaSES(to, template);
      }

      logger.warn(`Email provider ${emailProvider} not configured. Email not sent to ${to}`);
      return false;
    } catch (error) {
      logger.error('Error sending email:', error);
      return false;
    }
  }

  /**
   * Send SMS notification
   */
  async sendSMS(phoneNumber: string, message: string): Promise<boolean> {
    try {
      const smsProvider = process.env.SMS_PROVIDER || 'twilio';

      if (smsProvider === 'twilio') {
        return await this.sendViaTwilio(phoneNumber, message);
      } else if (smsProvider === 'aws') {
        return await this.sendViaSNS(phoneNumber, message);
      }

      logger.warn(`SMS provider ${smsProvider} not configured. SMS not sent to ${phoneNumber}`);
      return false;
    } catch (error) {
      logger.error('Error sending SMS:', error);
      return false;
    }
  }

  /**
   * Send via Mailgun
   */
  private async sendViaMailgun(to: string, template: EmailTemplate): Promise<boolean> {
    try {
      const domain = process.env.MAILGUN_DOMAIN || '';
      const apiKey = process.env.MAILGUN_API_KEY || '';

      if (!domain || !apiKey) {
        logger.warn('Mailgun credentials not configured');
        return false;
      }

      const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`api:${apiKey}`).toString('base64')}`,
        },
        body: new URLSearchParams({
          from: 'noreply@eloity.com',
          to,
          subject: template.subject,
          text: template.textBody,
          html: template.htmlBody,
        }),
      });

      return response.ok;
    } catch (error) {
      logger.error('Error sending via Mailgun:', error);
      return false;
    }
  }

  /**
   * Send via AWS SES
   */
  private async sendViaSES(to: string, template: EmailTemplate): Promise<boolean> {
    try {
      logger.info(`Would send email to ${to} via AWS SES`);
      return true;
    } catch (error) {
      logger.error('Error sending via SES:', error);
      return false;
    }
  }

  /**
   * Send via Twilio
   */
  private async sendViaTwilio(phoneNumber: string, message: string): Promise<boolean> {
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID || '';
      const authToken = process.env.TWILIO_AUTH_TOKEN || '';
      const fromNumber = process.env.TWILIO_PHONE_NUMBER || '';

      if (!accountSid || !authToken || !fromNumber) {
        logger.warn('Twilio credentials not configured');
        return false;
      }

      const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: fromNumber,
          To: phoneNumber,
          Body: message,
        }),
      });

      return response.ok;
    } catch (error) {
      logger.error('Error sending via Twilio:', error);
      return false;
    }
  }

  /**
   * Send via AWS SNS
   */
  private async sendViaSNS(phoneNumber: string, message: string): Promise<boolean> {
    try {
      logger.info(`Would send SMS to ${phoneNumber} via AWS SNS`);
      return true;
    } catch (error) {
      logger.error('Error sending via SNS:', error);
      return false;
    }
  }
}

export const walletNotificationService = new WalletNotificationService();
