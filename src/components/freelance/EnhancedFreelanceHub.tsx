// @ts-nocheck
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Briefcase,
  TrendingUp,
  DollarSign,
  Clock,
  Users,
  Search,
  Star,
  Award,
  Plus,
  Bell,
  Settings,
  Grid3x3,
  List,
  MapPin,
  Calendar,
  Zap,
  TrendingDown,
  Eye,
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  ChevronRight,
  BarChart3,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  FileText,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Crown,
  Shield,
  Globe,
  Coffee,
} from "lucide-react";
import { JobPosting } from "@/types/freelance";
import JobList from "./JobList";
import JobDetails from "./JobDetails";
import TalentsList, { Talent } from "./TalentsList";
import TalentProfile from "./TalentProfile";
import { useFreelance } from "@/hooks/use-freelance";
import { useAuth } from "@/contexts/AuthContext";
import CompactFreelanceFilters from "./CompactFreelanceFilters";

export const EnhancedFreelanceHub: React.FC = () => {
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [selectedTalent, setSelectedTalent] = useState<Talent | null>(null);
  const [activeTab, setActiveTab] = useState("browse");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleJobSelect = (job: JobPosting) => {
    setSelectedJob(job);
  };

  const handleTalentSelect = (talent: Talent) => {
    setSelectedTalent(talent);
  };

  const handleBack = () => {
    setSelectedJob(null);
    setSelectedTalent(null);
  };

  const handleApply = (jobId: string) => {
    setSelectedJob(null);
    setActiveTab("proposals");
  };

  const handleHire = (talentId: string) => {
    setSelectedTalent(null);
  };

  // Enhanced stats with trending indicators
  const stats = {
    activeJobs: { value: 1247, change: +12, trend: "up" },
    newToday: { value: 23, change: +3, trend: "up" },
    avgBudget: { value: 2850, change: +150, trend: "up" },
    successRate: { value: 94, change: +2, trend: "up" },
  };


  const trendingCategories = [
    { name: "AI/ML Development", jobs: 234, growth: "+23%" },
    { name: "Mobile Apps", jobs: 189, growth: "+18%" },
    { name: "Web Design", jobs: 156, growth: "+15%" },
    { name: "Content Writing", jobs: 143, growth: "+12%" },
    { name: "Data Analysis", jobs: 98, growth: "+28%" },
  ];

  const recentActivity = [
    {
      type: "application",
      title: "Applied to React Developer position",
      time: "2 hours ago",
      status: "pending",
    },
    {
      type: "message",
      title: "New message from TechCorp Inc.",
      time: "4 hours ago",
      status: "unread",
    },
    {
      type: "job",
      title: "New job matches your profile",
      time: "6 hours ago",
      status: "new",
    },
  ];

  const RenderTabs = () => (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="flex items-center justify-between mb-6">
        <TabsList className="bg-white border shadow-sm h-auto flex-wrap sm:h-12 w-full justify-start">
          <TabsTrigger value="browse" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 px-3 sm:px-6 flex-shrink-0">
            <Briefcase className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Jobs</span>
            <span className="sm:hidden">Jobs</span>
          </TabsTrigger>
          <TabsTrigger value="talents" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700 px-3 sm:px-6 flex-shrink-0">
            <Users className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Talent</span>
            <span className="sm:hidden">Talent</span>
          </TabsTrigger>
          <TabsTrigger value="proposals" className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 px-3 sm:px-6 flex-shrink-0">
            <FileText className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Props</span>
            <span className="sm:hidden">Props</span>
          </TabsTrigger>
          <TabsTrigger value="saved" className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 px-3 sm:px-6 flex-shrink-0">
            <Bookmark className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Saved</span>
            <span className="sm:hidden">Saved</span>
          </TabsTrigger>
        </TabsList>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="flex items-center bg-white border rounded-lg shadow-sm">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none h-8 w-8 p-0"
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none h-8 w-8 p-0"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          <Button size="sm" className="shadow-sm h-8">
            <RefreshCw className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      <TabsContent value="browse" className="space-y-6">
        <JobList
          onJobSelect={handleJobSelect}
          viewMode={viewMode}
          searchQuery={searchQuery}
        />
      </TabsContent>

      <TabsContent value="talents" className="space-y-6">
        <TalentsList
          onTalentSelect={handleTalentSelect}
          viewMode={viewMode}
          searchQuery={searchQuery}
        />
      </TabsContent>

      <TabsContent value="proposals" className="space-y-6">
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Your Proposals
          </h3>
          <p className="text-gray-600 mb-6">
            Track your job applications and their status
          </p>
          <Button onClick={() => setActiveTab("browse")}>
            Browse Jobs to Apply
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="saved" className="space-y-6">
        <div className="text-center py-12">
          <Bookmark className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Saved Jobs & Talents
          </h3>
          <p className="text-gray-600 mb-6">
            Your bookmarked opportunities and favorite freelancers
          </p>
          <Button onClick={() => setActiveTab("browse")}>
            Discover More Opportunities
          </Button>
        </div>
      </TabsContent>

    </Tabs>
  );

  // Show job details modal
  if (selectedJob) {
    return (
      <div className="min-h-screen bg-gray-50">
        <JobDetails
          job={selectedJob}
          onBack={handleBack}
          onApply={handleApply}
        />
      </div>
    );
  }

  // Show talent profile modal
  if (selectedTalent) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TalentProfile
          talent={selectedTalent}
          onBack={handleBack}
          onHire={handleHire}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header Section */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                <Briefcase className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </div>
              <h1 className="text-xl sm:text-3xl font-bold text-gray-900 truncate">Freelance Hub</h1>
              <Badge variant="secondary" className="bg-green-100 text-green-800 flex-shrink-0">
                <Activity className="w-3 h-3 mr-1" /> Live
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="shadow-sm" size="sm">
                    <Plus className="w-4 h-4 mr-2" /> Post
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Post</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => navigate("/app/freelance/post-job")}>Post Job</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/app/freelance/post-skill")}>Post Skill</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" size="sm" className="shadow-sm" onClick={() => navigate("/app/freelance/dashboard")}>
                <BarChart3 className="w-4 h-4 mr-2" /> Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Active Jobs</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.activeJobs.value.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-green-600">
                      <ArrowUpRight className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        +{stats.activeJobs.change}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">New Today</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.newToday.value}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-green-600">
                      <ArrowUpRight className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        +{stats.newToday.change}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Avg Budget</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ${stats.avgBudget.value.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-green-600">
                      <ArrowUpRight className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        +${stats.avgBudget.change}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Success Rate</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.successRate.value}%
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-green-600">
                      <ArrowUpRight className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        +{stats.successRate.change}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Compact Advanced Filters */}
            <CompactFreelanceFilters
              onFiltersChange={(newFilters: any) => {
                setFilters(newFilters);
                setSearchQuery(newFilters.searchQuery);
              }}
              initialFilters={{ searchQuery }}
            />

            {/* Main Tabs */}
            <RenderTabs />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trending Categories */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Trending Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {trendingCategories.map((category, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {category.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {category.jobs} jobs
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800"
                    >
                      {category.growth}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bell className="w-5 h-5 text-orange-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div
                      className={`p-1 rounded-full ${
                        activity.type === "application"
                          ? "bg-blue-100"
                          : activity.type === "message"
                            ? "bg-green-100"
                            : "bg-yellow-100"
                      }`}
                    >
                      {activity.type === "application" && (
                        <FileText className="w-3 h-3 text-blue-600" />
                      )}
                      {activity.type === "message" && (
                        <MessageSquare className="w-3 h-3 text-green-600" />
                      )}
                      {activity.type === "job" && (
                        <Briefcase className="w-3 h-3 text-yellow-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </p>
                      <p className="text-xs text-gray-600">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Success Tips */}
            <Card className="shadow-sm border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-600" />
                  Success Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Complete your profile</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Add portfolio samples</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                    <span className="text-sm">Get verified badge</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="w-full bg-yellow-600 hover:bg-yellow-700"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Pro
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedFreelanceHub;
