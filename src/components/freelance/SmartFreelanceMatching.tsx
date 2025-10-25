// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  Target,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  Star,
  Zap,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Filter,
  RefreshCw,
  Lightbulb,
  Shield,
} from "lucide-react";
import { FreelancerProfile, JobPosting, Project } from "@/types/freelance";
import { useToast } from "@/components/ui/use-toast";
import { freelanceMatchingService } from "@/services/freelanceMatchingService";
import { useAuth } from "@/contexts/AuthContext";

interface CompatibilityScore {
  overall: number;
  skillMatch: number;
  experienceLevel: number;
  budgetAlignment: number;
  availability: number;
  communicationStyle: number;
  pastSuccess: number;
}

interface TalentSuggestion {
  freelancer: FreelancerProfile;
  compatibility: CompatibilityScore;
  predictedSuccess: number;
  reasonsToHire: string[];
  potentialConcerns: string[];
  recommendedBudget: { min: number; max: number };
}

interface ProjectSuccessPredictor {
  projectId: string;
  successProbability: number;
  riskFactors: Array<{
    factor: string;
    impact: "low" | "medium" | "high";
    mitigation: string;
  }>;
  recommendations: string[];
}

interface SkillGapAnalysis {
  missingSkills: string[];
  suggestedTeamMembers: Array<{
    role: string;
    skills: string[];
    estimatedCost: number;
    urgency: "low" | "medium" | "high";
  }>;
  alternativeApproaches: string[];
}

interface BudgetOptimization {
  currentBudget: number;
  optimizedBudget: { min: number; max: number };
  costBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  savings: number;
  recommendations: string[];
}

