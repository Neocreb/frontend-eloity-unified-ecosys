import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ShoppingCart,
  Users,
  Award,
  Eye,
  Megaphone,
  ChevronLeft,
  ChevronRight,
  Target,
  DollarSign,
  Calendar as CalendarIcon,
  MapPin,
  Heart,
  User,
  Briefcase,
  Bitcoin,
  ShoppingBag,
  Monitor,
  Zap,
  CheckCircle2,
  AlertCircle,
  Wallet,
  CreditCard,
  Plus,
  Settings,
  Info,
  ArrowLeft,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { CAMPAIGN_GOALS } from "@/components/campaigns/CampaignCenter";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import AudienceTargeting from "@/components/campaigns/AudienceTargeting";
import CampaignPayment from "@/components/campaigns/CampaignPayment";
import { useUserBoostableContent } from "@/hooks/use-user-boostable-content";
import { useAuth } from "@/contexts/AuthContext";
import { campaignService } from "@/services/campaignService";

// Available content types for boosting
const BOOSTABLE_CONTENT = {
  MARKETPLACE_PRODUCTS: {
    id: "marketplace_products",
    name: "Marketplace Products",
    icon: ShoppingBag,
    description: "Boost your physical or digital products",
    examples: ["Electronics", "Fashion", "Digital Downloads"],
  },
  FREELANCE_SERVICES: {
    id: "freelance_services",
    name: "Freelance Services",
    icon: Briefcase,
    description: "Promote your professional services",
    examples: ["Web Design", "Writing", "Marketing"],
  },
  JOB_POSTS: {
    id: "job_posts",
    name: "Job Posts",
    icon: Users,
    description: "Attract quality freelancer applications",
    examples: ["Development Jobs", "Design Tasks", "Content Writing"],
  },
  VIDEOS: {
    id: "videos",
    name: "Videos & Content",
    icon: Monitor,
    description: "Increase views and engagement",
    examples: ["Tutorials", "Entertainment", "Educational"],
  },
  SOCIAL_POSTS: {
    id: "social_posts",
    name: "Social Posts",
    icon: Heart,
    description: "Boost your social media content",
    examples: ["Status Updates", "Photos", "Stories"],
  },
  USER_PROFILES: {
    id: "user_profiles",
    name: "User Profiles",
    icon: User,
    description: "Showcase your professional profile",
    examples: ["Freelancer Profiles", "Business Profiles"],
  },
};

// Audience targeting options
const AUDIENCE_LOCATIONS = [
  { id: "ng", name: "Nigeria", flag: "🇳🇬" },
  { id: "gh", name: "Ghana", flag: "🇬🇭" },
  { id: "ke", name: "Kenya", flag: "🇰🇪" },
  { id: "za", name: "South Africa", flag: "🇿🇦" },
  { id: "us", name: "United States", flag: "🇺🇸" },
  { id: "uk", name: "United Kingdom", flag: "🇬🇧" },
  { id: "worldwide", name: "Worldwide", flag: "🌍" },
];

const AUDIENCE_INTERESTS = [
  { id: "freelance", name: "Freelancing", color: "blue" },
  { id: "crypto", name: "Cryptocurrency", color: "yellow" },
  { id: "ecommerce", name: "E-commerce", color: "green" },
  { id: "entertainment", name: "Entertainment", color: "purple" },
  { id: "technology", name: "Technology", color: "indigo" },
  { id: "business", name: "Business", color: "gray" },
  { id: "education", name: "Education", color: "orange" },
  { id: "health", name: "Health & Fitness", color: "red" },
  { id: "food", name: "Food & Dining", color: "pink" },
  { id: "travel", name: "Travel", color: "teal" },
];

const AGE_GROUPS = [
  { id: "18-24", name: "18-24 years" },
  { id: "25-34", name: "25-34 years" },
  { id: "35-44", name: "35-44 years" },
  { id: "45-54", name: "45-54 years" },
  { id: "55+", name: "55+ years" },
];

