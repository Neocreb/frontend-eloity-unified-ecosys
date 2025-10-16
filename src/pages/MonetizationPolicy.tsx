import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, DollarSign, Star, Crown, Users, ShoppingCart, Briefcase, TrendingUp, Award, Shield, AlertTriangle } from "lucide-react";

const MonetizationPolicy = () => {
  const navigate = useNavigate();

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
              <DollarSign className="w-8 h-8 text-primary" />
              Monetization Policy
            </CardTitle>
            <p className="text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </CardHeader>
        </Card>

        {/* Introduction */}
        <Card>
          <CardHeader>
            <CardTitle>Our Monetization Philosophy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Eloity believes in empowering all users to earn and monetize their content, skills, 
              and engagement. Our platform provides multiple revenue streams for creators, freelancers, 
              and entrepreneurs while maintaining fair and transparent policies.
            </p>
            <p>
              <strong>Key Principle:</strong> All users can earn, but verified users enjoy more trust, 
              enhanced features, and greater monetization opportunities.
            </p>
          </CardContent>
        </Card>

        {/* Free vs Premium Benefits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-600" />
              Free vs Premium Monetization Benefits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Free Plan */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Free Plan
                </h4>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Full access to monetization tools</li>
                  <li>Ad Manager for sponsored content</li>
                  <li>Freelance marketplace participation</li>
                  <li>Marketplace selling capabilities</li>
                  <li>Crypto P2P trading</li>
                  <li>Unified chat & video monetization</li>
                  <li>Eloity Points earning and rewards</li>
                  <li>Basic analytics and insights</li>
                  <li>Community support</li>
                </ul>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h5 className="font-medium text-sm">Limitations:</h5>
                  <ul className="list-disc list-inside text-xs mt-1 space-y-1">
                    <li>Standard visibility in search and feeds</li>
                    <li>No verified badge (impacts trust)</li>
                    <li>Limited to 10 video uploads per month</li>
                    <li>5GB storage limit</li>
                    <li>90-day content auto-deletion</li>
                  </ul>
                </div>
              </div>

              {/* Premium Plan */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-600" />
                  Verified Premium
                </h4>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li><strong>Blue Verified Badge</strong> - Enhanced trust and credibility</li>
                  <li><strong>Verified Spotlight</strong> - Priority placement in feeds</li>
                  <li><strong>Verified-only filters</strong> - Exclusive collaboration opportunities</li>
                  <li>Unlimited video uploads with HD/4K quality</li>
                  <li>100GB storage with no content deletion</li>
                  <li>Custom thumbnails for better engagement</li>
                  <li>Advanced analytics dashboard</li>
                  <li>100 AI credits monthly for content optimization</li>
                  <li>Eloity Points bonus and cashback rewards</li>
                  <li>Scheduled posts/products/videos/gigs</li>
                  <li>Co-host & stitched video tools</li>
                  <li>Priority customer support</li>
                </ul>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h5 className="font-medium text-sm text-yellow-800">Premium Advantage:</h5>
                  <p className="text-xs text-yellow-700 mt-1">
                    Verified badges significantly increase trust, leading to higher conversion 
                    rates in freelancing, marketplace sales, and content monetization.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monetization Channels */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Available Monetization Channels
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Freelancing Services
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Offer professional services and skills</li>
                  <li>Set your own rates and terms</li>
                  <li>Verified badges increase client trust</li>
                  <li>Secure escrow payment system</li>
                  <li>Performance-based recommendations</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  Marketplace Sales
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Sell physical and digital products</li>
                  <li>Competitive commission rates</li>
                  <li>Verified sellers get priority placement</li>
                  <li>Integrated payment processing</li>
                  <li>Marketing and promotion tools</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Content Creation
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Sponsored content and partnerships</li>
                  <li>Ad revenue sharing program</li>
                  <li>Premium content subscriptions</li>
                  <li>Virtual gifts and tips</li>
                  <li>Live streaming monetization</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Eloity Points & Rewards
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Earn points through platform engagement</li>
                  <li>Convert points to real currency</li>
                  <li>Referral program rewards</li>
                  <li>Premium users get bonus multipliers</li>
                  <li>Cashback on subscription renewals</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Sharing & Fees */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Sharing & Platform Fees</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Freelancing Services</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Platform fee: 5% of project value</li>
                  <li>Payment processing: 2.9% + $0.30</li>
                  <li>Verified freelancers: 4% platform fee</li>
                  <li>No hidden charges or additional fees</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Marketplace Sales</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Commission: 6% of sale price</li>
                  <li>Payment processing included</li>
                  <li>Verified sellers: 5% commission</li>
                  <li>Free listing for all products</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Content Monetization</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Ad revenue: 70% creator, 30% platform</li>
                  <li>Sponsored content: No platform fees</li>
                  <li>Virtual gifts: 80% creator, 20% platform</li>
                  <li>Premium subscriptions: 85% creator, 15% platform</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Eloity Points & Crypto</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Eloity Points transactions: No fees</li>
                  <li>Crypto P2P: 1% transaction fee</li>
                  <li>Wallet operations: Standard network fees</li>
                  <li>Premium users: 50% fee reduction</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trust & Verification Impact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Trust & Verification Impact on Earnings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">How Verified Badges Boost Earnings</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Higher Conversion Rates:</strong> Verified profiles see 40-60% more inquiries</li>
                <li><strong>Premium Pricing:</strong> Verified users can charge 20-30% higher rates</li>
                <li><strong>Priority Placement:</strong> Appear first in search results and recommendations</li>
                <li><strong>Trust Indicators:</strong> Blue badge builds immediate credibility</li>
                <li><strong>Exclusive Opportunities:</strong> Access to verified-only projects and collaborations</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Platform Trust Mechanisms</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>KYC verification for identity assurance</li>
                <li>Rating and review systems</li>
                <li>Secure escrow for financial transactions</li>
                <li>Dispute resolution and mediation</li>
                <li>Fraud detection and prevention systems</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Policy Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Monetization Guidelines & Restrictions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Prohibited Activities</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Selling illegal, harmful, or prohibited items</li>
                <li>Misrepresenting products, services, or qualifications</li>
                <li>Manipulating ratings, reviews, or verification status</li>
                <li>Creating fake accounts or impersonating others</li>
                <li>Engaging in fraudulent payment activities</li>
                <li>Spamming or unsolicited promotional activities</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Content Guidelines</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>All content must comply with community standards</li>
                <li>Sponsored content must be clearly disclosed</li>
                <li>Adult content is prohibited in monetized features</li>
                <li>Copyrighted material requires proper licensing</li>
                <li>Political content subject to additional restrictions</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Account Compliance</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Users must complete tax reporting as required by law</li>
                <li>Verified users must maintain accurate identity information</li>
                <li>Regular compliance checks for high-volume earners</li>
                <li>Violation consequences may include account restrictions</li>
                <li>Appeals process available for policy disputes</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Support & Resources */}
        <Card>
          <CardHeader>
            <CardTitle>Monetization Support & Resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">For All Users</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Community forums and knowledge base</li>
                  <li>Video tutorials and best practices</li>
                  <li>Monthly monetization webinars</li>
                  <li>Email support for general inquiries</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Premium User Benefits</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Priority customer support</li>
                  <li>One-on-one strategy consultations</li>
                  <li>Advanced analytics and insights</li>
                  <li>Early access to new monetization features</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Ready to Upgrade?</h4>
              <p className="text-sm text-blue-700">
                Join thousands of verified creators earning more with premium features. 
                Upgrade to Premium today and unlock your full earning potential.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MonetizationPolicy;