export const SmartFreelanceMatching: React.FC<{
  jobPosting?: JobPosting;
  projectId?: string;
  userType: "client" | "freelancer";
}> = ({ jobPosting, projectId, userType }) => {
  const [loading, setLoading] = useState(false);
  const [talentSuggestions, setTalentSuggestions] = useState<
    TalentSuggestion[]
  >([]);
  const [successPredictor, setSuccessPredictor] =
    useState<ProjectSuccessPredictor | null>(null);
  const [skillGapAnalysis, setSkillGapAnalysis] =
    useState<SkillGapAnalysis | null>(null);
  const [budgetOptimization, setBudgetOptimization] =
    useState<BudgetOptimization | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (jobPosting || projectId) {
      loadSmartRecommendations();
    }
  }, [jobPosting, projectId]);

  const loadSmartRecommendations = async () => {
    setLoading(true);
    try {
      // Fetch real data from services
      let talentData: TalentSuggestion[] = [];
      let successData: ProjectSuccessPredictor | null = null;
      let skillGapData: SkillGapAnalysis | null = null;
      let budgetData: BudgetOptimization | null = null;

      if (userType === "client" && jobPosting) {
        // For clients, get talent suggestions for their job posting
        talentData = await freelanceMatchingService.getTalentSuggestions(jobPosting.id);
        successData = await freelanceMatchingService.getProjectSuccessPrediction(jobPosting.id);
        skillGapData = await freelanceMatchingService.getSkillGapAnalysis(jobPosting.id);
        budgetData = await freelanceMatchingService.getBudgetOptimization(jobPosting.id);
      } else if (userType === "freelancer" && projectId) {
        // For freelancers, get project success prediction and skill gap analysis
        successData = await freelanceMatchingService.getProjectSuccessPrediction(projectId);
        skillGapData = await freelanceMatchingService.getSkillGapAnalysis(projectId);
        budgetData = await freelanceMatchingService.getBudgetOptimization(projectId);
      }

      setTalentSuggestions(talentData);
      setSuccessPredictor(successData);
      setSkillGapAnalysis(skillGapData);
      setBudgetOptimization(budgetData);
    } catch (error) {
      console.error("Error loading recommendations:", error);
      toast({
        title: "Error loading recommendations",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-50";
    if (score >= 80) return "text-blue-600 bg-blue-50";
    if (score >= 70) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getRiskColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "text-red-600 bg-red-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "low":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            Smart Matching & Recommendations
          </h2>
          <p className="text-muted-foreground">
            AI-powered insights for better project outcomes
          </p>
        </div>
        <Button onClick={loadSmartRecommendations} disabled={loading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="talent" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1">
          <TabsTrigger value="talent" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Talent Matching</span>
            <span className="sm:hidden">Talent</span>
          </TabsTrigger>
          <TabsTrigger value="success" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Success Predictor</span>
            <span className="sm:hidden">Success</span>
          </TabsTrigger>
          <TabsTrigger value="skills" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Skill Gap Analysis</span>
            <span className="sm:hidden">Skills</span>
          </TabsTrigger>
          <TabsTrigger value="budget" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Budget Optimization</span>
            <span className="sm:hidden">Budget</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="talent" className="space-y-4">
          <div className="grid grid-cols-1 gap-6">
            {talentSuggestions.map((suggestion, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={suggestion.freelancer.avatar_url} />
                        <AvatarFallback>
                          {suggestion.freelancer.full_name?.[0] || suggestion.freelancer.username?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-xl font-semibold">
                          {suggestion.freelancer.full_name || suggestion.freelancer.username}
                        </h3>
                        <p className="text-muted-foreground">
                          {suggestion.freelancer.title}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">
                              {suggestion.freelancer.rating}
                            </span>
                          </div>
                          <Badge variant="outline">
                            ${suggestion.freelancer.hourly_rate}/hr
                          </Badge>
                          <Badge variant="secondary">
                            {suggestion.freelancer.completed_projects} jobs
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCompatibilityColor(suggestion.compatibility.overall)}`}
                      >
                        <Target className="h-4 w-4 mr-1" />
                        {suggestion.compatibility.overall}% Match
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {suggestion.predictedSuccess}% Success Rate
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Compatibility Breakdown */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Skills</span>
                        <span className="font-medium">
                          {suggestion.compatibility.skillMatch}%
                        </span>
                      </div>
                      <Progress
                        value={suggestion.compatibility.skillMatch}
                        className="h-2"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Experience</span>
                        <span className="font-medium">
                          {suggestion.compatibility.experienceLevel}%
                        </span>
                      </div>
                      <Progress
                        value={suggestion.compatibility.experienceLevel}
                        className="h-2"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Budget</span>
                        <span className="font-medium">
                          {suggestion.compatibility.budgetAlignment}%
                        </span>
                      </div>
                      <Progress
                        value={suggestion.compatibility.budgetAlignment}
                        className="h-2"
                      />
                    </div>
                  </div>

                  {/* Reasons to Hire */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-green-700 mb-2 flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        Reasons to Hire
                      </h4>
                      <ul className="space-y-1 text-sm">
                        {suggestion.reasonsToHire.map((reason, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <div className="w-1 h-1 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-yellow-700 mb-2 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        Considerations
                      </h4>
                      <ul className="space-y-1 text-sm">
                        {suggestion.potentialConcerns.map((concern, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <div className="w-1 h-1 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                            {concern}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Recommended Budget */}
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <span className="text-sm font-medium text-blue-700">
                        Recommended Rate Range
                      </span>
                      <div className="text-lg font-bold text-blue-800">
                        ${suggestion.recommendedBudget.min} - $
                        {suggestion.recommendedBudget.max}/hr
                      </div>
                    </div>
                    <Button>
                      Invite to Apply
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="success" className="space-y-4">
          {successPredictor && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Success Probability
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      {successPredictor.successProbability}%
                    </div>
                    <p className="text-muted-foreground">
                      Likelihood of successful project completion
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium">Key Recommendations</h4>
                    {successPredictor.recommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{rec}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-red-600" />
                    Risk Factors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {successPredictor.riskFactors.map((risk, i) => (
                      <div key={i} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{risk.factor}</span>
                          <Badge className={getRiskColor(risk.impact)}>
                            {risk.impact} impact
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          <strong>Mitigation:</strong> {risk.mitigation}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="skills" className="space-y-4">
          {skillGapAnalysis && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Suggested Team Members
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {skillGapAnalysis.suggestedTeamMembers.map((member, i) => (
                      <div key={i} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{member.role}</h4>
                          <div className="text-right">
                            <div className="font-bold">
                              ${member.estimatedCost.toLocaleString()}
                            </div>
                            <Badge
                              variant={
                                member.urgency === "high"
                                  ? "destructive"
                                  : member.urgency === "medium"
                                    ? "default"
                                    : "secondary"
                              }
                            >
                              {member.urgency} priority
                            </Badge>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {member.skills.map((skill, j) => (
                            <Badge
                              key={j}
                              variant="outline"
                              className="text-xs"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Alternative Approaches</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Missing Skills</h4>
                      <div className="flex flex-wrap gap-1">
                        {skillGapAnalysis.missingSkills.map((skill, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="text-red-600 border-red-200"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Alternatives</h4>
                      {skillGapAnalysis.alternativeApproaches.map(
                        (approach, i) => (
                          <div key={i} className="flex items-start gap-2 mb-2">
                            <Zap className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{approach}</span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="budget" className="space-y-4">
          {budgetOptimization && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    Budget Optimization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">
                          ${budgetOptimization.currentBudget.toLocaleString()}
                        </div>
                        <div className="text-sm text-red-700">
                          Current Budget
                        </div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          $
                          {budgetOptimization.optimizedBudget.min.toLocaleString()}{" "}
                          - $
                          {budgetOptimization.optimizedBudget.max.toLocaleString()}
                        </div>
                        <div className="text-sm text-green-700">
                          Optimized Range
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-blue-50 rounded-lg text-center">
                      <div className="text-xl font-bold text-blue-600">
                        ${budgetOptimization.savings.toLocaleString()} Potential
                        Savings
                      </div>
                      <div className="text-sm text-blue-700">
                        {Math.round(
                          (budgetOptimization.savings /
                            budgetOptimization.currentBudget) *
                            100,
                        )}
                        % cost reduction
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cost Breakdown & Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-3">Budget Allocation</h4>
                      {budgetOptimization.costBreakdown.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between mb-2"
                        >
                          <span className="text-sm">{item.category}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              ${item.amount.toLocaleString()} ({item.percentage}
                              %)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Optimization Tips</h4>
                      {budgetOptimization.recommendations.map((rec, i) => (
                        <div key={i} className="flex items-start gap-2 mb-2">
                          <DollarSign className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};