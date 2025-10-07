// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Search,
  Filter,
  Plus,
  Star,
  TrendingUp,
  Users,
  DollarSign,
  Briefcase,
  Clock,
  Award,
  MessageCircle,
  Settings,
} from "lucide-react";
import {
  JobPosting,
  FreelancerProfile,
  SearchFilters,
  Project,
} from "@/types/freelance";
import { FreelanceService } from "@/services/freelanceService";
import FreelancerProfileCard from "@/components/freelance/FreelancerProfileCard";
import JobCard from "@/components/freelance/JobCard";
import ProposalForm from "@/components/freelance/ProposalForm";
import ProjectDashboard from "@/components/freelance/ProjectDashboard";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { BannerAd } from "@/components/ads/BannerAd";
import { useIsMobile } from "@/hooks/use-mobile";
import { adSettings } from "../../config/adSettings";

const EnhancedFreelance: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("browse-jobs");
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [freelancers, setFreelancers] = useState<FreelancerProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({});

  // Legacy freelance component - consider migrating users to new /app/freelance
  const [categories, setCategories] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Job posting form state
  const [jobForm, setJobForm] = useState({
    title: "",
    description: "",
    category: "",
    subcategory: "",
    budgetType: "fixed" as "fixed" | "hourly",
    budgetAmount: "",
    budgetMin: "",
    budgetMax: "",
    deadline: "",
    duration: "",
    experienceLevel: "intermediate" as "entry" | "intermediate" | "expert",
    skills: [] as string[],
    skillInput: "",
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === "browse-jobs") {
      searchJobs();
    } else if (activeTab === "find-talent") {
      searchFreelancers();
    }
  }, [activeTab, filters, searchQuery]);

  const loadInitialData = async () => {
    try {
      const [categoriesData, skillsData] = await Promise.all([
        freelanceService.getCategories(),
        freelanceService.getSkills(),
      ]);
      setCategories(categoriesData);
      setSkills(skillsData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load initial data",
        variant: "destructive",
      });
    }
  };

  const searchJobs = async () => {
    setIsLoading(true);
    try {
      const searchFilters: SearchFilters = {
        ...filters,
        skills: searchQuery ? [searchQuery] : filters.skills,
      };
      const jobsData = await freelanceService.searchJobs(searchFilters);
      setJobs(jobsData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search jobs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const searchFreelancers = async () => {
    setIsLoading(true);
    try {
      const searchFilters: SearchFilters = {
        ...filters,
        skills: searchQuery ? [searchQuery] : filters.skills,
      };
      const freelancersData =
        await freelanceService.searchFreelancers(searchFilters);
      setFreelancers(freelancersData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search freelancers",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleJobApplication = (job: JobPosting) => {
    setSelectedJob(job);
    setShowProposalForm(true);
  };

  const handleJobDetails = (job: JobPosting) => {
    // Would open a detailed job view modal
    toast({
      title: "Job Details",
      description: `Viewing details for: ${job.title}`,
    });
  };

  const handleHireFreelancer = (freelancer: FreelancerProfile) => {
    // Would open a hire freelancer modal
    toast({
      title: "Hire Freelancer",
      description: `Initiating hire process for: ${freelancer.name}`,
    });
  };

  const handleMessageFreelancer = (freelancer: FreelancerProfile) => {
    // Would open messaging interface
    toast({
      title: "Message Sent",
      description: `Opening chat with ${freelancer.name}`,
    });
  };

  const handleSubmitProposal = async (proposalData: any) => {
    try {
      await freelanceService.submitProposal(proposalData);
      toast({
        title: "Proposal Submitted",
        description: "Your proposal has been sent successfully!",
      });
      setShowProposalForm(false);
      setSelectedJob(null);
    } catch (error) {
      throw error; // Let ProposalForm handle the error
    }
  };

  const handleJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to post a job",
        variant: "destructive",
      });
      return;
    }

    try {
      const jobData: Omit<
        JobPosting,
        "id" | "postedDate" | "applicationsCount" | "proposals"
      > = {
        title: jobForm.title,
        description: jobForm.description,
        category: jobForm.category,
        subcategory: jobForm.subcategory,
        budget: {
          type: jobForm.budgetType,
          ...(jobForm.budgetType === "fixed"
            ? { amount: parseFloat(jobForm.budgetAmount) }
            : {
                min: parseFloat(jobForm.budgetMin),
                max: parseFloat(jobForm.budgetMax),
              }),
        },
        deadline: jobForm.deadline,
        duration: jobForm.duration,
        experienceLevel: jobForm.experienceLevel,
        skills: jobForm.skills,
        client: {
          id: user.id || "1",
          name: user.name || "Current User",
          email: user.email || "user@example.com",
          avatar:
            user.avatar ||
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
          location: "Remote",
          timezone: "UTC",
          verified: true,
          joinedDate: "2023-01-01",
          totalSpent: 0,
          jobsPosted: 0,
          hireRate: 0,
          rating: 5.0,
          paymentVerified: true,
        },
        status: "open",
        visibility: "public",
      };

      await freelanceService.createJobPosting(jobData);

      toast({
        title: "Job Posted Successfully",
        description: "Your job has been posted and is now live!",
      });

      // Reset form
      setJobForm({
        title: "",
        description: "",
        category: "",
        subcategory: "",
        budgetType: "fixed",
        budgetAmount: "",
        budgetMin: "",
        budgetMax: "",
        deadline: "",
        duration: "",
        experienceLevel: "intermediate",
        skills: [],
        skillInput: "",
      });

      // Switch to browse jobs tab to see the new job
      setActiveTab("browse-jobs");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post job. Please try again.",
        variant: "destructive",
      });
    }
  };

  const addSkill = () => {
    if (
      jobForm.skillInput.trim() &&
      !jobForm.skills.includes(jobForm.skillInput.trim())
    ) {
      setJobForm({
        ...jobForm,
        skills: [...jobForm.skills, jobForm.skillInput.trim()],
        skillInput: "",
      });
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setJobForm({
      ...jobForm,
      skills: jobForm.skills.filter((skill) => skill !== skillToRemove),
    });
  };

  return (
    <div className="max-w-7xl mx-auto bg-white">
      {/* Top Banner Ad */}
      {adSettings.enableAds && (
        <div className="mb-6 flex justify-center">
          <BannerAd
            position="top"
            isMobile={isMobile}
            className="w-full max-w-4xl"
          />
        </div>
      )}

      {/* Upgrade Notice */}
      <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-green-800">
                Enhanced Freelance System Available!
              </h3>
              <p className="text-sm text-green-700">
                Experience our new integrated freelance platform with escrow,
                real-time messaging, and advanced project management.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              onClick={() => navigate("/app/freelance/dashboard")}
              variant="outline"
              className="w-full sm:w-auto border-green-600 text-green-600 hover:bg-green-50"
            >
              <Users className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <Button
              onClick={() => navigate("/app/freelance")}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
            >
              Try New System
            </Button>
          </div>
        </div>
        <div className="mt-3 text-xs text-green-600">
          Redirecting automatically in 3 seconds...
        </div>
      </div>

      {/* Hero Section */}
      <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Freelance Marketplace
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-4 sm:mb-6">
            Connect with top talent or find your next opportunity
          </p>
          <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-center gap-3 sm:gap-6 lg:gap-8 text-xs sm:text-sm text-gray-600">
            <div className="flex items-center gap-1 sm:gap-2 justify-center">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
              <span className="whitespace-nowrap">10,000+ Freelancers</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 justify-center">
              <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
              <span className="whitespace-nowrap">5,000+ Jobs Posted</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 justify-center">
              <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 flex-shrink-0" />
              <span className="whitespace-nowrap">4.8 Average Rating</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 justify-center">
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 flex-shrink-0" />
              <span className="whitespace-nowrap">$2M+ Paid Out</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <div className="overflow-x-auto pb-2">
          <TabsList className="grid w-full min-w-max grid-cols-4 bg-gray-100">
            <TabsTrigger
              value="browse-jobs"
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4"
            >
              <Search className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Browse Jobs</span>
              <span className="xs:hidden">Browse</span>
            </TabsTrigger>
            <TabsTrigger
              value="find-talent"
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4"
            >
              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Find Talent</span>
              <span className="xs:hidden">Talent</span>
            </TabsTrigger>
            <TabsTrigger
              value="post-job"
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Post Job</span>
              <span className="xs:hidden">Post</span>
            </TabsTrigger>
            <TabsTrigger
              value="my-projects"
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4"
            >
              <Briefcase className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">My Projects</span>
              <span className="xs:hidden">Projects</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Browse Jobs Tab */}
        <TabsContent value="browse-jobs" className="space-y-6">
          {/* Search and Filters */}
          <Card className="bg-white border-gray-200">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search jobs by skills, title, keywords..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select
                    value={filters.category || "all"}
                    onValueChange={(value) =>
                      setFilters({
                        ...filters,
                        category: value === "all" ? undefined : value,
                      })
                    }
                  >
                    <SelectTrigger className="w-32 sm:w-40 lg:w-48">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Jobs Grid */}
          <div className="grid gap-6">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <Card className="bg-white border-gray-200">
                <CardContent className="p-12 text-center">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Jobs Found
                  </h3>
                  <p className="text-gray-600">
                    Try adjusting your search criteria or browse all categories.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {jobs.map((job, index) => (
                  <React.Fragment key={job.id}>
                    <JobCard
                      job={job}
                      onApply={handleJobApplication}
                      onViewDetails={handleJobDetails}
                    />

                    {/* Insert banner ad after every 15 jobs */}
                    {adSettings.enableAds &&
                     (index + 1) % adSettings.freelanceAdFrequency === 0 &&
                     index < jobs.length - 1 && (
                      <div className="flex justify-center py-4">
                        <BannerAd
                          position="center"
                          isMobile={isMobile}
                          className="w-full max-w-2xl"
                        />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </>
            )}
          </div>
        </TabsContent>

        {/* Find Talent Tab */}
        <TabsContent value="find-talent" className="space-y-6">
          {/* Search and Filters */}
          <Card className="bg-white border-gray-200">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search freelancers by skills, name, expertise..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select>
                    <SelectTrigger className="w-32 sm:w-40 lg:w-48">
                      <SelectValue placeholder="Skill" />
                    </SelectTrigger>
                    <SelectContent>
                      {skills.map((skill) => (
                        <SelectItem key={skill} value={skill}>
                          {skill}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Freelancers Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {isLoading ? (
              <div className="col-span-full space-y-4">
                {[1, 2].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : freelancers.length === 0 ? (
              <div className="col-span-full">
                <Card className="bg-white border-gray-200">
                  <CardContent className="p-12 text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Freelancers Found
                    </h3>
                    <p className="text-gray-600">
                      Try adjusting your search criteria to find the right
                      talent.
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              freelancers.map((freelancer) => (
                <FreelancerProfileCard
                  key={freelancer.id}
                  freelancer={freelancer}
                  onHire={handleHireFreelancer}
                  onMessage={handleMessageFreelancer}
                />
              ))
            )}
          </div>
        </TabsContent>

        {/* Post Job Tab */}
        <TabsContent value="post-job" className="space-y-6">
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Post a New Job
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJobSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Build a React Native mobile app"
                      value={jobForm.title}
                      onChange={(e) =>
                        setJobForm({ ...jobForm, title: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={jobForm.category}
                      onValueChange={(value) =>
                        setJobForm({ ...jobForm, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Project Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your project in detail, including requirements, goals, and any specific preferences..."
                    rows={8}
                    value={jobForm.description}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, description: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Budget */}
                <div className="space-y-4">
                  <Label>Budget *</Label>
                  <div className="space-y-4">
                    <Select
                      value={jobForm.budgetType}
                      onValueChange={(value) =>
                        setJobForm({
                          ...jobForm,
                          budgetType: value as "fixed" | "hourly",
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Budget Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Fixed Price</SelectItem>
                        <SelectItem value="hourly">Hourly Rate</SelectItem>
                      </SelectContent>
                    </Select>

                    {jobForm.budgetType === "fixed" ? (
                      <div className="space-y-2">
                        <Label htmlFor="budgetAmount">Total Budget ($)</Label>
                        <Input
                          id="budgetAmount"
                          type="number"
                          min="1"
                          placeholder="e.g., 5000"
                          value={jobForm.budgetAmount}
                          onChange={(e) =>
                            setJobForm({
                              ...jobForm,
                              budgetAmount: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="budgetMin">Min Rate ($/hr)</Label>
                          <Input
                            id="budgetMin"
                            type="number"
                            min="1"
                            placeholder="e.g., 50"
                            value={jobForm.budgetMin}
                            onChange={(e) =>
                              setJobForm({
                                ...jobForm,
                                budgetMin: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="budgetMax">Max Rate ($/hr)</Label>
                          <Input
                            id="budgetMax"
                            type="number"
                            min="1"
                            placeholder="e.g., 100"
                            value={jobForm.budgetMax}
                            onChange={(e) =>
                              setJobForm({
                                ...jobForm,
                                budgetMax: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Timeline and Experience */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Project Duration</Label>
                    <Select
                      value={jobForm.duration}
                      onValueChange={(value) =>
                        setJobForm({ ...jobForm, duration: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-2 weeks">1-2 weeks</SelectItem>
                        <SelectItem value="1 month">1 month</SelectItem>
                        <SelectItem value="2-3 months">2-3 months</SelectItem>
                        <SelectItem value="3-6 months">3-6 months</SelectItem>
                        <SelectItem value="6+ months">6+ months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deadline">Deadline</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={jobForm.deadline}
                      onChange={(e) =>
                        setJobForm({ ...jobForm, deadline: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experienceLevel">Experience Level</Label>
                    <Select
                      value={jobForm.experienceLevel}
                      onValueChange={(value: any) =>
                        setJobForm({ ...jobForm, experienceLevel: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entry">Entry Level</SelectItem>
                        <SelectItem value="intermediate">
                          Intermediate
                        </SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Skills */}
                <div className="space-y-4">
                  <Label>Required Skills</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a skill (e.g., React, Node.js)"
                      value={jobForm.skillInput}
                      onChange={(e) =>
                        setJobForm({ ...jobForm, skillInput: e.target.value })
                      }
                      onKeyPress={(e) =>
                        e.key === "Enter" && (e.preventDefault(), addSkill())
                      }
                    />
                    <Button type="button" onClick={addSkill} variant="outline">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {jobForm.skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="cursor-pointer hover:bg-red-100"
                        onClick={() => removeSkill(skill)}
                      >
                        {skill} ×
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Post Job
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Projects Tab */}
        <TabsContent value="my-projects">
          <ProjectDashboard
            userId={user?.id || "1"}
            userType="freelancer" // This would be determined by user role
          />
        </TabsContent>
      </Tabs>

      {/* Proposal Form Modal */}
      <ProposalForm
        isOpen={showProposalForm}
        onClose={() => {
          setShowProposalForm(false);
          setSelectedJob(null);
        }}
        job={selectedJob}
        onSubmit={handleSubmitProposal}
        freelancerId={user?.id || "1"}
      />

      {/* Footer Banner Ad */}
      {adSettings.enableAds && (
        <div className="mt-8 pt-6 border-t border-gray-200 flex justify-center">
          <BannerAd
            position="bottom"
            isMobile={isMobile}
            className="w-full max-w-4xl"
          />
        </div>
      )}
    </div>
  );
};

export default EnhancedFreelance;
