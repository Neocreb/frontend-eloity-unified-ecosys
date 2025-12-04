import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Users, ShoppingCart, Briefcase, Coins, Shield, AlertTriangle } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

const TermsOfService = () => {
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>

      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl flex items-center justify-center gap-2">
              <FileText className="w-8 h-8 text-primary" />
              Terms of Service
            </CardTitle>
            <p className="text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </CardHeader>
        </Card>

        {/* Introduction */}
        <Card>
          <CardHeader>
            <CardTitle>Welcome to Eloity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              These Terms of Service ("Terms") govern your use of Eloity, an AI-powered
              social media and marketplace platform that includes social networking,
              marketplace functionality, freelancing services, cryptocurrency trading,
              delivery services, verified premium subscriptions, and advanced analytics features.
            </p>
            <p>
              By accessing or using Eloity, you agree to be bound by these Terms.
              If you disagree with any part of these terms, you may not access the Service.
            </p>
          </CardContent>
        </Card>

        {/* Premium Subscription Terms */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-yellow-600" />
              Premium Subscription & Verified Badge
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Free vs Premium Plans</h4>
              <p className="text-sm">
                Eloity offers both free and premium subscription tiers. Free users have access to all
                core features with certain limitations (10 video uploads/month, 5GB storage, 90-day content
                retention). Premium users ({formatCurrency(9.99)}/month or {formatCurrency(99.99)}/year) receive enhanced features including
                verified badges, unlimited uploads, 100GB storage, and priority support.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">KYC Verification Requirements</h4>
              <p className="text-sm mb-2">
                To receive a verified badge, Premium users must complete Know Your Customer (KYC) verification:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                <li>Upload valid government-issued photo identification (front and back)</li>
                <li>Complete real-time selfie verification with liveness detection</li>
                <li>Verify phone number and email address</li>
                <li>Provide accurate personal information</li>
              </ul>
              <p className="text-sm mt-2">
                KYC verification is mandatory for verified badge activation. False or misleading information
                may result in account suspension or termination.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Billing & Payment</h4>
              <p className="text-sm">
                Premium subscriptions are billed through your unified wallet. Sufficient funds must be
                available at renewal time. Failed payments result in a 5-day grace period before
                downgrade to free tier. Users receive notifications 3 days before subscription expiration.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Content Retention & Storage</h4>
              <p className="text-sm">
                Free users: Content is automatically deleted after 90 days. Premium users: No automatic
                deletion. Storage limits apply (5GB free, 100GB premium). Users approaching storage
                limits will receive upgrade prompts.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Verified Badge Usage</h4>
              <p className="text-sm">
                The verified badge indicates identity verification and premium status. Misrepresenting
                verification status or impersonating verified users is prohibited. The badge appears
                across all platform features including profiles, posts, marketplace listings, and chat.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Account Terms */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Account Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Account Creation</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>You must be at least 13 years old to use Eloity</li>
                <li>You must provide accurate and complete information</li>
                <li>You are responsible for maintaining account security</li>
                <li>One person may not maintain multiple accounts</li>
                <li>You must verify your email address to activate your account</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Account Responsibilities</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Keep your login credentials secure and confidential</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>You are liable for all activities under your account</li>
                <li>Update your information to keep it current and accurate</li>
                <li>Comply with all applicable laws and regulations</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Account Termination</h4>
              <p className="text-sm">
                We reserve the right to suspend or terminate accounts that violate these Terms, 
                engage in fraudulent activities, or pose security risks to our platform or users.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Platform Services */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Social Networking
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Share posts, photos, videos, and stories</li>
                <li>Connect with friends and join communities</li>
                <li>Participate in real-time messaging and video calls</li>
                <li>Receive AI-powered content recommendations</li>
                <li>Access live streaming and interactive features</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Marketplace
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Buy and sell products and services</li>
                <li>Secure payment processing through Stripe</li>
                <li>Seller verification and rating systems</li>
                <li>Dispute resolution and customer protection</li>
                <li>Integrated shipping and logistics support</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Freelancing Services
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Post and apply for freelance opportunities</li>
                <li>Secure escrow system for project payments</li>
                <li>Project management and collaboration tools</li>
                <li>Skills verification and portfolio showcasing</li>
                <li>Client-freelancer communication platform</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Coins className="w-4 h-4" />
                Cryptocurrency Features
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Cryptocurrency trading and portfolio management</li>
                <li>P2P cryptocurrency exchange</li>
                <li>Secure wallet integration and management</li>
                <li>Real-time market data and analytics</li>
                <li>DeFi integrations and yield farming</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Delivery Services
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Professional delivery network for marketplace items</li>
                <li>Real-time package tracking and delivery updates</li>
                <li>Delivery provider verification and background checks</li>
                <li>Secure delivery confirmations with photo and signature proof</li>
                <li>Insurance coverage and dispute resolution for deliveries</li>
                <li>Flexible delivery scheduling and location-based matching</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Services Terms */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 9l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Delivery Services Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-blue-800">
                <strong>Note for Delivery Partners:</strong> Individuals applying to become delivery providers
                are subject to additional terms outlined in our{" "}
                <button
                  onClick={() => navigate("/dispatch-partner-terms")}
                  className="text-blue-600 hover:text-blue-800 underline font-medium"
                >
                  Dispatch Partner Terms of Use
                </button>
                , which includes comprehensive Data Privacy Policy and Earnings Agreement specifically for delivery partners.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Delivery Provider Requirements</h4>
              <p className="text-sm mb-2">To become a delivery provider, you must:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Be at least 21 years old with a valid driver's license (2+ years experience)</li>
                <li>Provide current vehicle registration, insurance, and safety inspection</li>
                <li>Complete background check and driving record verification</li>
                <li>Upload required documents including business license (if applicable)</li>
                <li>Maintain minimum service standards and customer ratings</li>
                <li>Comply with local delivery and transportation regulations</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Delivery Provider Responsibilities</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Safely transport packages from pickup to delivery locations</li>
                <li>Provide accurate real-time tracking and status updates</li>
                <li>Handle packages with appropriate care for fragile/valuable items</li>
                <li>Obtain delivery confirmation through photos and signatures</li>
                <li>Communicate professionally with customers and support</li>
                <li>Maintain vehicle in safe and clean operating condition</li>
                <li>Follow delivery instructions and respect customer preferences</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Customer Delivery Terms</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Delivery fees are calculated based on distance, weight, and service level</li>
                <li>Estimated delivery times are approximate and subject to traffic/weather</li>
                <li>Customers must provide accurate delivery addresses and contact information</li>
                <li>Someone must be available to receive packages requiring signature</li>
                <li>Additional fees may apply for failed delivery attempts or address changes</li>
                <li>Insurance coverage is included for items up to declared value</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Liability and Insurance</h4>
              <p className="text-sm mb-2">
                Eloity provides comprehensive delivery insurance coverage. Delivery providers
                are covered under our commercial liability policy during active deliveries.
                Claims for damaged, lost, or stolen items will be processed according to our
                dispute resolution procedures. Maximum liability per package is limited to
                the declared item value, up to $500 unless additional insurance is purchased.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* User Conduct */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              User Conduct
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Acceptable Use</h4>
              <p className="text-sm mb-2">You agree to use Eloity responsibly and in compliance with:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>All applicable local, state, national, and international laws</li>
                <li>These Terms of Service and our Community Guidelines</li>
                <li>Intellectual property rights of others</li>
                <li>Platform security measures and anti-fraud policies</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Prohibited Activities</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Harassment, bullying, or threatening other users</li>
                <li>Posting illegal, harmful, or inappropriate content</li>
                <li>Spam, phishing, or fraudulent activities</li>
                <li>Unauthorized access to other users' accounts</li>
                <li>Manipulation of platform features or algorithms</li>
                <li>Distribution of malware or harmful code</li>
                <li>Money laundering or terrorist financing</li>
                <li>Market manipulation in cryptocurrency trading</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Community Programs & Reward Sharing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Community Programs & Automatic Reward Sharing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Automatic Reward Sharing System</h4>
              <p className="text-sm mb-2">
                To foster community growth and support our referral network, Eloity automatically shares
                0.5% of certain user earnings with verified referrals:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                <li><strong>Included Earnings:</strong> Creator economy rewards (content creation, engagement bonuses, ad revenue sharing, challenge completions, battle voting rewards, gifts and tips)</li>
                <li><strong>Excluded Earnings:</strong> Personal business transactions (freelance payments, marketplace sales, crypto trading profits, direct user payments, withdrawal transactions)</li>
                <li><strong>Distribution:</strong> Shared equally among all verified referrals who remain active on the platform</li>
                <li><strong>Transparency:</strong> All sharing transactions are logged and visible in your referral dashboard</li>
              </ul>
              <p className="text-sm mt-2">
                <strong>Legal Basis:</strong> By using Eloity, you consent to this automatic sharing mechanism.
                This system is designed to reward community builders and create sustainable growth incentives.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Pioneer Badge Program</h4>
              <p className="text-sm mb-2">
                The first 500 genuinely active users are eligible for Pioneer Badges, recognizing early community builders:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                <li><strong>Eligibility Criteria:</strong> Account age (7+ days), active sessions (10+ quality sessions), content creation (3+ posts), engagement quality (5+ minutes average session), community participation (10+ interactions)</li>
                <li><strong>Anti-Abuse Measures:</strong> Sophisticated fraud detection ensures badges go to legitimate users, not bots or manipulative accounts</li>
                <li><strong>Benefits:</strong> Community recognition, potential access to exclusive features as they become available</li>
                <li><strong>Verification:</strong> All badge awards are verified through multiple activity metrics and behavioral analysis</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">User Rights & Program Participation</h4>
              <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                <li>Both programs are integral parts of these Terms of Service</li>
                <li>Participation is automatic for all users; explicit opt-out mechanisms are not provided</li>
                <li>Users retain full rights to their primary earnings; only the specified 0.5% is shared</li>
                <li>Program criteria and percentages may be updated with appropriate notice to users</li>
                <li>All transactions and badge awards are recorded and auditable for transparency</li>
                <li>Users can view detailed sharing history and badge progress through their account dashboard</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Financial Terms */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Payment Processing</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>All payments are processed securely through Stripe</li>
                <li>Transaction fees may apply to marketplace and freelance services</li>
                <li>Cryptocurrency transactions are subject to network fees</li>
                <li>Refunds are processed according to our Refund Policy</li>
                <li>Currency conversion rates are updated in real-time</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Escrow Services</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Freelance payments are held in secure escrow until completion</li>
                <li>Escrow release requires mutual agreement or dispute resolution</li>
                <li>Disputes are handled through our mediation process</li>
                <li>Emergency releases may be processed in exceptional circumstances</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">KYC and Compliance</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Enhanced features require identity verification (KYC)</li>
                <li>We comply with anti-money laundering (AML) regulations</li>
                <li>Large transactions may require additional verification</li>
                <li>We report suspicious activities to relevant authorities</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Intellectual Property */}
        <Card>
          <CardHeader>
            <CardTitle>Intellectual Property</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">User Content</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>You retain ownership of content you create and share</li>
                <li>You grant us license to display, distribute, and promote your content</li>
                <li>You are responsible for ensuring you have rights to content you share</li>
                <li>We may remove content that violates intellectual property rights</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Platform Rights</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Eloity and related marks are our intellectual property</li>
                <li>Our AI algorithms and recommendation systems are proprietary</li>
                <li>Platform software and infrastructure are protected by copyright</li>
                <li>Users may not reverse engineer or copy our technology</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Privacy and Data */}
        <Card>
          <CardHeader>
            <CardTitle>Privacy and Data Protection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">
              Your privacy is important to us. Our collection, use, and protection of your 
              personal information is governed by our Privacy Policy, which is incorporated 
              into these Terms by reference.
            </p>
            <div>
              <h4 className="font-semibold mb-2">Data Usage</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>We use your data to provide and improve our services</li>
                <li>AI systems analyze usage patterns to enhance recommendations</li>
                <li>We implement strong security measures to protect your information</li>
                <li>You can control your privacy settings and data sharing preferences</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimers and Limitations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Disclaimers and Limitations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Service Availability</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Services are provided "as is" without warranties</li>
                <li>We may experience downtime for maintenance or technical issues</li>
                <li>Cryptocurrency markets operate 24/7 but platform access may vary</li>
                <li>AI recommendations are algorithmic and may not always be accurate</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Investment Risks</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Cryptocurrency trading involves significant financial risk</li>
                <li>Market prices can be highly volatile and unpredictable</li>
                <li>Past performance does not guarantee future results</li>
                <li>You should only invest what you can afford to lose</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Limitation of Liability</h4>
              <p className="text-sm">
                To the fullest extent permitted by law, Eloity shall not be liable for any 
                indirect, incidental, special, consequential, or punitive damages, including 
                but not limited to loss of profits, data, or business opportunities.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Dispute Resolution */}
        <Card>
          <CardHeader>
            <CardTitle>Dispute Resolution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Internal Resolution</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>We encourage users to resolve disputes through direct communication</li>
                <li>Our support team can assist with mediation when needed</li>
                <li>Marketplace disputes have dedicated resolution processes</li>
                <li>Escalated cases are reviewed by our dispute resolution team</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Legal Proceedings</h4>
              <p className="text-sm">
                Any disputes that cannot be resolved through our internal processes will be 
                subject to binding arbitration in accordance with applicable laws and regulations.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Modifications */}
        <Card>
          <CardHeader>
            <CardTitle>Modifications to Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              We reserve the right to modify these Terms at any time. We will notify users of 
              material changes via email or platform notifications. Continued use of Eloity 
              after modifications constitutes acceptance of the updated Terms.
            </p>
          </CardContent>
        </Card>

        {/* Governing Law */}
        <Card>
          <CardHeader>
            <CardTitle>Governing Law</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              These Terms are governed by and construed in accordance with applicable laws. 
              Any legal action or proceeding arising under these Terms will be brought 
              exclusively in the appropriate courts.
            </p>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              If you have questions about these Terms of Service, please contact us:
            </p>
            <div className="space-y-2 text-sm">
              <p><strong>Email:</strong> legal@eloity.com</p>
              <p><strong>Address:</strong> Eloity Legal Department</p>
              <p><strong>Response Time:</strong> We aim to respond within 5 business days</p>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <Card>
          <CardContent className="flex gap-4 justify-center flex-wrap">
            <Button onClick={() => navigate("/privacy")}>
              Privacy Policy
            </Button>
            <Button variant="outline" onClick={() => navigate("/dispatch-partner-terms")}>
              Dispatch Partner Terms
            </Button>
            <Button variant="outline" onClick={() => navigate("/cookies")}>
              Cookie Policy
            </Button>
            <Button variant="outline" onClick={() => navigate("/app/advertising")}>
              Advertising Policy
            </Button>
            <Button variant="outline" onClick={() => navigate("/")}>
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfService;
