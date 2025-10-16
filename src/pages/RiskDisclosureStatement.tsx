// @ts-nocheck
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  TrendingDown, 
  DollarSign, 
  Globe, 
  Shield, 
  FileText,
  Clock,
  Users,
  Zap,
  Building2
} from 'lucide-react';

export default function RiskDisclosureStatement() {
  const [acknowledgments, setAcknowledgments] = useState({
    cryptoRisks: false,
    marketVolatility: false,
    technicalRisks: false,
    regulatoryRisks: false,
    creatorEconomyRisks: false,
    crossBorderRisks: false,
    liquidityRisks: false,
    generalDisclaimer: false
  });

  const [allAcknowledged, setAllAcknowledged] = useState(false);

  const handleAcknowledgment = (key: string, value: boolean) => {
    const newAcknowledgments = { ...acknowledgments, [key]: value };
    setAcknowledgments(newAcknowledgments);
    
    const allChecked = Object.values(newAcknowledgments).every(v => v === true);
    setAllAcknowledged(allChecked);
  };

  const saveAcknowledgments = () => {
    if (allAcknowledged) {
      localStorage.setItem('riskDisclosureAcknowledged', JSON.stringify({
        timestamp: new Date().toISOString(),
        acknowledgments
      }));
      alert('Risk acknowledgments saved successfully. You may now access financial services.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Risk Disclosure Statement
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-4xl mx-auto">
            Important information about risks associated with cryptocurrency trading, financial services, 
            creator economy participation, and cross-border transactions on Eloity's platform.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <Badge variant="outline" className="bg-red-50 text-red-700">Financial Risk Warning</Badge>
            <Badge variant="outline" className="bg-orange-50 text-orange-700">Regulatory Compliance</Badge>
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Global Operations</Badge>
          </div>
        </div>

        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            <strong>IMPORTANT:</strong> All financial services on Eloity involve significant risks including 
            potential loss of funds. Read this disclosure carefully and only proceed if you understand and 
            accept these risks. This is not financial advice.
          </AlertDescription>
        </Alert>

        <ScrollArea className="h-[70vh]">
          <div className="space-y-6">
            {/* Cryptocurrency Trading Risks */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <TrendingDown className="w-5 h-5" />
                  1. Cryptocurrency Trading Risks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h4 className="font-semibold text-red-800 mb-2">HIGH RISK WARNING</h4>
                  <p className="text-sm text-red-700">
                    Cryptocurrency trading is extremely high risk and speculative. You may lose your entire investment. 
                    Only trade with funds you can afford to lose completely.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Market Volatility Risks</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Cryptocurrency prices can fluctuate dramatically (50%+ in 24 hours)</li>
                      <li>• Market manipulation and whale activity can cause sudden price movements</li>
                      <li>• Low liquidity tokens may experience extreme volatility</li>
                      <li>• News events and social media can trigger massive price swings</li>
                      <li>• Bear markets can last years with 80-90% price declines</li>
                      <li>• Bull market euphoria can create unsustainable price bubbles</li>
                    </ul>

                    <h4 className="font-semibold">Technical and Security Risks</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Smart contract bugs can result in total loss of funds</li>
                      <li>• Blockchain network failures or attacks</li>
                      <li>• Private key loss means permanent fund loss</li>
                      <li>• Phishing attacks and social engineering</li>
                      <li>• Exchange hacks and security breaches</li>
                      <li>• Technical errors in trading algorithms</li>
                    </ul>

                    <h4 className="font-semibold">Liquidity Risks</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• You may not be able to sell when you want to</li>
                      <li>• Large trades can significantly impact market prices</li>
                      <li>• Trading pairs may have insufficient depth</li>
                      <li>• Market makers may withdraw during volatile periods</li>
                      <li>• Network congestion can delay transactions</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Regulatory and Legal Risks</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Governments may ban or restrict cryptocurrency trading</li>
                      <li>• Tax implications may be complex and costly</li>
                      <li>• Regulatory changes can impact token values</li>
                      <li>• Legal status varies by jurisdiction</li>
                      <li>• Compliance requirements may change suddenly</li>
                      <li>• Cross-border restrictions may limit access</li>
                    </ul>

                    <h4 className="font-semibold">Technology and Infrastructure Risks</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Platform downtime during critical market moments</li>
                      <li>• Internet connectivity issues affecting trading</li>
                      <li>• Mobile app or web platform malfunctions</li>
                      <li>• API failures impacting automated trading</li>
                      <li>• Data feed errors leading to incorrect prices</li>
                      <li>• System overload during high-volume periods</li>
                    </ul>

                    <h4 className="font-semibold">Counterparty Risks</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• P2P trading partners may default or commit fraud</li>
                      <li>• Escrow system failures or disputes</li>
                      <li>• Third-party service provider failures</li>
                      <li>• Payment processor issues or chargebacks</li>
                      <li>• Bank account freezes or restrictions</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded">
                  <Checkbox 
                    id="cryptoRisks"
                    checked={acknowledgments.cryptoRisks}
                    onCheckedChange={(checked) => handleAcknowledgment('cryptoRisks', checked as boolean)}
                  />
                  <label htmlFor="cryptoRisks" className="text-sm font-medium">
                    I understand and accept the significant risks associated with cryptocurrency trading, 
                    including the potential for total loss of funds.
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Creator Economy Risks */}
            <Card className="border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-700">
                  <Users className="w-5 h-5" />
                  2. Creator Economy and Monetization Risks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Income Volatility</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Creator earnings are highly unpredictable and variable</li>
                      <li>• Algorithm changes can drastically reduce content visibility</li>
                      <li>• Audience preferences and trends change rapidly</li>
                      <li>• Seasonal fluctuations in engagement and revenue</li>
                      <li>• Competition from other creators affects earnings</li>
                      <li>• Platform policy changes can impact monetization</li>
                    </ul>

                    <h4 className="font-semibold">Content and IP Risks</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Copyright infringement claims and DMCA takedowns</li>
                      <li>• Content theft and unauthorized distribution</li>
                      <li>• Platform content ownership and licensing terms</li>
                      <li>• Brand safety concerns affecting partnerships</li>
                      <li>• Content moderation leading to demonetization</li>
                      <li>• Cultural sensitivity and global audience considerations</li>
                    </ul>

                    <h4 className="font-semibold">Watch2Earn and Reward Risks</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Reward values may fluctuate based on advertiser demand</li>
                      <li>• Ad blockers may prevent reward generation</li>
                      <li>• Fraudulent activity detection may delay payments</li>
                      <li>• Minimum payout thresholds may not be reached</li>
                      <li>• Currency conversion risks for international users</li>
                      <li>• Tax implications of earned rewards and tokens</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Platform Dependency Risks</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Complete reliance on platform for income generation</li>
                      <li>• Account suspension or termination risks</li>
                      <li>• Platform bankruptcy or shutdown possibilities</li>
                      <li>• Data portability limitations for audience migration</li>
                      <li>• Algorithm changes affecting content reach</li>
                      <li>• Payment system changes or delays</li>
                    </ul>

                    <h4 className="font-semibold">Financial Planning Challenges</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Irregular income making budgeting difficult</li>
                      <li>• Lack of traditional employment benefits</li>
                      <li>• Self-employment tax obligations</li>
                      <li>• No guaranteed minimum income or salary</li>
                      <li>• Retirement and health insurance considerations</li>
                      <li>• Business expense management requirements</li>
                    </ul>

                    <h4 className="font-semibold">Market Saturation Risks</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Increasing competition in creator economy space</li>
                      <li>• Audience attention span limitations</li>
                      <li>• Advertising budget constraints affecting creator revenue</li>
                      <li>• Economic downturns reducing discretionary spending</li>
                      <li>• Platform oversaturation with similar content</li>
                      <li>• Changing consumer preferences and behaviors</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded">
                  <Checkbox 
                    id="creatorEconomyRisks"
                    checked={acknowledgments.creatorEconomyRisks}
                    onCheckedChange={(checked) => handleAcknowledgment('creatorEconomyRisks', checked as boolean)}
                  />
                  <label htmlFor="creatorEconomyRisks" className="text-sm font-medium">
                    I understand that creator economy participation involves income volatility, platform dependency, 
                    and various business risks that may affect my financial stability.
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Payment and Financial Service Risks */}
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <DollarSign className="w-5 h-5" />
                  3. Payment Processing and Financial Service Risks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Cross-Border Payment Risks</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Exchange rate fluctuations affecting transaction values</li>
                      <li>• International wire transfer delays and fees</li>
                      <li>• Banking regulations restricting cross-border payments</li>
                      <li>• Correspondent banking relationship changes</li>
                      <li>• Anti-money laundering (AML) compliance delays</li>
                      <li>• Sanctions and restricted country limitations</li>
                    </ul>

                    <h4 className="font-semibold">Regional Payment Provider Risks</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• African mobile money system outages (MTN MoMo, Orange)</li>
                      <li>• Local payment provider insolvency or service disruption</li>
                      <li>• Regulatory changes affecting payment methods</li>
                      <li>• Currency devaluation in emerging markets</li>
                      <li>• Political instability affecting financial infrastructure</li>
                      <li>• Internet connectivity issues in remote areas</li>
                    </ul>

                    <h4 className="font-semibold">KYC/AML Compliance Risks</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Account freezes during compliance investigations</li>
                      <li>• Identity verification delays or rejections</li>
                      <li>• Enhanced due diligence requirements for high-value users</li>
                      <li>• Source of funds documentation requirements</li>
                      <li>• Politically exposed person (PEP) restrictions</li>
                      <li>• Changing regulatory requirements affecting account status</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Transaction Processing Risks</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Payment processor outages or technical failures</li>
                      <li>• Credit card chargebacks and disputes</li>
                      <li>• Bank account insufficient funds or overdrafts</li>
                      <li>• Payment reversal due to fraud investigations</li>
                      <li>• Settlement delays affecting cash flow</li>
                      <li>• Transaction fees reducing net proceeds</li>
                    </ul>

                    <h4 className="font-semibold">Freelance and Escrow Risks</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Client payment defaults or disputes</li>
                      <li>• Escrow system failures or security breaches</li>
                      <li>• Work quality disagreements affecting payment release</li>
                      <li>• Freelancer non-delivery or abandonment of projects</li>
                      <li>• Platform arbitration decisions affecting payments</li>
                      <li>• International tax implications for freelance income</li>
                    </ul>

                    <h4 className="font-semibold">Digital Wallet Risks</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Wallet security breaches or unauthorized access</li>
                      <li>• Lost access due to forgotten passwords or 2FA</li>
                      <li>• Device theft or loss affecting wallet access</li>
                      <li>• Wallet provider service discontinuation</li>
                      <li>• Smart contract vulnerabilities in DeFi integrations</li>
                      <li>• Backup and recovery process failures</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded">
                  <Checkbox 
                    id="crossBorderRisks"
                    checked={acknowledgments.crossBorderRisks}
                    onCheckedChange={(checked) => handleAcknowledgment('crossBorderRisks', checked as boolean)}
                  />
                  <label htmlFor="crossBorderRisks" className="text-sm font-medium">
                    I understand the risks associated with cross-border payments, regional payment providers, 
                    and digital financial services including potential delays, fees, and regulatory restrictions.
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Technology and Platform Risks */}
            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-700">
                  <Zap className="w-5 h-5" />
                  4. Technology and Platform Risks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">System Availability Risks</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Platform downtime during critical trading periods</li>
                      <li>• Real-time communication system failures</li>
                      <li>• Mobile app crashes or performance issues</li>
                      <li>• Database failures affecting account access</li>
                      <li>• CDN outages impacting global access</li>
                      <li>• Scheduled maintenance windows</li>
                    </ul>

                    <h4 className="font-semibold">Data Security Risks</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Personal information breaches or unauthorized access</li>
                      <li>• Financial data theft or misuse</li>
                      <li>• Account takeover and identity theft</li>
                      <li>• Social engineering and phishing attacks</li>
                      <li>• Insider threats and employee misconduct</li>
                      <li>• Third-party service provider security failures</li>
                    </ul>

                    <h4 className="font-semibold">AI and Algorithm Risks</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• AI recommendation system biases or errors</li>
                      <li>• Algorithmic trading malfunctions</li>
                      <li>• Content moderation false positives/negatives</li>
                      <li>• Personalization algorithm manipulation</li>
                      <li>• Machine learning model drift over time</li>
                      <li>• AI-generated content quality issues</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Integration and API Risks</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Third-party API failures affecting functionality</li>
                      <li>• Payment gateway integration issues</li>
                      <li>• Social media platform API changes</li>
                      <li>• Blockchain network congestion or failures</li>
                      <li>• External service provider rate limiting</li>
                      <li>• Version compatibility issues with updates</li>
                    </ul>

                    <h4 className="font-semibold">Scalability and Performance Risks</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• High user load causing system slowdowns</li>
                      <li>• Video streaming quality degradation</li>
                      <li>• Real-time chat message delays</li>
                      <li>• Database query performance issues</li>
                      <li>• Mobile network connectivity problems</li>
                      <li>• Geographic latency affecting user experience</li>
                    </ul>

                    <h4 className="font-semibold">Update and Migration Risks</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Software updates causing temporary disruptions</li>
                      <li>• Data migration errors or losses</li>
                      <li>• Feature deprecation affecting user workflows</li>
                      <li>• Security patch deployment interruptions</li>
                      <li>• Browser compatibility issues with updates</li>
                      <li>• Mobile app store approval delays</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded">
                  <Checkbox 
                    id="technicalRisks"
                    checked={acknowledgments.technicalRisks}
                    onCheckedChange={(checked) => handleAcknowledgment('technicalRisks', checked as boolean)}
                  />
                  <label htmlFor="technicalRisks" className="text-sm font-medium">
                    I understand that technology platforms face inherent risks including system failures, 
                    security breaches, and service disruptions that may affect my ability to access services.
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Regulatory and Legal Risks */}
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <Building2 className="w-5 h-5" />
                  5. Regulatory and Legal Risks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Jurisdictional Compliance Risks</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Different countries have varying cryptocurrency regulations</li>
                      <li>• Financial service licensing requirements may change</li>
                      <li>• Cross-border transaction restrictions or bans</li>
                      <li>• Data protection law compliance (GDPR, NDPR, CCPA)</li>
                      <li>• Consumer protection regulation changes</li>
                      <li>• Tax law modifications affecting digital assets</li>
                    </ul>

                    <h4 className="font-semibold">Enforcement and Sanctions Risks</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Government enforcement actions against crypto services</li>
                      <li>• Economic sanctions affecting specific countries/users</li>
                      <li>• Regulatory fines and penalties for non-compliance</li>
                      <li>• Court orders requiring service restrictions</li>
                      <li>• Asset freezing or forfeiture orders</li>
                      <li>• License revocation or suspension</li>
                    </ul>

                    <h4 className="font-semibold">Tax and Reporting Obligations</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Complex tax reporting requirements for crypto gains</li>
                      <li>• Creator income tax obligations and self-employment taxes</li>
                      <li>• International tax treaty implications</li>
                      <li>• Withholding tax requirements for cross-border payments</li>
                      <li>• Record-keeping obligations for financial transactions</li>
                      <li>• Tax authority audits and investigations</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Content and Speech Regulations</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Content censorship laws in different countries</li>
                      <li>• Hate speech and misinformation regulations</li>
                      <li>• Copyright and intellectual property enforcement</li>
                      <li>• Adult content restrictions and age verification</li>
                      <li>• Political content limitations in certain jurisdictions</li>
                      <li>• Cultural sensitivity requirements for global content</li>
                    </ul>

                    <h4 className="font-semibold">Financial Service Regulations</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Money transmission licensing requirements</li>
                      <li>• Anti-money laundering (AML) compliance obligations</li>
                      <li>• Know Your Customer (KYC) verification requirements</li>
                      <li>• Payment service provider regulations</li>
                      <li>• Securities law implications for certain tokens</li>
                      <li>• Banking partnership restrictions or terminations</li>
                    </ul>

                    <h4 className="font-semibold">Dispute Resolution Limitations</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Limited legal recourse for international disputes</li>
                      <li>• Arbitration clause requirements limiting court access</li>
                      <li>• Jurisdictional challenges for cross-border issues</li>
                      <li>• Language barriers in legal proceedings</li>
                      <li>• Cost and complexity of international litigation</li>
                      <li>• Enforcement challenges for judgments across borders</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded">
                  <Checkbox 
                    id="regulatoryRisks"
                    checked={acknowledgments.regulatoryRisks}
                    onCheckedChange={(checked) => handleAcknowledgment('regulatoryRisks', checked as boolean)}
                  />
                  <label htmlFor="regulatoryRisks" className="text-sm font-medium">
                    I understand that regulatory environments vary globally and changes in laws or 
                    enforcement may affect my ability to access certain services or may create additional obligations.
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Market and Liquidity Risks */}
            <Card className="border-indigo-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-indigo-700">
                  <BarChart3 className="w-5 h-5" />
                  6. Market and Liquidity Risks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Market Structure Risks</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Cryptocurrency markets operate 24/7 without traditional safeguards</li>
                      <li>• No circuit breakers or trading halts during extreme volatility</li>
                      <li>• Limited market depth for smaller cryptocurrencies</li>
                      <li>• Price manipulation by large holders ("whales")</li>
                      <li>• Fragmented liquidity across multiple exchanges</li>
                      <li>• Flash crashes and sudden price collapses</li>
                    </ul>

                    <h4 className="font-semibold">Order Execution Risks</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Slippage during large orders affecting execution price</li>
                      <li>• Failed transactions due to network congestion</li>
                      <li>• Partial fills for limit orders in thin markets</li>
                      <li>• Gas fee spikes on blockchain networks</li>
                      <li>• Frontrunning by algorithmic traders</li>
                      <li>• Order book manipulation and fake volumes</li>
                    </ul>

                    <h4 className="font-semibold">P2P Trading Risks</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Counterparty default or fraud in peer-to-peer trades</li>
                      <li>• Dispute resolution delays in escrow transactions</li>
                      <li>• Price manipulation in low-volume trading pairs</li>
                      <li>• Identity verification challenges for trading partners</li>
                      <li>• Payment method risks (chargebacks, reversals)</li>
                      <li>• Geographic restrictions affecting trading options</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Liquidity and Access Risks</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Inability to exit positions during market stress</li>
                      <li>• Wide bid-ask spreads increasing trading costs</li>
                      <li>• Market closure or access restrictions during crises</li>
                      <li>• Withdrawal limits or suspension during high volatility</li>
                      <li>• Banking partner restrictions affecting fiat access</li>
                      <li>• Regulatory suspensions of trading activities</li>
                    </ul>

                    <h4 className="font-semibold">Economic and Macro Risks</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Global economic recessions affecting risk appetite</li>
                      <li>• Central bank monetary policy changes</li>
                      <li>• Inflation and currency debasement concerns</li>
                      <li>• Geopolitical events triggering market volatility</li>
                      <li>• Correlation with traditional financial markets during stress</li>
                      <li>• Energy costs affecting blockchain network operations</li>
                    </ul>

                    <h4 className="font-semibold">Information and Analysis Risks</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Limited financial reporting for cryptocurrency projects</li>
                      <li>• Misinformation and "fake news" affecting prices</li>
                      <li>• Social media manipulation and pump-and-dump schemes</li>
                      <li>• Lack of professional research coverage</li>
                      <li>• Technical analysis limitations in volatile markets</li>
                      <li>• FOMO (Fear of Missing Out) and emotional trading decisions</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded">
                  <Checkbox 
                    id="liquidityRisks"
                    checked={acknowledgments.liquidityRisks}
                    onCheckedChange={(checked) => handleAcknowledgment('liquidityRisks', checked as boolean)}
                  />
                  <label htmlFor="liquidityRisks" className="text-sm font-medium">
                    I understand that cryptocurrency and digital asset markets have unique liquidity risks 
                    and may experience extreme volatility that could result in significant losses.
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* General Disclaimers and Limitations */}
            <Card className="border-gray-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  7. General Disclaimers and Limitations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h4 className="font-semibold text-yellow-800 mb-2">NO FINANCIAL ADVICE</h4>
                  <p className="text-sm text-yellow-700">
                    Eloity does not provide investment, financial, trading, or legal advice. All information 
                    is for educational purposes only. Consult qualified professionals before making financial decisions.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Service Limitations</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• No guarantee of service availability or uptime</li>
                      <li>• Features may be modified or discontinued without notice</li>
                      <li>• Geographic restrictions may apply to certain services</li>
                      <li>• Age and eligibility requirements for financial services</li>
                      <li>• Account limits and verification requirements</li>
                      <li>• Performance disclaimers for investment-related features</li>
                    </ul>

                    <h4 className="font-semibold">Liability Limitations</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Platform liability limited to the extent permitted by law</li>
                      <li>• No liability for third-party service provider failures</li>
                      <li>• Force majeure events beyond platform control</li>
                      <li>• User responsibility for account security and access</li>
                      <li>• Limitation of damages to direct losses only</li>
                      <li>• No liability for opportunity costs or lost profits</li>
                    </ul>

                    <h4 className="font-semibold">Information Accuracy</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Market data may be delayed or inaccurate</li>
                      <li>• Price feeds subject to third-party provider limitations</li>
                      <li>• User-generated content not verified for accuracy</li>
                      <li>• Translation services may contain errors</li>
                      <li>• Historical performance not indicative of future results</li>
                      <li>• Educational content for informational purposes only</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">User Responsibilities</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Conducting own research before making financial decisions</li>
                      <li>• Understanding tax obligations in your jurisdiction</li>
                      <li>• Maintaining secure access credentials and devices</li>
                      <li>• Reporting suspicious activity or security breaches</li>
                      <li>• Complying with applicable laws and regulations</li>
                      <li>• Providing accurate information during verification</li>
                    </ul>

                    <h4 className="font-semibold">Risk Management Recommendations</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Only invest amounts you can afford to lose completely</li>
                      <li>• Diversify investments across different asset classes</li>
                      <li>• Use strong security practices including 2FA</li>
                      <li>• Regularly review and update account settings</li>
                      <li>• Stay informed about market conditions and risks</li>
                      <li>• Consider professional financial advice for large investments</li>
                    </ul>

                    <h4 className="font-semibold">Emergency Procedures</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Immediate notification of security breaches</li>
                      <li>• Account recovery procedures for lost access</li>
                      <li>• Emergency contact information for urgent issues</li>
                      <li>• Dispute resolution and customer support channels</li>
                      <li>• Backup plans for accessing funds during emergencies</li>
                      <li>• Documentation of important account information</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded">
                  <Checkbox 
                    id="generalDisclaimer"
                    checked={acknowledgments.generalDisclaimer}
                    onCheckedChange={(checked) => handleAcknowledgment('generalDisclaimer', checked as boolean)}
                  />
                  <label htmlFor="generalDisclaimer" className="text-sm font-medium">
                    I understand and accept all disclaimers, limitations, and my responsibilities as outlined above. 
                    I agree to conduct my own research and understand that this platform provides no financial advice.
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Final Acknowledgment */}
            <Card className="border-red-300 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-800">
                  <Shield className="w-5 h-5" />
                  Final Risk Acknowledgment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-red-100 p-4 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-2">COMPLETE RISK UNDERSTANDING REQUIRED</h4>
                  <p className="text-sm text-red-700 mb-3">
                    By checking all boxes above and proceeding, you confirm that you:
                  </p>
                  <ul className="text-sm space-y-1 text-red-700">
                    <li>• Have read and understood all risk disclosures in this document</li>
                    <li>• Accept full responsibility for your financial decisions and potential losses</li>
                    <li>• Understand that past performance does not guarantee future results</li>
                    <li>• Acknowledge that cryptocurrency and digital assets are highly speculative</li>
                    <li>• Are aware of the potential for total loss of invested funds</li>
                    <li>• Will not hold Eloity liable for market losses or service interruptions</li>
                    <li>• Agree to comply with all applicable laws and regulations</li>
                    <li>• Will seek professional advice for significant financial decisions</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2 p-3 bg-white rounded border border-red-200">
                    <Checkbox 
                      id="marketVolatility"
                      checked={acknowledgments.marketVolatility}
                      onCheckedChange={(checked) => handleAcknowledgment('marketVolatility', checked as boolean)}
                    />
                    <label htmlFor="marketVolatility" className="text-sm font-medium">
                      I understand that digital asset markets are extremely volatile and I may lose my entire investment.
                    </label>
                  </div>

                  <div className="text-center pt-4">
                    <Button 
                      onClick={saveAcknowledgments}
                      disabled={!allAcknowledged}
                      className={`px-8 py-3 text-lg font-semibold ${
                        allAcknowledged 
                          ? 'bg-red-600 hover:bg-red-700 text-white' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {allAcknowledged 
                        ? 'I Accept All Risks and Agree to Proceed' 
                        : 'Please Read and Acknowledge All Risk Sections Above'
                      }
                    </Button>
                  </div>

                  <div className="text-center text-sm text-gray-600">
                    <p>
                      <strong>Last Updated:</strong> {new Date().toLocaleDateString()} | 
                      <strong> Version:</strong> 1.0 | 
                      <strong> Effective Immediately</strong>
                    </p>
                    <p className="mt-2">
                      For questions about this Risk Disclosure Statement, contact: 
                      <span className="text-blue-600"> risk@eloity.com</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