const PAYMENT_METHODS = [
  {
    id: "eloits",
    name: "Eloits",
    icon: Zap,
    description: "Use your Eloits balance",
    available: true,
    balance: 1250.5,
    bonus: "10% extra reach with Eloits",
  },
  {
    id: "usdt",
    name: "USDT",
    icon: Bitcoin,
    description: "Pay with USDT from your crypto wallet",
    available: true,
    balance: 150.3,
  },
  {
    id: "wallet_balance",
    name: "Wallet Balance",
    icon: Wallet,
    description: "Use your unified wallet balance",
    available: true,
    balance: 89.45,
  },
  {
    id: "card",
    name: "Credit/Debit Card",
    icon: CreditCard,
    description: "Add funds via card payment",
    available: true,
  },
];

export default function CreateCampaign() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  const [campaignData, setCampaignData] = useState({
    goal: null as any,
    contentType: "",
    selectedContent: [] as any[],
    campaignName: "",
    campaignDescription: "",
    targeting: {
      locations: [] as string[],
      interests: [] as string[],
      ageGroups: [] as string[],
      gender: "all",
      deviceTypes: [] as string[],
      languages: [] as string[],
      incomeLevel: "any",
      education: "any",
      employmentStatus: "any",
      relationshipStatus: "any",
      behaviors: [] as string[],
      customAudiences: [] as string[],
    },
    budget: {
      type: "daily",
      amount: 50,
      currency: "eloits",
      boostSpeed: "standard",
    },
    schedule: {
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      timezone: "Africa/Lagos",
    },
    payment: {
      method: "eloits",
      agreesToTerms: false,
    },
  });

  const { user } = useAuth();
  const { content: userContent, isLoading: contentLoading } = useUserBoostableContent();
  const [estimatedReach, setEstimatedReach] = useState(50000);

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGoalSelect = (goal: any) => {
    setCampaignData((prev) => ({
      ...prev,
      goal,
      selectedContent: [],
    }));
  };

  const handleContentSelect = (content: any) => {
    setCampaignData((prev) => ({
      ...prev,
      selectedContent: prev.selectedContent.some((c) => c.id === content.id)
        ? prev.selectedContent.filter((c) => c.id !== content.id)
        : [...prev.selectedContent, content],
    }));
  };

  const calculateEstimatedReach = () => {
    const baseReach = campaignData.budget.amount * 50;
    const locationMultiplier = campaignData.targeting.locations.includes(
      "worldwide"
    )
      ? 2
      : 1;
    const interestMultiplier =
      campaignData.targeting.interests.length > 0 ? 1.2 : 1;
    return Math.round(baseReach * locationMultiplier * interestMultiplier);
  };

  const calculateTotalCost = () => {
    const baseCost =
      campaignData.budget.type === "daily"
        ? campaignData.budget.amount * 7
        : campaignData.budget.amount;

    const speedMultiplier =
      campaignData.budget.boostSpeed === "fast"
        ? 1.5
        : campaignData.budget.boostSpeed === "slow"
          ? 0.8
          : 1;

    return baseCost * speedMultiplier;
  };

  const handleCreateCampaign = async () => {
    if (!campaignData.goal || campaignData.selectedContent.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please complete all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!campaignData.payment.agreesToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the terms and conditions",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to create a campaign",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create slug from campaign name
      const slug = (campaignData.campaignName || campaignData.goal.name)
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

      // Map goal ID to goal type
      const goalTypeMap: Record<string, string> = {
        increase_sales: "increase_sales",
        get_applications: "get_applications",
        promote_talent: "promote_talent",
        get_more_views: "get_more_views",
        drive_chats: "drive_chats",
      };

      const goalType = goalTypeMap[campaignData.goal.id] || "increase_sales";
      const totalBudget = calculateTotalCost();

      // Save campaign to database
      const campaignData_ = {
        name: campaignData.campaignName || campaignData.goal.name,
        slug: slug,
        description: campaignData.campaignDescription,
        type: "product_boost",
        goal_type: goalType,
        startDate: campaignData.schedule.startDate.toISOString(),
        endDate: campaignData.schedule.endDate.toISOString(),
        targeting: campaignData.targeting,
        estimated_reach: estimatedReach,
        status: "active",
        isPublic: true,
        requiresApproval: false,
        createdBy: user.id,
        currency: campaignData.budget.currency,
        budget: totalBudget,
      };

      const createdCampaign = await campaignService.createCampaign(campaignData_);

      if (!createdCampaign) {
        throw new Error("Failed to create campaign");
      }

      toast({
        title: "Success",
        description: "Campaign created successfully!",
      });

      navigate("/app/campaigns");
    } catch (error) {
      console.error("Error creating campaign:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create campaign",
        variant: "destructive",
      });
    }
  };

  const getStepIcon = (step: number) => {
    if (currentStep > step)
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    if (currentStep === step)
      return <div className="w-5 h-5 bg-blue-600 rounded-full" />;
    return <div className="w-5 h-5 bg-gray-300 rounded-full" />;
  };

  const filteredContent = userContent.filter((content) => {
    if (!campaignData.goal) return true;

    // Map content types to goal targets
    const contentTypeMap: Record<string, string[]> = {
      product: ["marketplace_products"],
      service: ["freelance_services"],
      job: ["freelance_jobs"],
      video: ["videos", "content"],
      post: ["posts", "content"],
      profile: ["user_profiles"],
    };

    const targetTypes = contentTypeMap[content.type] || [];
    return campaignData.goal.targets.some((target: string) =>
      targetTypes.includes(target)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="w-full px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/app/campaigns")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-2xl font-bold">Create Campaign</h1>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between px-2">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center">
                <div className="flex flex-col items-center">
                  {getStepIcon(step)}
                  <span
                    className={`text-xs mt-1 ${currentStep >= step ? "text-blue-600" : "text-gray-400"} hidden sm:block`}
                  >
                    Step {step}
                  </span>
                  <span
                    className={`text-xs mt-1 ${currentStep >= step ? "text-blue-600" : "text-gray-400"} sm:hidden`}
                  >
                    {step}
                  </span>
                </div>
                {step < 5 && (
                  <div
                    className={`w-6 sm:w-12 h-px mx-1 sm:mx-2 ${currentStep > step ? "bg-green-600" : "bg-gray-300"}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          {/* Step 1: Campaign Goal */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">
                  What's your campaign goal?
                </h3>
                <p className="text-muted-foreground">
                  Choose your primary objective to optimize your campaign
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {Object.values(CAMPAIGN_GOALS).map((goal) => (
                  <Card
                    key={goal.id}
                    className={`cursor-pointer transition-all ${
                      campaignData.goal?.id === goal.id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "hover:shadow-md"
                    }`}
                    onClick={() => handleGoalSelect(goal)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            campaignData.goal?.id === goal.id
                              ? "bg-blue-100 dark:bg-blue-800"
                              : "bg-gray-100 dark:bg-gray-700"
                          }`}
                        >
                          <goal.icon
                            className={`h-5 w-5 ${
                              campaignData.goal?.id === goal.id
                                ? "text-blue-600"
                                : "text-gray-600"
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{goal.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {goal.description}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {goal.targets.map((target, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                {target.replace("_", " ")}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        {campaignData.goal?.id === goal.id && (
                          <CheckCircle2 className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {campaignData.goal && (
                <div className="mt-6">
                  <Label>What type of content do you want to boost?</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                    {Object.values(BOOSTABLE_CONTENT).map((type) => (
                      <div
                        key={type.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          campaignData.contentType === type.id
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "hover:border-gray-300"
                        }`}
                        onClick={() =>
                          setCampaignData((prev) => ({
                            ...prev,
                            contentType: type.id,
                          }))
                        }
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <type.icon className="h-4 w-4" />
                          <span className="font-medium text-sm">{type.name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {type.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Content Selection */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">
                  Select content to boost
                </h3>
                <p className="text-muted-foreground">
                  Choose which items you want to promote in this campaign
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="campaign-name">Campaign Name</Label>
                  <Input
                    id="campaign-name"
                    placeholder="Enter a name for your campaign"
                    value={campaignData.campaignName}
                    onChange={(e) =>
                      setCampaignData((prev) => ({
                        ...prev,
                        campaignName: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="campaign-description">
                    Description (Optional)
                  </Label>
                  <Textarea
                    id="campaign-description"
                    placeholder="Describe your campaign goals and target audience"
                    value={campaignData.campaignDescription}
                    onChange={(e) =>
                      setCampaignData((prev) => ({
                        ...prev,
                        campaignDescription: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div>
                <Label>Your Content</Label>
                {contentLoading ? (
                  <div className="text-center py-8 text-muted-foreground mt-2">
                    <div className="h-12 w-12 rounded-full border-2 border-blue-600 border-t-transparent animate-spin mx-auto mb-3"></div>
                    <p>Loading your content...</p>
                  </div>
                ) : filteredContent.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground mt-2">
                    <Monitor className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No content available for the selected goal.</p>
                    <p className="text-sm">
                      Create some content first to start promoting it.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 mt-2">
                    {filteredContent.map((content) => (
                      <Card
                        key={content.id}
                        className={`cursor-pointer transition-all ${
                          campaignData.selectedContent.some(
                            (c) => c.id === content.id
                          )
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "hover:shadow-sm"
                        }`}
                        onClick={() => handleContentSelect(content)}
                      >
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <img
                              src={content.image || "/placeholder.svg"}
                              alt={content.name}
                              className="w-10 sm:w-12 h-10 sm:h-12 rounded-lg object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm sm:text-base truncate">
                                {content.name}
                              </h4>
                              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                                {content.price && <span>${content.price}</span>}
                                {content.performance && (
                                  <span>
                                    {content.performance.views} views
                                    {content.performance.sales &&
                                      ` • ${content.performance.sales} sales`}
                                    {content.performance.clicks &&
                                      ` • ${content.performance.clicks} clicks`}
                                    {content.performance.likes &&
                                      ` • ${content.performance.likes} likes`}
                                  </span>
                                )}
                              </div>
                            </div>
                            {campaignData.selectedContent.some(
                              (c) => c.id === content.id
                            ) && (
                              <CheckCircle2 className="h-5 w-5 text-blue-600" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Audience Targeting */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">
                  Target your audience
                </h3>
                <p className="text-muted-foreground">
                  Define who you want to reach with your campaign
                </p>
              </div>

              <AudienceTargeting
                targeting={campaignData.targeting}
                onTargetingChange={(targeting) =>
                  setCampaignData((prev) => ({
                    ...prev,
                    targeting,
                  }))
                }
                estimatedReach={estimatedReach}
                onEstimatedReachChange={setEstimatedReach}
              />
            </div>
          )}

          {/* Step 4: Budget & Schedule */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">
                  Set your budget & schedule
                </h3>
                <p className="text-muted-foreground">
                  Decide how much to spend and when to run your campaign
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Budget Type</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {["daily", "total"].map((type) => (
                      <Button
                        key={type}
                        variant={
                          campaignData.budget.type === type
                            ? "default"
                            : "outline"
                        }
                        onClick={() =>
                          setCampaignData((prev) => ({
                            ...prev,
                            budget: { ...prev.budget, type: type as any },
                          }))
                        }
                      >
                        {type === "daily" ? "Daily Budget" : "Total Budget"}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="budget-amount">
                    Budget Amount ({campaignData.budget.currency.toUpperCase()})
                  </Label>
                  <Input
                    id="budget-amount"
                    type="number"
                    min="1"
                    value={campaignData.budget.amount}
                    onChange={(e) =>
                      setCampaignData((prev) => ({
                        ...prev,
                        budget: {
                          ...prev.budget,
                          amount: parseFloat(e.target.value) || 0,
                        },
                      }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="boost-speed">Boost Speed</Label>
                  <Select
                    value={campaignData.budget.boostSpeed}
                    onValueChange={(value) =>
                      setCampaignData((prev) => ({
                        ...prev,
                        budget: { ...prev.budget, boostSpeed: value as any },
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="slow">Slow (Lower budget/day)</SelectItem>
                      <SelectItem value="standard">Standard (Recommended)</SelectItem>
                      <SelectItem value="fast">Fast (Higher budget/day)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator className="my-4" />

                <div>
                  <Label>Campaign Duration</Label>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label htmlFor="start-date" className="text-sm">
                        Start Date
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {format(
                              campaignData.schedule.startDate,
                              "MMM dd, yyyy"
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={campaignData.schedule.startDate}
                            onSelect={(date) =>
                              setCampaignData((prev) => ({
                                ...prev,
                                schedule: {
                                  ...prev.schedule,
                                  startDate: date || new Date(),
                                },
                              }))
                            }
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <Label htmlFor="end-date" className="text-sm">
                        End Date
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {format(campaignData.schedule.endDate, "MMM dd, yyyy")}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={campaignData.schedule.endDate}
                            onSelect={(date) =>
                              setCampaignData((prev) => ({
                                ...prev,
                                schedule: {
                                  ...prev.schedule,
                                  endDate: date || new Date(),
                                },
                              }))
                            }
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Estimated Reach:</span>
                        <span className="font-semibold">
                          {estimatedReach.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Total Cost:</span>
                        <span className="font-semibold">
                          {calculateTotalCost().toFixed(2)}{" "}
                          {campaignData.budget.currency.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Step 5: Payment */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">
                  Complete your payment
                </h3>
                <p className="text-muted-foreground">
                  Review and pay for your campaign
                </p>
              </div>

              <CampaignPayment
                campaignCost={calculateTotalCost()}
                currency={campaignData.budget.currency}
                estimatedReach={estimatedReach}
                estimatedROI={250}
                onPaymentSuccess={() => {
                  setCampaignData((prev) => ({
                    ...prev,
                    payment: { ...prev.payment, agreesToTerms: true },
                  }));
                  handleCreateCampaign();
                }}
                onPaymentError={(error) => {
                  toast({
                    title: "Payment Error",
                    description: error,
                    variant: "destructive",
                  });
                }}
              />

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={campaignData.payment.agreesToTerms}
                  onChange={(e) =>
                    setCampaignData((prev) => ({
                      ...prev,
                      payment: {
                        ...prev.payment,
                        agreesToTerms: e.target.checked,
                      },
                    }))
                  }
                  className="mt-1"
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground">
                  I agree to the{" "}
                  <span className="text-blue-600 cursor-pointer hover:underline">
                    Terms of Service
                  </span>{" "}
                  and{" "}
                  <span className="text-blue-600 cursor-pointer hover:underline">
                    Campaign Guidelines
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer with Navigation */}
      <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-4">
        <div className="w-full max-w-4xl mx-auto flex gap-3">
          {currentStep > 1 && (
            <Button variant="outline" onClick={prevStep}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">Back</span>
            </Button>
          )}

          <div className="ml-auto flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate("/app/campaigns")}
            >
              Cancel
            </Button>

            {currentStep < totalSteps ? (
              <Button onClick={nextStep}>
                <span className="hidden sm:inline">Next</span>
                <span className="sm:hidden">Next</span>
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleCreateCampaign}
                disabled={!campaignData.payment.agreesToTerms}
              >
                <span className="hidden sm:inline">Create Campaign</span>
                <span className="sm:hidden">Create</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
