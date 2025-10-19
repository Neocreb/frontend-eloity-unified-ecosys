import React, { useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { CAMPAIGN_GOALS } from "./CampaignCenter";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import AudienceTargeting from "./AudienceTargeting";
import CampaignPayment from "./CampaignPayment";

interface CampaignCreationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onCampaignCreated: (campaign: any) => void;
  context?: "seller" | "freelancer" | "client";
  entityId?: string;
  entityType?: "product" | "profile" | "job" | "service";
  // Legacy prop for backwards compatibility
  open?: boolean;
}

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

// Payment methods integration with wallet
const PAYMENT_METHODS = [
  {
    id: "eloits",
    name: "Eloits",
    icon: Zap,
    description: "Use your Eloits balance",
    available: true,
    balance: 1250.50,
    bonus: "10% extra reach with Eloits",
  },
  {
    id: "usdt",
    name: "USDT",
    icon: Bitcoin,
    description: "Pay with USDT from your crypto wallet",
    available: true,
    balance: 150.30,
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

const CampaignCreationWizard: React.FC<CampaignCreationWizardProps> = ({
  isOpen,
  open, // Legacy prop
  context = "seller",
  entityId,
  entityType,
  onClose,
  onCampaignCreated,
}) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  // Form state
  const [campaignData, setCampaignData] = useState({
    // Step 1: Campaign Goal
    goal: null as any,
    contentType: "",
    
    // Step 2: Content Selection
    selectedContent: [] as any[],
    campaignName: "",
    campaignDescription: "",
    
    // Step 3: Audience Targeting
    targeting: {
      locations: [] as string[],
      interests: [] as string[],
      ageGroups: [] as string[],
      gender: "all", // all, male, female
      deviceTypes: [] as string[], // mobile, desktop, tablet
      languages: [] as string[],
      incomeLevel: "any",
      education: "any",
      employmentStatus: "any",
      relationshipStatus: "any",
      behaviors: [] as string[],
      customAudiences: [] as string[],
    },
    
    // Step 4: Budget & Schedule
    budget: {
      type: "daily", // daily, total
      amount: 50,
      currency: "eloits",
      boostSpeed: "standard", // slow, standard, fast
    },
    schedule: {
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      timezone: "Africa/Lagos",
    },
    
    // Step 5: Payment
    payment: {
      method: "eloits",
      agreesToTerms: false,
    }
  });

  const [estimatedReach, setEstimatedReach] = useState(50000);
  const [mockUserContent] = useState([
    {
      id: "1",
      type: "marketplace_products",
      name: "Wireless Bluetooth Headphones",
      image: "/placeholder.svg",
      price: 45.99,
      status: "active",
      performance: { views: 234, sales: 12 }
    },
    {
      id: "2", 
      type: "freelance_services",
      name: "Professional Logo Design",
      image: "/placeholder.svg", 
      price: 150.00,
      status: "active",
      performance: { views: 456, inquiries: 23 }
    },
    {
      id: "3",
      type: "videos",
      name: "React Tutorial Series",
      image: "/placeholder.svg",
      duration: "15:30",
      status: "published",
      performance: { views: 1230, likes: 89 }
    },
  ]);

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
    setCampaignData(prev => ({
      ...prev,
      goal,
      selectedContent: [], // Reset content selection when goal changes
    }));
  };

  const handleContentSelect = (content: any) => {
    setCampaignData(prev => ({
      ...prev,
      selectedContent: prev.selectedContent.some(c => c.id === content.id)
        ? prev.selectedContent.filter(c => c.id !== content.id)
        : [...prev.selectedContent, content]
    }));
  };

  const calculateEstimatedReach = () => {
    const baseReach = campaignData.budget.amount * 50; // Base calculation
    const locationMultiplier = campaignData.targeting.locations.includes("worldwide") ? 2 : 1;
    const interestMultiplier = campaignData.targeting.interests.length > 0 ? 1.2 : 1;
    return Math.round(baseReach * locationMultiplier * interestMultiplier);
  };

  const calculateTotalCost = () => {
    const baseCost = campaignData.budget.type === "daily" 
      ? campaignData.budget.amount * 7 // Assume 7 days for daily budget
      : campaignData.budget.amount;
    
    const speedMultiplier = campaignData.budget.boostSpeed === "fast" ? 1.5 : 
                           campaignData.budget.boostSpeed === "slow" ? 0.8 : 1;
    
    return baseCost * speedMultiplier;
  };

  const handleCreateCampaign = () => {
    // Validate required fields
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

    // Create campaign object
    const newCampaign = {
      id: Date.now().toString(),
      name: campaignData.campaignName || `${campaignData.goal.name} Campaign`,
      goal: campaignData.goal,
      status: "active",
      budget: calculateTotalCost(),
      spent: 0,
      remaining: calculateTotalCost(),
      duration: campaignData.budget.type === "daily" ? 7 : 
                Math.ceil((campaignData.schedule.endDate.getTime() - campaignData.schedule.startDate.getTime()) / (24 * 60 * 60 * 1000)),
      timeLeft: "7 days", // This would be calculated properly
      performance: {
        impressions: 0,
        clicks: 0,
        conversions: 0,
        ctr: 0,
        conversionRate: 0,
        costPerClick: 0,
        roi: 0,
      },
      boostedItems: campaignData.selectedContent.map(content => ({
        type: content.type,
        name: content.name,
        image: content.image,
      })),
      currency: campaignData.budget.currency.replace("_", " ").toUpperCase(),
      createdAt: new Date().toISOString().split('T')[0],
      targeting: campaignData.targeting,
      estimatedReach: estimatedReach,
    };

    onCampaignCreated(newCampaign);
  };

  const getStepIcon = (step: number) => {
    if (currentStep > step) return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    if (currentStep === step) return <div className="w-5 h-5 bg-blue-600 rounded-full" />;
    return <div className="w-5 h-5 bg-gray-300 rounded-full" />;
  };

  const filteredContent = mockUserContent.filter(content => {
    if (!campaignData.goal) return true;
    return campaignData.goal.targets.some((target: string) => 
      content.type.includes(target.replace("_", "_"))
    );
  });

  const getSelectedPaymentMethod = () => {
    return PAYMENT_METHODS.find(method => method.id === campaignData.payment.method);
  };

  return (
    <Dialog open={isOpen || open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-[800px] max-h-[90vh] mx-auto p-4 sm:p-6 flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Campaign</DialogTitle>
          <DialogDescription>
            Set up your campaign to boost visibility and reach your goals
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6 px-2">
          {[1, 2, 3, 4, 5].map((step) => (
            <div key={step} className="flex items-center">
              <div className="flex flex-col items-center">
                {getStepIcon(step)}
                <span className={`text-xs mt-1 ${currentStep >= step ? 'text-blue-600' : 'text-gray-400'} hidden sm:block`}>
                  Step {step}
                </span>
                <span className={`text-xs mt-1 ${currentStep >= step ? 'text-blue-600' : 'text-gray-400'} sm:hidden`}>
                  {step}
                </span>
              </div>
              {step < 5 && (
                <div className={`w-6 sm:w-12 h-px mx-1 sm:mx-2 ${currentStep > step ? 'bg-green-600' : 'bg-gray-300'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content: make this area scrollable so footer stays visible */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Step 1: Campaign Goal */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">What's your campaign goal?</h3>
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
                        ? 'border-blue-500 bg-blue-50' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => handleGoalSelect(goal)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          campaignData.goal?.id === goal.id ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          <goal.icon className={`h-5 w-5 ${
                            campaignData.goal?.id === goal.id ? 'text-blue-600' : 'text-gray-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{goal.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {goal.description}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {goal.targets.map((target, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {target.replace('_', ' ')}
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
                            ? 'border-blue-500 bg-blue-50'
                            : 'hover:border-gray-300'
                        }`}
                        onClick={() => setCampaignData(prev => ({ ...prev, contentType: type.id }))}
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
                <h3 className="text-xl font-semibold mb-2">Select content to boost</h3>
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
                    onChange={(e) => setCampaignData(prev => ({ ...prev, campaignName: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="campaign-description">Description (Optional)</Label>
                  <Textarea
                    id="campaign-description"
                    placeholder="Describe your campaign goals and target audience"
                    value={campaignData.campaignDescription}
                    onChange={(e) => setCampaignData(prev => ({ ...prev, campaignDescription: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label>Your Content</Label>
                <div className="space-y-3 mt-2 max-h-48 sm:max-h-60 overflow-y-auto">
                  {filteredContent.map((content) => (
                    <Card 
                      key={content.id}
                      className={`cursor-pointer transition-all ${
                        campaignData.selectedContent.some(c => c.id === content.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'hover:shadow-sm'
                      }`}
                      onClick={() => handleContentSelect(content)}
                    >
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <img
                            src={content.image}
                            alt={content.name}
                            className="w-10 sm:w-12 h-10 sm:h-12 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm sm:text-base truncate">{content.name}</h4>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                              {content.price && <span>${content.price}</span>}
                              {content.performance && (
                                <span>
                                  {content.performance.views} views
                                  {content.performance.sales && ` • ${content.performance.sales} sales`}
                                  {content.performance.inquiries && ` • ${content.performance.inquiries} inquiries`}
                                  {content.performance.likes && ` • ${content.performance.likes} likes`}
                                </span>
                              )}
                            </div>
                          </div>
                          {campaignData.selectedContent.some(c => c.id === content.id) && (
                            <CheckCircle2 className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredContent.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Monitor className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No content available for the selected goal.</p>
                    <p className="text-sm">Create some content first to start promoting it.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Audience Targeting */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">Define your audience</h3>
                <p className="text-muted-foreground">
                  Target the right people to maximize your campaign effectiveness
                </p>
              </div>

              <AudienceTargeting
                targeting={campaignData.targeting}
                onTargetingChange={(newTargeting) => {
                  setCampaignData(prev => ({ ...prev, targeting: newTargeting }));
                }}
                estimatedReach={estimatedReach}
                onEstimatedReachChange={setEstimatedReach}
              />
            </div>
          )}

          {/* Step 4: Budget & Schedule */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">Set budget & schedule</h3>
                <p className="text-muted-foreground">
                  Control your spending and campaign duration
                </p>
              </div>

              <div className="space-y-6">
                {/* Budget Type */}
                <div>
                  <Label>Budget Type</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                    <Card
                      className={`cursor-pointer transition-all ${
                        campaignData.budget.type === "daily" ? 'border-blue-500 bg-blue-50' : ''
                      }`}
                      onClick={() => setCampaignData(prev => ({
                        ...prev,
                        budget: { ...prev.budget, type: "daily" }
                      }))}
                    >
                      <CardContent className="p-3 sm:p-4 text-center">
                        <Calendar className="h-6 w-6 mx-auto mb-2" />
                        <h4 className="font-medium text-sm sm:text-base">Daily Budget</h4>
                        <p className="text-sm text-muted-foreground">
                          Spend a fixed amount each day
                        </p>
                      </CardContent>
                    </Card>

                    <Card
                      className={`cursor-pointer transition-all ${
                        campaignData.budget.type === "total" ? 'border-blue-500 bg-blue-50' : ''
                      }`}
                      onClick={() => setCampaignData(prev => ({
                        ...prev,
                        budget: { ...prev.budget, type: "total" }
                      }))}
                    >
                      <CardContent className="p-3 sm:p-4 text-center">
                        <DollarSign className="h-6 w-6 mx-auto mb-2" />
                        <h4 className="font-medium text-sm sm:text-base">Total Budget</h4>
                        <p className="text-sm text-muted-foreground">
                          Set a lifetime campaign budget
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Budget Amount */}
                <div>
                  <Label>
                    {campaignData.budget.type === "daily" ? "Daily" : "Total"} Budget Amount
                  </Label>
                  <div className="flex flex-col sm:flex-row gap-3 mt-2">
                    <div className="flex-1">
                      <Input
                        type="number"
                        min="1"
                        value={campaignData.budget.amount}
                        onChange={(e) => setCampaignData(prev => ({
                          ...prev,
                          budget: { ...prev.budget, amount: parseFloat(e.target.value) || 0 }
                        }))}
                      />
                    </div>
                    <Select
                      value={campaignData.budget.currency}
                      onValueChange={(value) => setCampaignData(prev => ({
                        ...prev,
                        budget: { ...prev.budget, currency: value }
                      }))}
                    >
                      <SelectTrigger className="w-full sm:w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="eloits">Eloits</SelectItem>
                        <SelectItem value="usdt">USDT</SelectItem>
                        <SelectItem value="wallet">Wallet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Boost Speed */}
                <div>
                  <Label>Boost Speed</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                    {[
                      { id: "slow", name: "Slow", multiplier: "0.8x cost", description: "Gradual promotion" },
                      { id: "standard", name: "Standard", multiplier: "1.0x cost", description: "Balanced approach" },
                      { id: "fast", name: "Fast", multiplier: "1.5x cost", description: "Rapid promotion" },
                    ].map((speed) => (
                      <Card
                        key={speed.id}
                        className={`cursor-pointer transition-all ${
                          campaignData.budget.boostSpeed === speed.id ? 'border-blue-500 bg-blue-50' : ''
                        }`}
                        onClick={() => setCampaignData(prev => ({ 
                          ...prev, 
                          budget: { ...prev.budget, boostSpeed: speed.id }
                        }))}
                      >
                        <CardContent className="p-2 sm:p-3 text-center">
                          <h4 className="font-medium text-sm">{speed.name}</h4>
                          <p className="text-xs text-muted-foreground">{speed.description}</p>
                          <Badge variant="outline" className="text-xs mt-1">
                            {speed.multiplier}
                          </Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Schedule */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal mt-2 text-sm",
                            !campaignData.schedule.startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {campaignData.schedule.startDate ? (
                            format(campaignData.schedule.startDate, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={campaignData.schedule.startDate}
                          onSelect={(date) => setCampaignData(prev => ({ 
                            ...prev, 
                            schedule: { ...prev.schedule, startDate: date || new Date() }
                          }))}
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label>End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal mt-2 text-sm",
                            !campaignData.schedule.endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {campaignData.schedule.endDate ? (
                            format(campaignData.schedule.endDate, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={campaignData.schedule.endDate}
                          onSelect={(date) => setCampaignData(prev => ({ 
                            ...prev, 
                            schedule: { ...prev.schedule, endDate: date || new Date() }
                          }))}
                          disabled={(date) => date <= campaignData.schedule.startDate}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Cost Summary */}
                <Card className="bg-gray-50">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-3">Campaign Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Base Cost:</span>
                        <span>${campaignData.budget.amount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Speed Modifier:</span>
                        <span>{campaignData.budget.boostSpeed === "fast" ? "1.5x" : campaignData.budget.boostSpeed === "slow" ? "0.8x" : "1.0x"}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-medium">
                        <span>Total Cost:</span>
                        <span>${calculateTotalCost().toFixed(2)} {campaignData.budget.currency.replace("_", " ").toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Estimated Reach:</span>
                        <span>{calculateEstimatedReach().toLocaleString()} people</span>
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
                <h3 className="text-xl font-semibold mb-2">Choose payment method</h3>
                <p className="text-muted-foreground">
                  Select how you want to pay for your campaign
                </p>
              </div>

              <CampaignPayment
                campaignCost={calculateTotalCost()}
                currency={campaignData.budget.currency}
                estimatedReach={estimatedReach}
                estimatedROI={250} // Mock ROI
                onPaymentSuccess={(paymentData) => {
                  setCampaignData(prev => ({
                    ...prev,
                    payment: { ...prev.payment, agreesToTerms: true, paymentData }
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

              {/* Terms and Conditions */}
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={campaignData.payment.agreesToTerms}
                  onChange={(e) => setCampaignData(prev => ({
                    ...prev,
                    payment: { ...prev.payment, agreesToTerms: e.target.checked }
                  }))}
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

        <DialogFooter className="flex flex-col sm:flex-row justify-between gap-3">
          <div className="flex gap-2 order-2 sm:order-1">
            {currentStep > 1 && (
              <Button variant="outline" onClick={prevStep} className="flex-1 sm:flex-none">
                <ChevronLeft className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">Back</span>
              </Button>
            )}
          </div>

          <div className="flex gap-2 order-1 sm:order-2">
            <Button variant="outline" onClick={onClose} className="flex-1 sm:flex-none">
              Cancel
            </Button>

            {currentStep < totalSteps ? (
              <Button onClick={nextStep} className="flex-1 sm:flex-none">
                <span className="hidden sm:inline">Next</span>
                <span className="sm:hidden">Next</span>
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleCreateCampaign}
                disabled={!campaignData.payment.agreesToTerms}
                className="flex-1 sm:flex-none"
              >
                <span className="hidden sm:inline">Create Campaign</span>
                <span className="sm:hidden">Create</span>
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CampaignCreationWizard;
