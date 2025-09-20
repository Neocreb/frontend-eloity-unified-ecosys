import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Settings, Target, Eye, BarChart, ShoppingCart, Briefcase, Coins, Users } from "lucide-react";

const AdChoices = () => {
  const navigate = useNavigate();

  // Ad preferences state
  const [adPreferences, setAdPreferences] = useState({
    personalizedAds: true,
    demographicTargeting: true,
    interestBasedAds: true,
    behavioralAds: false,
    socialMediaAds: true,
    marketplaceAds: true,
    freelanceAds: true,
    cryptoAds: false,
    thirdPartyAds: false,
    videoAds: true,
    mobileAds: true,
    emailMarketing: false,
    pushNotifications: true,
    locationBasedAds: false,
    crossPlatformTracking: false
  });

  // Interest categories state
  const [interestCategories, setInterestCategories] = useState({
    technology: true,
    business: true,
    finance: false,
    entertainment: true,
    sports: false,
    travel: true,
    food: false,
    fashion: true,
    health: false,
    education: true,
    art: true,
    music: false,
    gaming: true,
    crypto: false,
    investing: false
  });

  const handlePreferenceChange = (key: keyof typeof adPreferences, value: boolean) => {
    setAdPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleInterestChange = (key: keyof typeof interestCategories, value: boolean) => {
    setInterestCategories(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const savePreferences = () => {
    // In a real app, this would save to the backend
    console.log('Saving ad preferences:', { adPreferences, interestCategories });
    // Show success message
  };

  const resetToDefaults = () => {
    setAdPreferences({
      personalizedAds: true,
      demographicTargeting: true,
      interestBasedAds: true,
      behavioralAds: false,
      socialMediaAds: true,
      marketplaceAds: true,
      freelanceAds: true,
      cryptoAds: false,
      thirdPartyAds: false,
      videoAds: true,
      mobileAds: true,
      emailMarketing: false,
      pushNotifications: true,
      locationBasedAds: false,
      crossPlatformTracking: false
    });
    
    setInterestCategories({
      technology: true,
      business: true,
      finance: false,
      entertainment: true,
      sports: false,
      travel: true,
      food: false,
      fashion: true,
      health: false,
      education: true,
      art: true,
      music: false,
      gaming: true,
      crypto: false,
      investing: false
    });
  };

  const disableAllOptional = () => {
    setAdPreferences({
      personalizedAds: false,
      demographicTargeting: false,
      interestBasedAds: false,
      behavioralAds: false,
      socialMediaAds: true, // Keep platform ads
      marketplaceAds: true, // Keep marketplace ads
      freelanceAds: true, // Keep freelance ads
      cryptoAds: false,
      thirdPartyAds: false,
      videoAds: false,
      mobileAds: true, // Keep for functionality
      emailMarketing: false,
      pushNotifications: false,
      locationBasedAds: false,
      crossPlatformTracking: false
    });
    
    // Disable all interests
    const disabledInterests = Object.keys(interestCategories).reduce((acc, key) => ({
      ...acc,
      [key]: false
    }), {} as typeof interestCategories);
    
    setInterestCategories(disabledInterests);
  };

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
              <Target className="w-8 h-8 text-primary" />
              Ad Choices & Preferences
            </CardTitle>
            <p className="text-muted-foreground">
              Control your advertising experience on Eloity
            </p>
          </CardHeader>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4 flex-wrap">
            <Button onClick={savePreferences}>
              Save All Preferences
            </Button>
            <Button variant="outline" onClick={resetToDefaults}>
              Reset to Defaults
            </Button>
            <Button variant="destructive" onClick={disableAllOptional}>
              Disable All Optional Ads
            </Button>
          </CardContent>
        </Card>

        {/* Platform Ad Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Platform Advertisement Types
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Control which types of advertisements you see across different Eloity features.
            </p>
            
            <div className="space-y-4">
              {/* Social Media Ads */}
              <div className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <h4 className="font-semibold">Social Feed Advertisements</h4>
                    <Badge variant="secondary">Platform Feature</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Sponsored posts, stories, and content in your social feed.
                  </p>
                </div>
                <Switch 
                  checked={adPreferences.socialMediaAds} 
                  onCheckedChange={(value) => handlePreferenceChange('socialMediaAds', value)}
                  className="ml-4"
                />
              </div>

              {/* Marketplace Ads */}
              <div className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <ShoppingCart className="w-4 h-4 text-green-600" />
                    <h4 className="font-semibold">Marketplace Advertisements</h4>
                    <Badge variant="secondary">Platform Feature</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Promoted products, sponsored listings, and marketplace banners.
                  </p>
                </div>
                <Switch 
                  checked={adPreferences.marketplaceAds} 
                  onCheckedChange={(value) => handlePreferenceChange('marketplaceAds', value)}
                  className="ml-4"
                />
              </div>

              {/* Freelance Ads */}
              <div className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="w-4 h-4 text-purple-600" />
                    <h4 className="font-semibold">Freelance Advertisements</h4>
                    <Badge variant="secondary">Platform Feature</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Promoted freelancer profiles, featured jobs, and service advertisements.
                  </p>
                </div>
                <Switch 
                  checked={adPreferences.freelanceAds} 
                  onCheckedChange={(value) => handlePreferenceChange('freelanceAds', value)}
                  className="ml-4"
                />
              </div>

              {/* Crypto Ads */}
              <div className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Coins className="w-4 h-4 text-orange-600" />
                    <h4 className="font-semibold">Cryptocurrency Advertisements</h4>
                    <Badge variant="outline">High Risk</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Cryptocurrency trading platforms, DeFi protocols, and investment opportunities.
                  </p>
                </div>
                <Switch 
                  checked={adPreferences.cryptoAds} 
                  onCheckedChange={(value) => handlePreferenceChange('cryptoAds', value)}
                  className="ml-4"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Targeting Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Advertisement Targeting Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Control how advertisements are targeted to you based on your data and behavior.
            </p>
            
            <div className="space-y-4">
              {/* Personalized Ads */}
              <div className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">Personalized Advertisements</h4>
                  <p className="text-sm text-muted-foreground">
                    Show advertisements based on your interests, behavior, and platform activity.
                  </p>
                </div>
                <Switch 
                  checked={adPreferences.personalizedAds} 
                  onCheckedChange={(value) => handlePreferenceChange('personalizedAds', value)}
                  className="ml-4"
                />
              </div>

              {/* Demographic Targeting */}
              <div className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">Demographic Targeting</h4>
                  <p className="text-sm text-muted-foreground">
                    Target ads based on age, gender, location, and language preferences.
                  </p>
                </div>
                <Switch 
                  checked={adPreferences.demographicTargeting} 
                  onCheckedChange={(value) => handlePreferenceChange('demographicTargeting', value)}
                  className="ml-4"
                />
              </div>

              {/* Interest-Based Ads */}
              <div className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">Interest-Based Targeting</h4>
                  <p className="text-sm text-muted-foreground">
                    Show ads based on your selected interests and content preferences.
                  </p>
                </div>
                <Switch 
                  checked={adPreferences.interestBasedAds} 
                  onCheckedChange={(value) => handlePreferenceChange('interestBasedAds', value)}
                  className="ml-4"
                />
              </div>

              {/* Behavioral Ads */}
              <div className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">Behavioral Targeting</h4>
                  <p className="text-sm text-muted-foreground">
                    Target ads based on your browsing patterns and platform usage behavior.
                  </p>
                </div>
                <Switch 
                  checked={adPreferences.behavioralAds} 
                  onCheckedChange={(value) => handlePreferenceChange('behavioralAds', value)}
                  className="ml-4"
                />
              </div>

              {/* Location-Based Ads */}
              <div className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">Location-Based Targeting</h4>
                  <p className="text-sm text-muted-foreground">
                    Show ads based on your current location and geographic preferences.
                  </p>
                </div>
                <Switch 
                  checked={adPreferences.locationBasedAds} 
                  onCheckedChange={(value) => handlePreferenceChange('locationBasedAds', value)}
                  className="ml-4"
                />
              </div>

              {/* Cross-Platform Tracking */}
              <div className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">Cross-Platform Tracking</h4>
                  <p className="text-sm text-muted-foreground">
                    Allow tracking across different devices and platforms for ad targeting.
                  </p>
                </div>
                <Switch 
                  checked={adPreferences.crossPlatformTracking} 
                  onCheckedChange={(value) => handlePreferenceChange('crossPlatformTracking', value)}
                  className="ml-4"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interest Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="w-5 h-5" />
              Interest Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Select your interests to see more relevant advertisements. You can change these anytime.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(interestCategories).map(([interest, enabled]) => (
                <div key={interest} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium capitalize">{interest}</span>
                  <Switch 
                    checked={enabled} 
                    onCheckedChange={(value) => handleInterestChange(interest as keyof typeof interestCategories, value)}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ad Format Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Advertisement Format Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              {/* Video Ads */}
              <div className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">Video Advertisements</h4>
                  <p className="text-sm text-muted-foreground">
                    Allow video advertisements in your feed and other platform areas.
                  </p>
                </div>
                <Switch 
                  checked={adPreferences.videoAds} 
                  onCheckedChange={(value) => handlePreferenceChange('videoAds', value)}
                  className="ml-4"
                />
              </div>

              {/* Mobile Ads */}
              <div className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">Mobile Advertisements</h4>
                  <p className="text-sm text-muted-foreground">
                    Show advertisements optimized for mobile devices and apps.
                  </p>
                </div>
                <Switch 
                  checked={adPreferences.mobileAds} 
                  onCheckedChange={(value) => handlePreferenceChange('mobileAds', value)}
                  className="ml-4"
                />
              </div>

              {/* Third-Party Ads */}
              <div className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">Third-Party Advertisements</h4>
                  <p className="text-sm text-muted-foreground">
                    Allow advertisements from external advertising networks and partners.
                  </p>
                </div>
                <Switch 
                  checked={adPreferences.thirdPartyAds} 
                  onCheckedChange={(value) => handlePreferenceChange('thirdPartyAds', value)}
                  className="ml-4"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Communication Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Marketing Communication Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              {/* Email Marketing */}
              <div className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">Email Marketing</h4>
                  <p className="text-sm text-muted-foreground">
                    Receive promotional emails about new features, offers, and updates.
                  </p>
                </div>
                <Switch 
                  checked={adPreferences.emailMarketing} 
                  onCheckedChange={(value) => handlePreferenceChange('emailMarketing', value)}
                  className="ml-4"
                />
              </div>

              {/* Push Notifications */}
              <div className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">Push Notifications</h4>
                  <p className="text-sm text-muted-foreground">
                    Receive push notifications about promotions and special offers.
                  </p>
                </div>
                <Switch 
                  checked={adPreferences.pushNotifications} 
                  onCheckedChange={(value) => handlePreferenceChange('pushNotifications', value)}
                  className="ml-4"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verified Badge Impact */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <Users className="w-5 h-5" />
              Verified Badge Impact on Visibility
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-yellow-800 mb-2">How Verification Affects Your Ad Experience</h4>
              <p className="text-sm text-yellow-700 mb-3">
                Verified Premium users with blue badges experience enhanced visibility and targeting in our advertising ecosystem.
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h5 className="font-medium text-yellow-800">Verified User Benefits:</h5>
                  <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
                    <li>Higher ad placement priority</li>
                    <li>Premium brand partnership opportunities</li>
                    <li>Verified-only sponsored content access</li>
                    <li>Enhanced trust signals in marketplace ads</li>
                    <li>Priority in freelance service promotions</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h5 className="font-medium text-yellow-800">Trust & Safety:</h5>
                  <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
                    <li>KYC-verified advertisers show verified badge</li>
                    <li>Reduced exposure to unverified content</li>
                    <li>Higher quality ad recommendations</li>
                    <li>Protected from fraudulent advertisers</li>
                    <li>Premium advertiser collaboration tools</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-yellow-300">
              <h5 className="font-medium text-yellow-800 mb-1">Verification Status Impact</h5>
              <p className="text-xs text-yellow-600">
                Your verified status influences which ads you see and how your content is promoted.
                Verified users see more premium, high-quality advertisements and receive preferential
                treatment in our algorithm for content discovery and ad placement.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Data and Privacy */}
        <Card>
          <CardHeader>
            <CardTitle>Your Advertising Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Control and manage your advertising data and privacy settings.
            </p>
            
            <div className="flex gap-4 flex-wrap">
              <Button variant="outline">
                Download Ad Data
              </Button>
              <Button variant="outline">
                View Ad History
              </Button>
              <Button variant="outline">
                Clear Ad Profile
              </Button>
              <Button variant="destructive">
                Delete All Ad Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Industry Opt-outs */}
        <Card>
          <CardHeader>
            <CardTitle>Industry Opt-out Programs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              You can also opt-out of interest-based advertising through industry programs:
            </p>
            
            <div className="space-y-2 text-sm">
              <p><strong>Digital Advertising Alliance (DAA):</strong> <a href="https://optout.aboutads.info/" className="text-primary underline" target="_blank" rel="noopener noreferrer">optout.aboutads.info</a></p>
              <p><strong>Network Advertising Initiative (NAI):</strong> <a href="https://optout.networkadvertising.org/" className="text-primary underline" target="_blank" rel="noopener noreferrer">optout.networkadvertising.org</a></p>
              <p><strong>European Interactive Digital Advertising Alliance (EDAA):</strong> <a href="https://youronlinechoices.eu/" className="text-primary underline" target="_blank" rel="noopener noreferrer">youronlinechoices.eu</a></p>
            </div>
          </CardContent>
        </Card>

        {/* Help and Support */}
        <Card>
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              If you have questions about your advertising choices or need assistance:
            </p>
            <div className="space-y-2 text-sm">
              <p><strong>Email:</strong> adchoices@eloity.com</p>
              <p><strong>Support:</strong> Visit our Help Center</p>
              <p><strong>Response Time:</strong> We aim to respond within 2 business days</p>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <Card>
          <CardContent className="flex gap-4 justify-center flex-wrap">
            <Button onClick={() => navigate("/app/advertising")}>
              Advertising Policy
            </Button>
            <Button variant="outline" onClick={() => navigate("/app/privacy")}>
              Privacy Policy
            </Button>
            <Button variant="outline" onClick={() => navigate("/app/cookies")}>
              Cookie Policy
            </Button>
            <Button variant="outline" onClick={() => navigate("/app/feed")}>
              Back to Feed
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdChoices;