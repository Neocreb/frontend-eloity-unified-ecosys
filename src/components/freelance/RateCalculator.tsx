// @ts-nocheck
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  BarChart3, 
  DollarSign, 
  TrendingUp, 
  Calculator,
  Info,
  Star,
  Clock,
  Target
} from "lucide-react";

interface RateCalculatorProps {
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
}

const RateCalculator: React.FC<RateCalculatorProps> = ({ 
  trigger,
  isOpen: controlledOpen,
  onClose 
}) => {
  const [open, setOpen] = useState(false);
  const [experience, setExperience] = useState<string>("");
  const [skill, setSkill] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [projectType, setProjectType] = useState<string>("");
  const [timeframe, setTimeframe] = useState<string>("");
  const [customHours, setCustomHours] = useState<number>(40);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : open;

  const handleClose = () => {
    if (isControlled && onClose) {
      onClose();
    } else {
      setOpen(false);
    }
  };

  const calculateRates = () => {
    // Base rates by experience level
    const baseRates: Record<string, number> = {
      "entry": 15,
      "intermediate": 35,
      "advanced": 65,
      "expert": 100,
    };

    // Skill multipliers
    const skillMultipliers: Record<string, number> = {
      "web-development": 1.0,
      "mobile-development": 1.2,
      "data-science": 1.4,
      "ai-ml": 1.5,
      "blockchain": 1.6,
      "design": 0.8,
      "writing": 0.6,
      "marketing": 0.7,
    };

    // Location multipliers
    const locationMultipliers: Record<string, number> = {
      "north-america": 1.0,
      "europe": 0.9,
      "asia": 0.6,
      "south-america": 0.5,
      "africa": 0.4,
      "oceania": 1.1,
    };

    // Project type multipliers
    const projectMultipliers: Record<string, number> = {
      "short-term": 1.2,
      "long-term": 0.9,
      "urgent": 1.5,
      "research": 1.1,
      "maintenance": 0.8,
    };

    const baseRate = baseRates[experience] || 25;
    const skillMultiplier = skillMultipliers[skill] || 1.0;
    const locationMultiplier = locationMultipliers[location] || 1.0;
    const projectMultiplier = projectMultipliers[projectType] || 1.0;

    const hourlyRate = Math.round(baseRate * skillMultiplier * locationMultiplier * projectMultiplier);
    
    return {
      hourly: hourlyRate,
      daily: hourlyRate * 8,
      weekly: hourlyRate * 40,
      monthly: hourlyRate * 160,
      project: hourlyRate * customHours,
    };
  };

  const rates = calculateRates();

  const getMarketInsights = () => {
    const insights = [];
    
    if (experience === "entry") {
      insights.push("Consider building a portfolio to justify higher rates");
      insights.push("Focus on gaining certifications in your skill area");
    }
    
    if (skill === "ai-ml" || skill === "blockchain") {
      insights.push("High-demand skills can command premium rates");
      insights.push("Consider specializing in emerging technologies");
    }
    
    if (projectType === "urgent") {
      insights.push("Rush projects typically pay 50% more");
      insights.push("Ensure you can deliver quality under pressure");
    }

    return insights;
  };

  const content = (
    <div className="space-y-6">
      {/* Input Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="experience">Experience Level</Label>
          <Select value={experience} onValueChange={setExperience}>
            <SelectTrigger>
              <SelectValue placeholder="Select experience" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
              <SelectItem value="intermediate">Intermediate (3-5 years)</SelectItem>
              <SelectItem value="advanced">Advanced (6-10 years)</SelectItem>
              <SelectItem value="expert">Expert (10+ years)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="skill">Primary Skill</Label>
          <Select value={skill} onValueChange={setSkill}>
            <SelectTrigger>
              <SelectValue placeholder="Select skill" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="web-development">Web Development</SelectItem>
              <SelectItem value="mobile-development">Mobile Development</SelectItem>
              <SelectItem value="data-science">Data Science</SelectItem>
              <SelectItem value="ai-ml">AI/Machine Learning</SelectItem>
              <SelectItem value="blockchain">Blockchain</SelectItem>
              <SelectItem value="design">UI/UX Design</SelectItem>
              <SelectItem value="writing">Content Writing</SelectItem>
              <SelectItem value="marketing">Digital Marketing</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="location">Market Region</Label>
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger>
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="north-america">North America</SelectItem>
              <SelectItem value="europe">Europe</SelectItem>
              <SelectItem value="asia">Asia</SelectItem>
              <SelectItem value="south-america">South America</SelectItem>
              <SelectItem value="africa">Africa</SelectItem>
              <SelectItem value="oceania">Oceania</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="projectType">Project Type</Label>
          <Select value={projectType} onValueChange={setProjectType}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="short-term">Short-term (&lt; 1 month)</SelectItem>
              <SelectItem value="long-term">Long-term (3+ months)</SelectItem>
              <SelectItem value="urgent">Urgent/Rush</SelectItem>
              <SelectItem value="research">Research/Discovery</SelectItem>
              <SelectItem value="maintenance">Maintenance/Support</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="hours">Custom Project Hours</Label>
        <Input
          type="number"
          value={customHours}
          onChange={(e) => setCustomHours(Number(e.target.value))}
          placeholder="e.g., 40"
          min="1"
          max="1000"
        />
      </div>

      {/* Results */}
      {experience && skill && location && projectType && (
        <Tabs defaultValue="rates" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="rates">Calculated Rates</TabsTrigger>
            <TabsTrigger value="insights">Market Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="rates" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Hourly
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${rates.hourly}</div>
                  <p className="text-xs text-muted-foreground">per hour</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Daily
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${rates.daily}</div>
                  <p className="text-xs text-muted-foreground">8 hours</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Weekly
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${rates.weekly}</div>
                  <p className="text-xs text-muted-foreground">40 hours</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Monthly
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${rates.monthly}</div>
                  <p className="text-xs text-muted-foreground">160 hours</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Project
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${rates.project}</div>
                  <p className="text-xs text-muted-foreground">{customHours} hours</p>
                </CardContent>
              </Card>

              <Card className="border-primary bg-primary/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Star className="w-4 h-4 text-primary" />
                    Recommended
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">${rates.hourly}</div>
                  <p className="text-xs text-muted-foreground">hourly rate</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">Rate Calculation</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                      Rates are calculated based on experience level, skill demand, regional market conditions, 
                      and project type. These are market estimates and should be adjusted based on your specific 
                      situation and client requirements.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Market Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {getMarketInsights().map((insight, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                    <p className="text-sm">{insight}</p>
                  </div>
                ))}
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-green-700 dark:text-green-200">
                    <strong>Tip:</strong> Always research specific client budgets and adjust your rates 
                    accordingly. Consider offering package deals for long-term projects.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );

  if (isControlled) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Freelance Rate Calculator
            </DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="w-full justify-start">
            <BarChart3 className="w-4 h-4 mr-2" />
            Rate Calculator
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Freelance Rate Calculator
          </DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
};

export default RateCalculator;
