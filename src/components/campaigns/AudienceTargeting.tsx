import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
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
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  MapPin,
  Users,
  Heart,
  Smartphone,
  Monitor,
  Tablet,
  Clock,
  DollarSign,
  Target,
  TrendingUp,
  Brain,
  Filter,
  Globe,
  User,
  Briefcase,
  GraduationCap,
  Star,
  Activity,
  Eye,
  Info,
  Settings,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface AudienceTargetingProps {
  targeting: {
    locations: string[];
    interests: string[];
    ageGroups: string[];
    gender: string;
    deviceTypes: string[];
    languages: string[];
    incomeLevel: string;
    education: string;
    employmentStatus: string;
    relationshipStatus: string;
    behaviors: string[];
    customAudiences: string[];
  };
  onTargetingChange: (targeting: any) => void;
  estimatedReach: number;
  onEstimatedReachChange: (reach: number) => void;
}

// Enhanced targeting options
const LOCATIONS = [
  { id: "ng", name: "Nigeria", flag: "🇳🇬", population: 200000000 },
  { id: "gh", name: "Ghana", flag: "🇬🇭", population: 30000000 },
  { id: "ke", name: "Kenya", flag: "🇰🇪", population: 50000000 },
  { id: "za", name: "South Africa", flag: "🇿🇦", population: 58000000 },
  { id: "us", name: "United States", flag: "🇺🇸", population: 330000000 },
  { id: "uk", name: "United Kingdom", flag: "🇬🇧", population: 67000000 },
  { id: "ca", name: "Canada", flag: "🇨🇦", population: 38000000 },
  { id: "worldwide", name: "Worldwide", flag: "🌍", population: 5000000000 },
];

const INTERESTS = [
  { id: "freelance", name: "Freelancing", category: "Work", userCount: 2500000 },
  { id: "crypto", name: "Cryptocurrency", category: "Finance", userCount: 1800000 },
  { id: "ecommerce", name: "E-commerce", category: "Business", userCount: 3200000 },
  { id: "technology", name: "Technology", category: "Tech", userCount: 4100000 },
  { id: "design", name: "Design", category: "Creative", userCount: 1900000 },
  { id: "marketing", name: "Digital Marketing", category: "Business", userCount: 2800000 },
  { id: "entertainment", name: "Entertainment", category: "Lifestyle", userCount: 5200000 },
  { id: "education", name: "Education", category: "Learning", userCount: 3600000 },
  { id: "health", name: "Health & Fitness", category: "Lifestyle", userCount: 2100000 },
  { id: "travel", name: "Travel", category: "Lifestyle", userCount: 1700000 },
  { id: "food", name: "Food & Cooking", category: "Lifestyle", userCount: 2400000 },
  { id: "gaming", name: "Gaming", category: "Entertainment", userCount: 3800000 },
];

const BEHAVIORS = [
  { id: "frequent_buyer", name: "Frequent Online Buyers", description: "Users who make purchases regularly" },
  { id: "social_sharer", name: "Social Media Sharers", description: "Active on social platforms" },
  { id: "early_adopter", name: "Early Technology Adopters", description: "First to try new tech" },
  { id: "price_conscious", name: "Price-Conscious Shoppers", description: "Look for deals and discounts" },
  { id: "brand_loyal", name: "Brand Loyal", description: "Stick to preferred brands" },
  { id: "mobile_heavy", name: "Mobile-Heavy Users", description: "Primarily use mobile devices" },
  { id: "video_consumer", name: "Video Content Consumers", description: "Watch videos frequently" },
  { id: "night_owl", name: "Night Time Users", description: "Most active during evenings" },
];

const AGE_GROUPS = [
  { id: "13-17", name: "13-17 years", userCount: 180000 },
  { id: "18-24", name: "18-24 years", userCount: 850000 },
  { id: "25-34", name: "25-34 years", userCount: 1200000 },
  { id: "35-44", name: "35-44 years", userCount: 950000 },
  { id: "45-54", name: "45-54 years", userCount: 680000 },
  { id: "55-64", name: "55-64 years", userCount: 420000 },
  { id: "65+", name: "65+ years", userCount: 320000 },
];

const LANGUAGES = [
  { id: "en", name: "English", nativeName: "English" },
  { id: "fr", name: "French", nativeName: "Français" },
  { id: "es", name: "Spanish", nativeName: "Español" },
  { id: "ar", name: "Arabic", nativeName: "العربية" },
  { id: "sw", name: "Swahili", nativeName: "Kiswahili" },
  { id: "yo", name: "Yoruba", nativeName: "Yorùbá" },
  { id: "ha", name: "Hausa", nativeName: "Hausa" },
  { id: "ig", name: "Igbo", nativeName: "Igbo" },
];

const AudienceTargeting: React.FC<AudienceTargetingProps> = ({
  targeting,
  onTargetingChange,
  estimatedReach,
  onEstimatedReachChange,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedAgeRange, setSelectedAgeRange] = useState([18, 65]);

  const updateTargeting = (field: string, value: any) => {
    const newTargeting = { ...targeting, [field]: value };
    onTargetingChange(newTargeting);
    
    // Recalculate estimated reach
    calculateEstimatedReach(newTargeting);
  };

  const toggleArrayItem = (field: string, item: string) => {
    const currentArray = targeting[field as keyof typeof targeting] as string[];
    const newArray = currentArray.includes(item)
      ? currentArray.filter((i) => i !== item)
      : [...currentArray, item];
    updateTargeting(field, newArray);
  };

  const calculateEstimatedReach = (targetingData: any) => {
    let baseReach = 100000; // Base reach

    // Location multiplier
    if (targetingData.locations.includes("worldwide")) {
      baseReach *= 50;
    } else {
      const locationReach = targetingData.locations.reduce((sum: number, locationId: string) => {
        const location = LOCATIONS.find(l => l.id === locationId);
        return sum + (location ? location.population * 0.1 : 0); // 10% of population
      }, 0);
      baseReach = Math.max(baseReach, locationReach * 0.001);
    }

    // Interest multiplier
    if (targetingData.interests.length > 0) {
      baseReach *= (0.3 + (targetingData.interests.length * 0.1));
    }

    // Age group multiplier
    if (targetingData.ageGroups.length > 0) {
      baseReach *= (0.5 + (targetingData.ageGroups.length * 0.1));
    }

    // Behavior multiplier
    if (targetingData.behaviors.length > 0) {
      baseReach *= (0.7 + (targetingData.behaviors.length * 0.05));
    }

    // Apply constraints for very specific targeting
    if (targetingData.interests.length > 5 || targetingData.behaviors.length > 3) {
      baseReach *= 0.6; // Reduce for over-targeting
    }

    onEstimatedReachChange(Math.round(baseReach));
  };

  const getTargetingSpecificity = () => {
    const factors = [
      targeting.locations.length > 0,
      targeting.interests.length > 0,
      targeting.ageGroups.length > 0,
      targeting.behaviors.length > 0,
      targeting.gender !== "all",
      targeting.deviceTypes.length > 0,
    ].filter(Boolean).length;

    if (factors <= 2) return { level: "Broad", color: "text-green-600", description: "Maximum reach" };
    if (factors <= 4) return { level: "Balanced", color: "text-blue-600", description: "Good balance" };
    return { level: "Specific", color: "text-orange-600", description: "Highly targeted" };
  };

  const specificity = getTargetingSpecificity();

  return (
    <div className="space-y-6">
      {/* Targeting Overview */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-lg">Estimated Reach</h3>
              <p className="text-xl sm:text-2xl font-bold text-blue-600">
                {estimatedReach.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">people might see your campaign</p>
            </div>
            <div className="text-left sm:text-right">
              <Badge className={specificity.color}>
                {specificity.level} Targeting
              </Badge>
              <p className="text-sm text-muted-foreground mt-1">
                {specificity.description}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Targeting */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            <h3 className="font-semibold">Location Targeting</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {LOCATIONS.map((location) => (
                <div
                  key={location.id}
                  className={`p-2 sm:p-3 border rounded-lg cursor-pointer transition-all text-center ${
                    targeting.locations.includes(location.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'hover:border-gray-300'
                  }`}
                  onClick={() => toggleArrayItem('locations', location.id)}
                >
                  <div className="text-base sm:text-lg mb-1">{location.flag}</div>
                  <div className="text-xs sm:text-sm font-medium">{location.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {(location.population / 1000000).toFixed(0)}M people
                  </div>
                </div>
              ))}
            </div>
            
            {targeting.locations.length > 0 && (
              <div className="mt-3">
                <p className="text-sm text-muted-foreground mb-2">Selected locations:</p>
                <div className="flex flex-wrap gap-2">
                  {targeting.locations.map((locationId) => {
                    const location = LOCATIONS.find(l => l.id === locationId);
                    return location ? (
                      <Badge key={locationId} variant="outline">
                        {location.flag} {location.name}
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Interest Targeting */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            <h3 className="font-semibold">Interests & Categories</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {INTERESTS.map((interest) => (
                <div
                  key={interest.id}
                  className={`p-2 sm:p-3 border rounded-lg cursor-pointer transition-all ${
                    targeting.interests.includes(interest.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'hover:border-gray-300'
                  }`}
                  onClick={() => toggleArrayItem('interests', interest.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">{interest.name}</div>
                      <div className="text-xs text-muted-foreground">{interest.category}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {(interest.userCount / 1000000).toFixed(1)}M
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {targeting.interests.length > 0 && (
              <div className="mt-3">
                <p className="text-sm text-muted-foreground mb-2">Selected interests:</p>
                <div className="flex flex-wrap gap-2">
                  {targeting.interests.map((interestId) => {
                    const interest = INTERESTS.find(i => i.id === interestId);
                    return interest ? (
                      <Badge key={interestId} variant="outline">
                        {interest.name}
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Demographics */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <h3 className="font-semibold">Demographics</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Age Groups */}
            <div>
              <Label className="text-sm font-medium">Age Groups</Label>
              <div className="space-y-2 mt-2">
                {AGE_GROUPS.map((age) => (
                  <label key={age.id} className="flex items-center justify-between cursor-pointer p-2 hover:bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={targeting.ageGroups.includes(age.id)}
                        onChange={() => toggleArrayItem('ageGroups', age.id)}
                        className="rounded"
                      />
                      <span className="text-sm">{age.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {(age.userCount / 1000).toFixed(0)}K
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Gender */}
            <div>
              <Label className="text-sm font-medium">Gender</Label>
              <Select
                value={targeting.gender}
                onValueChange={(value) => updateTargeting('gender', value)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All genders</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>

              {/* Languages */}
              <div className="mt-4">
                <Label className="text-sm font-medium">Languages</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {LANGUAGES.slice(0, 4).map((language) => (
                    <label key={language.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={targeting.languages.includes(language.id)}
                        onChange={() => toggleArrayItem('languages', language.id)}
                        className="rounded"
                      />
                      <span className="text-sm">{language.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Device Targeting */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            <h3 className="font-semibold">Device Targeting</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { id: "mobile", name: "Mobile", icon: Smartphone, usage: "68%" },
              { id: "desktop", name: "Desktop", icon: Monitor, usage: "25%" },
              { id: "tablet", name: "Tablet", icon: Tablet, usage: "7%" },
            ].map((device) => (
              <div
                key={device.id}
                className={`p-3 sm:p-4 border rounded-lg cursor-pointer transition-all text-center ${
                  targeting.deviceTypes.includes(device.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'hover:border-gray-300'
                }`}
                onClick={() => toggleArrayItem('deviceTypes', device.id)}
              >
                <device.icon className="h-6 sm:h-8 w-6 sm:w-8 mx-auto mb-2" />
                <div className="font-medium text-sm sm:text-base">{device.name}</div>
                <div className="text-xs text-muted-foreground">{device.usage} of users</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Targeting (Collapsible) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              <h3 className="font-semibold">Advanced Targeting</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <Settings className="h-4 w-4 mr-2" />
              {showAdvanced ? 'Hide' : 'Show'} Advanced
            </Button>
          </div>
        </CardHeader>
        
        {showAdvanced && (
          <CardContent>
            <div className="space-y-6">
              {/* Behavioral Targeting */}
              <div>
                <Label className="text-sm font-medium">User Behaviors</Label>
                <div className="space-y-2 mt-2">
                  {BEHAVIORS.map((behavior) => (
                    <label key={behavior.id} className="flex items-start gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        checked={targeting.behaviors.includes(behavior.id)}
                        onChange={() => toggleArrayItem('behaviors', behavior.id)}
                        className="rounded mt-1"
                      />
                      <div>
                        <div className="text-sm font-medium">{behavior.name}</div>
                        <div className="text-xs text-muted-foreground">{behavior.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Income Level */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium">Income Level</Label>
                  <Select
                    value={targeting.incomeLevel}
                    onValueChange={(value) => updateTargeting('incomeLevel', value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Any income level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any income level</SelectItem>
                      <SelectItem value="low">Lower income</SelectItem>
                      <SelectItem value="middle">Middle income</SelectItem>
                      <SelectItem value="high">Higher income</SelectItem>
                      <SelectItem value="luxury">Luxury consumers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Education</Label>
                  <Select
                    value={targeting.education}
                    onValueChange={(value) => updateTargeting('education', value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Any education level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any education level</SelectItem>
                      <SelectItem value="high_school">High school</SelectItem>
                      <SelectItem value="college">College</SelectItem>
                      <SelectItem value="graduate">Graduate degree</SelectItem>
                      <SelectItem value="professional">Professional degree</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Employment Status */}
              <div>
                <Label className="text-sm font-medium">Employment Status</Label>
                <Select
                  value={targeting.employmentStatus}
                  onValueChange={(value) => updateTargeting('employmentStatus', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Any employment status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any employment status</SelectItem>
                    <SelectItem value="employed">Employed full-time</SelectItem>
                    <SelectItem value="self_employed">Self-employed</SelectItem>
                    <SelectItem value="freelancer">Freelancer</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="unemployed">Unemployed</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Targeting Summary */}
      <Card className="bg-gray-50">
        <CardHeader>
          <h3 className="font-semibold">Targeting Summary</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Estimated Reach:</span>
              <span className="font-semibold">{estimatedReach.toLocaleString()} people</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Targeting Specificity:</span>
              <Badge className={specificity.color}>{specificity.level}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Selected Criteria:</span>
              <span className="text-sm text-muted-foreground">
                {[
                  targeting.locations.length > 0 && `${targeting.locations.length} locations`,
                  targeting.interests.length > 0 && `${targeting.interests.length} interests`,
                  targeting.ageGroups.length > 0 && `${targeting.ageGroups.length} age groups`,
                  targeting.behaviors.length > 0 && `${targeting.behaviors.length} behaviors`,
                ].filter(Boolean).join(', ') || 'None selected'}
              </span>
            </div>
            <Progress value={Math.min(100, (estimatedReach / 1000000) * 100)} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {estimatedReach < 10000 && "Consider broadening your targeting for better reach"}
              {estimatedReach > 5000000 && "Consider narrowing your targeting for better efficiency"}
              {estimatedReach >= 10000 && estimatedReach <= 5000000 && "Good targeting balance for effective campaigns"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AudienceTargeting;
