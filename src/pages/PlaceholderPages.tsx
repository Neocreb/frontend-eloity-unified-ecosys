import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description: string;
  comingSoon?: boolean;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  title,
  description,
  comingSoon = true,
}) => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{title}</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">{description}</p>
            {comingSoon && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 font-medium">🚀 Coming Soon!</p>
                <p className="text-blue-600 text-sm mt-1">
                  This feature is currently under development. Stay tuned for
                  updates!
                </p>
              </div>
            )}
            <div className="flex gap-2 justify-center">
              <Button onClick={() => navigate("/app/feed")}>Go to Feed</Button>
              <Button variant="outline" onClick={() => navigate("/")}>
                Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Individual page components
export const FriendsPage = () => (
  <PlaceholderPage
    title="Friends"
    description="Connect and manage your friendships on SoftChat. See friend requests, suggestions, and manage your social connections."
  />
);

export const GroupsPage = () => (
  <PlaceholderPage
    title="Groups"
    description="Join communities and groups that match your interests. Create, manage, and participate in group discussions."
  />
);

export const AdsPage = () => (
  <PlaceholderPage
    title="Ad Center"
    description="Manage your advertising campaigns and view ad performance metrics for your business on SoftChat."
  />
);

export const MemoriesPage = () => (
  <PlaceholderPage
    title="Memories"
    description="Look back at your favorite moments and memories shared on SoftChat. Relive your best posts and interactions."
  />
);

export const SavedPage = () => (
  <PlaceholderPage
    title="Saved"
    description="Access all your saved posts, videos, and content in one place. Never lose track of content you want to revisit."
  />
);

export const SupportPage = () => (
  <PlaceholderPage
    title="Support"
    description="Get help with SoftChat. Find answers to common questions, report issues, and contact our support team."
    comingSoon={false}
  />
);

export const PagesPage = () => (
  <PlaceholderPage
    title="Pages"
    description="Manage your business pages and professional presence on SoftChat. Create and customize pages for your brand."
  />
);

export const PrivacyPage = () => (
  <PlaceholderPage
    title="Privacy Policy"
    description="Learn about how SoftChat protects your privacy and handles your personal information."
    comingSoon={false}
  />
);

export const TermsPage = () => (
  <PlaceholderPage
    title="Terms of Service"
    description="Read the terms and conditions for using SoftChat platform and services."
    comingSoon={false}
  />
);

export const AdvertisingPage = () => (
  <PlaceholderPage
    title="Advertising"
    description="Learn about advertising opportunities on SoftChat and how to reach your target audience."
  />
);

export const AdChoicesPage = () => (
  <PlaceholderPage
    title="Ad Choices"
    description="Manage your advertising preferences and control the types of ads you see on SoftChat."
    comingSoon={false}
  />
);

export const CookiesPage = () => (
  <PlaceholderPage
    title="Cookie Policy"
    description="Learn about how SoftChat uses cookies and similar technologies to improve your experience."
    comingSoon={false}
  />
);

export const HelpPage = () => (
  <PlaceholderPage
    title="Help Center"
    description="Find help and support resources for using SoftChat. Browse our knowledge base and tutorials."
    comingSoon={false}
  />
);
