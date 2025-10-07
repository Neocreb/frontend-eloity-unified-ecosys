// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Search,
  Filter,
  MapPin,
  Clock,
  DollarSign,
  Star,
  Bookmark,
  BookmarkCheck,
  Eye,
  Send,
  Calendar,
  Users,
  Zap,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  Target,
  TrendingUp,
  Globe,
  Award,
  Heart,
  MessageCircle,
  ExternalLink,
  Sliders,
  SortAsc,
  SortDesc,
  RefreshCw,
  Filter as FilterIcon,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Job {
  id: string;
  title: string;
  description: string;
  budget: {
    type: "fixed" | "hourly";
    amount: number;
    currency: string;
  };
  duration: string;
  postedDate: Date;
  deadline?: Date;
  client: {
    id: string;
    name: string;
    avatar?: string;
    rating: number;
    jobsPosted: number;
    paymentVerified: boolean;
    location: string;
  };
  skills: string[];
  category: string;
  experienceLevel: "entry" | "intermediate" | "expert";
  proposals: number;
  status: "open" | "in-progress" | "completed" | "closed";
  featured: boolean;
  urgent: boolean;
  savedByUser: boolean;
}

const BrowseJobs: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  
  // Filters
  const [filters, setFilters] = useState({
    category: "all",
    budgetType: "all",
    minBudget: "",
    maxBudget: "",
    experienceLevel: "all",
    datePosted: "all",
    proposalCount: "all",
  });
  
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"list" | "card">("card");

  const [jobs, setJobs] = useState<Job[]>([
    {
      id: "1",
      title: "React Developer for E-commerce Platform",
      description: "We're looking for an experienced React developer to help build our new e-commerce platform. You'll work with our existing team to create responsive, user-friendly interfaces and integrate with our backend APIs.",
      budget: { type: "fixed", amount: 5000, currency: "USD" },
      duration: "2-3 months",
      postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      client: {
        id: "c1",
        name: "TechCorp Inc.",
        avatar: "",
        rating: 4.8,
        jobsPosted: 23,
        paymentVerified: true,
        location: "San Francisco, CA",
      },
      skills: ["React", "TypeScript", "Node.js", "MongoDB"],
      category: "Web Development",
      experienceLevel: "intermediate",
      proposals: 12,
      status: "open",
      featured: true,
      urgent: false,
      savedByUser: false,
    },
    {
      id: "2",
      title: "Mobile App UI/UX Design",
      description: "Need a talented designer to create beautiful, intuitive UI/UX for our mobile fitness app. Looking for someone with experience in health & fitness apps.",
      budget: { type: "hourly", amount: 45, currency: "USD" },
      duration: "1-2 months",
      postedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      client: {
        id: "c2",
        name: "FitLife Solutions",
        rating: 4.6,
        jobsPosted: 8,
        paymentVerified: true,
        location: "Austin, TX",
      },
      skills: ["UI/UX Design", "Figma", "Mobile Design", "Prototyping"],
      category: "Design",
      experienceLevel: "intermediate",
      proposals: 8,
      status: "open",
      featured: false,
      urgent: true,
      savedByUser: true,
    },
    {
      id: "3",
      title: "Python Data Analysis & Visualization",
      description: "Looking for a Python expert to analyze our sales data and create interactive dashboards. Experience with pandas, matplotlib, and Plotly required.",
      budget: { type: "fixed", amount: 2500, currency: "USD" },
      duration: "3-4 weeks",
      postedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      client: {
        id: "c3",
        name: "DataDriven Co.",
        rating: 4.9,
        jobsPosted: 15,
        paymentVerified: true,
        location: "New York, NY",
      },
      skills: ["Python", "Pandas", "Data Visualization", "Plotly"],
      category: "Data Science",
      experienceLevel: "expert",
      proposals: 5,
      status: "open",
      featured: false,
      urgent: false,
      savedByUser: false,
    },
    {
      id: "4",
      title: "Content Writer for Tech Blog",
      description: "We need a skilled content writer to create engaging articles about emerging technologies, AI, and software development trends.",
      budget: { type: "hourly", amount: 25, currency: "USD" },
      duration: "Ongoing",
      postedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      client: {
        id: "c4",
        name: "TechInsights Media",
        rating: 4.4,
        jobsPosted: 42,
        paymentVerified: true,
        location: "Remote",
      },
      skills: ["Content Writing", "Technical Writing", "SEO", "Research"],
      category: "Writing",
      experienceLevel: "entry",
      proposals: 23,
      status: "open",
      featured: false,
      urgent: false,
      savedByUser: false,
    },
    {
      id: "5",
      title: "Full Stack Developer - SaaS Platform",
      description: "Join our team to build a cutting-edge SaaS platform. We need someone proficient in React, Node.js, and cloud technologies.",
      budget: { type: "fixed", amount: 8000, currency: "USD" },
      duration: "4-6 months",
      postedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      client: {
        id: "c5",
        name: "CloudTech Innovations",
        rating: 4.7,
        jobsPosted: 12,
        paymentVerified: true,
        location: "Seattle, WA",
      },
      skills: ["React", "Node.js", "AWS", "PostgreSQL", "Docker"],
      category: "Web Development",
      experienceLevel: "expert",
      proposals: 7,
      status: "open",
      featured: true,
      urgent: true,
      savedByUser: false,
    },
  ]);

  const [proposal, setProposal] = useState({
    coverLetter: "",
    proposedRate: "",
    estimatedDuration: "",
    milestones: "",
  });

  useEffect(() => {
    // Load saved and applied jobs from localStorage or API
    const saved = localStorage.getItem("savedJobs");
    const applied = localStorage.getItem("appliedJobs");
    
    if (saved) setSavedJobs(new Set(JSON.parse(saved)));
    if (applied) setAppliedJobs(new Set(JSON.parse(applied)));
  }, []);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = filters.category === "all" || job.category === filters.category;
    const matchesBudgetType = filters.budgetType === "all" || job.budget.type === filters.budgetType;
    const matchesExperience = filters.experienceLevel === "all" || job.experienceLevel === filters.experienceLevel;
    
    return matchesSearch && matchesCategory && matchesBudgetType && matchesExperience;
  });

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return b.postedDate.getTime() - a.postedDate.getTime();
      case "oldest":
        return a.postedDate.getTime() - b.postedDate.getTime();
      case "budget-high":
        return b.budget.amount - a.budget.amount;
      case "budget-low":
        return a.budget.amount - b.budget.amount;
      case "proposals":
        return a.proposals - b.proposals;
      default:
        return 0;
    }
  });

  const toggleSaveJob = (jobId: string) => {
    const newSavedJobs = new Set(savedJobs);
    if (newSavedJobs.has(jobId)) {
      newSavedJobs.delete(jobId);
      toast.success("Job removed from saved");
    } else {
      newSavedJobs.add(jobId);
      toast.success("Job saved");
    }
    setSavedJobs(newSavedJobs);
    localStorage.setItem("savedJobs", JSON.stringify([...newSavedJobs]));
  };

  const handleApplyToJob = async (jobId: string) => {
    if (!proposal.coverLetter.trim()) {
      toast.error("Please write a cover letter");
      return;
    }

    setLoading(true);
    try {
      // Here you would submit the proposal to your backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newAppliedJobs = new Set(appliedJobs);
      newAppliedJobs.add(jobId);
      setAppliedJobs(newAppliedJobs);
      localStorage.setItem("appliedJobs", JSON.stringify([...newAppliedJobs]));
      
      toast.success("Proposal submitted successfully!");
      setShowApplyModal(false);
      setProposal({ coverLetter: "", proposedRate: "", estimatedDuration: "", milestones: "" });
    } catch (error) {
      toast.error("Failed to submit proposal");
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  };

  const JobCard: React.FC<{ job: Job }> = ({ job }) => (
    <Card className={`hover:shadow-lg transition-all duration-200 ${job.featured ? "ring-2 ring-blue-200" : ""}`}>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {job.featured && (
                  <Badge className="bg-blue-500 text-white">
                    <Star className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                )}
                {job.urgent && (
                  <Badge variant="destructive">
                    <Zap className="w-3 h-3 mr-1" />
                    Urgent
                  </Badge>
                )}
              </div>
              <h3 className="font-bold text-lg mb-2 line-clamp-2">{job.title}</h3>
              <p className="text-muted-foreground text-sm mb-3 line-clamp-3">{job.description}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                toggleSaveJob(job.id);
              }}
            >
              {savedJobs.has(job.id) ? (
                <BookmarkCheck className="w-4 h-4 text-blue-500" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Budget & Duration */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4 text-green-500" />
              <span className="font-medium">
                {job.budget.type === "fixed" 
                  ? `$${job.budget.amount.toLocaleString()} fixed` 
                  : `$${job.budget.amount}/hour`
                }
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>{job.duration}</span>
            </div>
          </div>

          {/* Skills */}
          <div className="flex flex-wrap gap-1">
            {job.skills.slice(0, 4).map((skill, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {job.skills.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{job.skills.length - 4} more
              </Badge>
            )}
          </div>

          {/* Client Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={job.client.avatar} />
                <AvatarFallback>{job.client.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{job.client.name}</span>
                  {job.client.paymentVerified && (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span>{job.client.rating}</span>
                  </div>
                  <span>•</span>
                  <span>{job.client.jobsPosted} jobs posted</span>
                  <span>•</span>
                  <span>{job.client.location}</span>
                </div>
              </div>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <div>{getTimeAgo(job.postedDate)}</div>
              <div>{job.proposals} proposals</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t">
            <Button
              className="flex-1"
              onClick={() => {
                setSelectedJob(job);
                setShowApplyModal(true);
              }}
              disabled={appliedJobs.has(job.id)}
            >
              {appliedJobs.has(job.id) ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Applied
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Apply Now
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setSelectedJob(job)}
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="w-full sm:w-auto"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="w-full sm:w-auto">
          <h1 className="text-2xl sm:text-3xl font-bold">Browse Jobs</h1>
          <p className="text-muted-foreground">Find the perfect project for your skills</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search jobs by title, skills, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              className="px-3 py-2 border rounded-md"
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            >
              <option value="all">All Categories</option>
              <option value="Web Development">Web Development</option>
              <option value="Mobile Development">Mobile Development</option>
              <option value="Design">Design</option>
              <option value="Data Science">Data Science</option>
              <option value="Writing">Writing</option>
              <option value="Marketing">Marketing</option>
            </select>
            <select
              className="px-3 py-2 border rounded-md"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="budget-high">Highest Budget</option>
              <option value="budget-low">Lowest Budget</option>
              <option value="proposals">Fewest Proposals</option>
            </select>
            <Button variant="outline">
              <FilterIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="cursor-pointer">
            <Briefcase className="w-3 h-3 mr-1" />
            Web Development (3)
          </Badge>
          <Badge variant="outline" className="cursor-pointer">
            <DollarSign className="w-3 h-3 mr-1" />
            $1k - $5k
          </Badge>
          <Badge variant="outline" className="cursor-pointer">
            <Clock className="w-3 h-3 mr-1" />
            Posted this week
          </Badge>
          <Button variant="ghost" size="sm" className="h-6 text-xs">
            Clear all
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{sortedJobs.length}</div>
              <div className="text-sm text-muted-foreground">Jobs Available</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{savedJobs.size}</div>
              <div className="text-sm text-muted-foreground">Saved Jobs</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{appliedJobs.size}</div>
              <div className="text-sm text-muted-foreground">Applied Jobs</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold">92%</div>
              <div className="text-sm text-muted-foreground">Match Rate</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job Listings */}
      <div className="space-y-4">
        {sortedJobs.length > 0 ? (
          sortedJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No jobs found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search terms or filters to find more opportunities
                </p>
                <Button variant="outline" onClick={() => setSearchTerm("")}>
                  Clear Search
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Job Details Modal */}
      {selectedJob && !showApplyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{selectedJob.title}</CardTitle>
                  <p className="text-muted-foreground">{selectedJob.category}</p>
                </div>
                <Button variant="ghost" onClick={() => setSelectedJob(null)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">Job Description</h4>
                <p className="text-muted-foreground">{selectedJob.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Budget</h4>
                  <p className="text-lg font-bold text-green-600">
                    {selectedJob.budget.type === "fixed" 
                      ? `$${selectedJob.budget.amount.toLocaleString()} fixed` 
                      : `$${selectedJob.budget.amount}/hour`
                    }
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Duration</h4>
                  <p>{selectedJob.duration}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Experience Level</h4>
                  <Badge>{selectedJob.experienceLevel}</Badge>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Required Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Client Information</h4>
                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <Avatar>
                    <AvatarImage src={selectedJob.client.avatar} />
                    <AvatarFallback>{selectedJob.client.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{selectedJob.client.name}</span>
                      {selectedJob.client.paymentVerified && (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>{selectedJob.client.rating} rating</span>
                      </div>
                      <span>{selectedJob.client.jobsPosted} jobs posted</span>
                      <span>{selectedJob.client.location}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => setShowApplyModal(true)}
                  disabled={appliedJobs.has(selectedJob.id)}
                >
                  {appliedJobs.has(selectedJob.id) ? "Already Applied" : "Apply for this Job"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => toggleSaveJob(selectedJob.id)}
                >
                  {savedJobs.has(selectedJob.id) ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Apply Modal */}
      {showApplyModal && selectedJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Apply for Job</CardTitle>
                  <p className="text-muted-foreground">{selectedJob.title}</p>
                </div>
                <Button variant="ghost" onClick={() => setShowApplyModal(false)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Cover Letter *
                </label>
                <Textarea
                  placeholder="Explain why you're the perfect fit for this job..."
                  value={proposal.coverLetter}
                  onChange={(e) => setProposal(prev => ({ ...prev, coverLetter: e.target.value }))}
                  rows={6}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Proposed Rate
                  </label>
                  <Input
                    placeholder={selectedJob.budget.type === "fixed" ? "Fixed price" : "Hourly rate"}
                    value={proposal.proposedRate}
                    onChange={(e) => setProposal(prev => ({ ...prev, proposedRate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Estimated Duration
                  </label>
                  <Input
                    placeholder="e.g. 2-3 weeks"
                    value={proposal.estimatedDuration}
                    onChange={(e) => setProposal(prev => ({ ...prev, estimatedDuration: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Project Milestones (Optional)
                </label>
                <Textarea
                  placeholder="Break down the project into key milestones..."
                  value={proposal.milestones}
                  onChange={(e) => setProposal(prev => ({ ...prev, milestones: e.target.value }))}
                  rows={4}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => handleApplyToJob(selectedJob.id)}
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit Proposal"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowApplyModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BrowseJobs;
