import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Truck, Shield, DollarSign, AlertTriangle, Clock, Users, MapPin } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

const DispatchPartnerTerms = () => {
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
              <Truck className="w-8 h-8 text-primary" />
              Dispatch Partner Terms of Use
            </CardTitle>
            <p className="text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </CardHeader>
        </Card>

        {/* Introduction */}
        <Card>
          <CardHeader>
            <CardTitle>Introduction</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              These Dispatch Partner Terms of Use ("Partner Terms") govern your participation
              as an independent contractor delivery provider ("Dispatch Partner") on the Eloity
              platform. These terms supplement and work in conjunction with our main Terms of Service.
            </p>
            <p>
              By applying to become a Dispatch Partner and using our delivery services platform,
              you agree to be bound by these Partner Terms, our Privacy Policy, Data Privacy Policy,
              and Earnings Agreement.
            </p>
          </CardContent>
        </Card>

        {/* Partner Requirements & Eligibility */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Partner Requirements & Eligibility
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Age and Legal Requirements</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Must be at least 21 years old</li>
                <li>Valid government-issued identification</li>
                <li>Legal authorization to work in the jurisdiction</li>
                <li>Valid driver's license with minimum 2 years driving experience</li>
                <li>Clean driving record with no major violations in past 3 years</li>
                <li>Pass comprehensive background check including criminal history</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Vehicle Requirements</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Current vehicle registration and valid inspection certificate</li>
                <li>Comprehensive vehicle insurance meeting minimum coverage requirements</li>
                <li>Vehicle in safe, clean, and operational condition</li>
                <li>GPS-capable smartphone with data plan</li>
                <li>Vehicle storage capacity appropriate for delivery type</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Business Requirements (If Applicable)</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Valid business license for commercial delivery operations</li>
                <li>Commercial vehicle insurance for business use</li>
                <li>Tax identification number and proper business registration</li>
                <li>Compliance with local delivery and transportation regulations</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Data Privacy & Information Handling */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Data Privacy & Information Handling
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Personal Data Collection</h4>
              <p className="text-sm mb-2">As a Dispatch Partner, we collect and process:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Identity verification documents (driver's license, insurance, registration)</li>
                <li>Background check and driving record information</li>
                <li>Real-time location data during active delivery periods</li>
                <li>Vehicle information and safety inspection records</li>
                <li>Financial information for earnings distribution</li>
                <li>Performance metrics and customer feedback</li>
                <li>Communication records with customers and support</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Data Usage and Sharing</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Location data is used for delivery routing and customer tracking</li>
                <li>Performance data is used for quality assurance and platform improvement</li>
                <li>Customer delivery information is shared only as necessary for service completion</li>
                <li>Background check results are confidentially maintained and not shared</li>
                <li>Earnings and tax information is provided to relevant authorities as required</li>
                <li>Anonymized performance metrics may be used for platform analytics</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Data Protection Rights</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Right to access your personal data and delivery records</li>
                <li>Right to correct inaccurate information in your profile</li>
                <li>Right to request deletion of data after contract termination</li>
                <li>Right to data portability for your earnings and performance records</li>
                <li>Right to object to certain data processing activities</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Customer Data Protection</h4>
              <p className="text-sm mb-2">Partners must:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Maintain strict confidentiality of all customer information</li>
                <li>Use customer data only for delivery completion</li>
                <li>Not retain customer contact information after delivery</li>
                <li>Report any data security incidents immediately</li>
                <li>Comply with all applicable data protection regulations</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Earnings Agreement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Earnings Agreement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Compensation Structure</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Base delivery fee calculated by distance, time, and complexity</li>
                <li>Additional compensation for special handling (fragile, valuable items)</li>
                <li>Peak time bonuses during high-demand periods</li>
                <li>Customer tips are passed through 100% to partners</li>
                <li>Performance bonuses for exceptional service ratings</li>
                <li>Mileage compensation for long-distance deliveries</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Payment Terms</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Instant payout available after each completed delivery</li>
                <li>Weekly automatic deposits every Tuesday for standard payouts</li>
                <li>Minimum payout threshold of {formatCurrency(5, 'text')} for instant payments</li>
                <li>Payment processing fees may apply for instant payouts</li>
                <li>All earnings are subject to applicable taxes and deductions</li>
                <li>Disputed payments are held pending resolution</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Expense Responsibilities</h4>
              <p className="text-sm mb-2">Partners are responsible for:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Vehicle fuel, maintenance, and operational costs</li>
                <li>Vehicle and liability insurance coverage</li>
                <li>Mobile device and data plan expenses</li>
                <li>Applicable taxes on earnings and deductions</li>
                <li>Equipment costs for delivery accessories</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Platform Fees</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Service fee of 15-25% deducted from gross delivery earnings</li>
                <li>Additional fees for premium features or expedited payments</li>
                <li>No hidden fees - all deductions clearly itemized</li>
                <li>Fee structure may be adjusted with 30 days advance notice</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Tax Obligations</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Partners are independent contractors responsible for tax obligations</li>
                <li>1099 tax forms provided annually for earnings reporting</li>
                <li>Partners must maintain records for business expense deductions</li>
                <li>Eloity does not withhold taxes from partner earnings</li>
                <li>International partners subject to applicable tax treaties</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Service Standards & Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Service Standards & Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Service Quality Requirements</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Maintain minimum 4.2-star average customer rating</li>
                <li>Complete at least 85% of accepted delivery requests</li>
                <li>Respond to delivery requests within 2 minutes</li>
                <li>Provide accurate delivery time estimates</li>
                <li>Handle packages with appropriate care and professionalism</li>
                <li>Maintain clean and professional appearance</li>
                <li>Communicate courteously with customers and support</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Delivery Protocol</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Verify pickup details and package condition before acceptance</li>
                <li>Provide real-time tracking updates throughout delivery</li>
                <li>Obtain appropriate delivery confirmation (photo/signature)</li>
                <li>Follow specific customer delivery instructions</li>
                <li>Report delivery issues or delays immediately</li>
                <li>Secure packages appropriately during transport</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Performance Monitoring</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Regular performance reviews based on metrics and feedback</li>
                <li>Improvement plans for partners below quality standards</li>
                <li>Recognition and rewards for exceptional performance</li>
                <li>Transparent reporting of performance metrics</li>
                <li>Right to appeal performance evaluations</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Liability & Insurance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-orange-600" />
              Liability & Insurance Coverage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Platform Insurance Coverage</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Commercial liability coverage during active delivery periods</li>
                <li>Package loss/damage coverage up to declared value ({formatCurrency(500, 'text')} maximum)</li>
                <li>Third-party liability protection for delivery-related incidents</li>
                <li>Coverage gaps filled between personal and commercial insurance</li>
                <li>Emergency roadside assistance during active deliveries</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Partner Insurance Requirements</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Maintain personal auto insurance meeting state minimums</li>
                <li>Commercial coverage required for business-use vehicles</li>
                <li>Notify insurance provider of delivery activities</li>
                <li>Provide current insurance certificates upon request</li>
                <li>Immediate notification of insurance lapses or changes</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Limitation of Liability</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Partners liable for gross negligence or willful misconduct</li>
                <li>Platform liability limited to insurance coverage amounts</li>
                <li>Partners responsible for vehicle damage from personal use</li>
                <li>Deductibles may apply to certain insurance claims</li>
                <li>Partners must report incidents within 24 hours</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Dispute Resolution & Termination */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Dispute Resolution & Account Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Dispute Resolution Process</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Customer complaints reviewed within 24 hours</li>
                <li>Partners have right to respond to all complaints</li>
                <li>Escalation to mediation for unresolved disputes</li>
                <li>Fair hearing process for serious allegations</li>
                <li>Appeals process for account actions</li>
                <li>Documentation requirements for dispute evidence</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Account Suspension/Termination</h4>
              <p className="text-sm mb-2">Account action may result from:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Repeated service quality violations</li>
                <li>Safety violations or reckless driving reports</li>
                <li>Fraudulent activities or false information</li>
                <li>Violation of customer privacy or data policies</li>
                <li>Failure to maintain required documentation</li>
                <li>Criminal activities or background check issues</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Voluntary Termination</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Partners may terminate agreement with 14 days notice</li>
                <li>Outstanding payments processed within 30 days</li>
                <li>Return of any platform-provided equipment</li>
                <li>Data deletion following applicable retention periods</li>
                <li>Non-compete restrictions do not apply to independent contractors</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Platform Updates & Modifications */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Updates & Modifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Terms Modifications</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Material changes require 30 days advance notice</li>
                <li>Continued use constitutes acceptance of updated terms</li>
                <li>Partners may terminate if they disagree with changes</li>
                <li>Earnings structure changes require 60 days notice</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Platform Features</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>New features and tools added regularly</li>
                <li>Beta testing opportunities for interested partners</li>
                <li>Training provided for significant platform updates</li>
                <li>Feedback encouraged for platform improvements</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Legal Compliance */}
        <Card>
          <CardHeader>
            <CardTitle>Legal Compliance & Governing Law</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Regulatory Compliance</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Compliance with local transportation and delivery regulations</li>
                <li>Adherence to labor laws regarding independent contractors</li>
                <li>Data protection compliance (GDPR, CCPA, etc.)</li>
                <li>Anti-discrimination and equal opportunity policies</li>
                <li>Environmental regulations for vehicle emissions</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Governing Law</h4>
              <p className="text-sm">
                These Partner Terms are governed by applicable local and federal laws.
                Disputes will be resolved through binding arbitration where permitted by law.
                Partners retain the right to pursue claims in small claims court for qualifying disputes.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              For questions about these Dispatch Partner Terms, please contact:
            </p>
            <div className="space-y-2 text-sm">
              <p><strong>Partner Support:</strong> partners@eloity.com</p>
              <p><strong>Legal Department:</strong> legal@eloity.com</p>
              <p><strong>Data Protection Officer:</strong> privacy@eloity.com</p>
              <p><strong>Emergency Support:</strong> 24/7 partner helpline available in app</p>
              <p><strong>Response Time:</strong> Partner inquiries answered within 4 hours</p>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <Card>
          <CardContent className="flex gap-4 justify-center flex-wrap">
            <Button onClick={() => navigate("/terms")}>
              Main Terms of Service
            </Button>
            <Button variant="outline" onClick={() => navigate("/privacy")}>
              Privacy Policy
            </Button>
            <Button variant="outline" onClick={() => navigate("/delivery/apply")}>
              Apply to Become Partner
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

export default DispatchPartnerTerms;
