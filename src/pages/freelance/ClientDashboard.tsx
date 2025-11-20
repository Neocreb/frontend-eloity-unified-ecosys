// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  DollarSign,
  TrendingUp,
  Clock,
  Star,
  Briefcase,
  MessageCircle,
  Calendar,
  FileText,
  Users,
  Award,
  Target,
  Activity,
  Wallet,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Brain,
  Shield,
  Trophy,
  BarChart3,
  Bell,
  Zap,
  Settings,
  ExternalLink,
  TrendingDown,
  Sparkles,
  Layers,
  Search,
  Filter,
  Eye,
  ThumbsUp,
  ThumbsDown,
  CreditCard,
  Download,
  Upload,
  Edit,
  Menu,
  MoreVertical,
  ArrowUp,
  ArrowDown,
  Home,
  FolderOpen,
  Edit3,
  Share2,
} from "lucide-react";
import { Project, FreelanceStats } from "@/types/freelance";
import { useFreelance, useEscrow } from "@/hooks/use-freelance";
import { useAuth } from "@/contexts/AuthContext";
import TaskTracker from "@/components/freelance/TaskTracker";
import NegotiationChat from "@/components/freelance/NegotiationChat";
import ReviewForm from "@/components/freelance/ReviewForm";
import FileUpload from "@/components/freelance/FileUpload";
import { Skeleton } from "@/components/ui/skeleton";
import { UnifiedCampaignManager } from "@/components/campaigns/UnifiedCampaignManager";
import { FreelanceNavigationTabs, TabItem } from "@/components/freelance/FreelanceNavigationTabs";
import { ActivityIndicator } from "@/components/freelance/RealTimeNotifications";
import { OnboardingTour, HelpCenter, ContextualHelp, EmptyStateGuidance } from "@/components/freelance/OnboardingTour";
import { KeyboardShortcuts, AccessibilitySettings, SkipToContent } from "@/components/freelance/KeyboardShortcuts";
import { PerformanceMonitor, DashboardSkeleton, MemoizedCard } from "@/components/freelance/PerformanceOptimizations";
import ClientProposals from "@/components/freelance/ClientProposals";
import { cn } from "@/lib/utils";

interface ClientStats {
  totalSpent: number;
  activeProjects: number;
  completedProjects: number;
  averageProjectRating: number;
  totalSavings: number;
  freelancersHired: number;
}

// Navigation items for the tabs
const navigationItems: TabItem[] = [
  {
    id: "overview",
    label: "Overview",
    icon: Home,
    description: "Dashboard overview and project stats",
  },
  {
    id: "projects",
    label: "Projects",
    icon: FolderOpen,
    description: "Manage your projects",
    badge: "5",
  },
  {
    id: "manage",
    label: "Manage",
    icon: Users,
    description: "Post jobs & find freelancers",
  },
  {
    id: "proposals",
    label: "Proposals",
    icon: FileText,
    description: "Review received proposals",
    badge: "12",
  },
  {
    id: "campaigns",
    label: "Campaigns",
    icon: Sparkles,
    description: "Boost your job posts",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    description: "Performance insights",
  },
];


export const ClientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeProjects, setActiveProjects] = useState<Project[]>([]);
  const [clientStats, setClientStats] = useState<ClientStats | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isMobile, setIsMobile] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasSeenTour, setHasSeenTour] = useState(() => {
    return localStorage.getItem('client-tour-completed') === 'true';
  });

  const { getProjects, loading } = useFreelance();
  const { getUserEscrows } = useEscrow();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      const [projectsData] = await Promise.all([
        getProjects(user.id, "client"),
      ]);

      if (projectsData) {
        setActiveProjects(projectsData);
        
        // Calculate client stats
        const stats: ClientStats = {
          totalSpent: projectsData.reduce((sum: number, p: Project) => sum + p.budget.paid, 0),
          activeProjects: projectsData.filter((p: Project) => p.status === "active").length,
          completedProjects: projectsData.filter((p: Project) => p.status === "completed").length,
          averageProjectRating: 4.8, // Mock value
          totalSavings: 2500, // Mock value
          freelancersHired: new Set(projectsData.map((p: Project) => p.freelancer.id)).size,
        };
        setClientStats(stats);
      }
    };

    loadData();
  }, [user, getProjects]);

  useEffect(() => {
    // Show onboarding for new users
    if (!hasSeenTour && user) {
      setTimeout(() => setShowOnboarding(true), 1000);
    }
  }, [hasSeenTour, user]);

  const handleTourComplete = () => {
    localStorage.setItem('client-tour-completed', 'true');
    setHasSeenTour(true);
    setShowOnboarding(false);
  };

  const getProjectStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "disputed":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getMockFreelancers = () => [
    {
      id: "1",
      name: "Sarah Johnson",
      title: "Frontend Developer",
      rating: 4.9,
      completedJobs: 47,
      hourlyRate: 65,
      avatar: "/api/placeholder/40/40",
      skills: ["React", "TypeScript", "Tailwind CSS"],
      availability: "Available now",
    },
    {
      id: "2", 
      name: "Marcus Chen",
      title: "Full Stack Developer",
      rating: 4.8,
      completedJobs: 32,
      hourlyRate: 75,
      avatar: "/api/placeholder/40/40",
      skills: ["Node.js", "React", "PostgreSQL"],
      availability: "Available in 2 weeks",
    },
  ];

  const getMockProposals = () => [
    {
      id: "1",
      freelancer: "Alice Thompson",
      jobTitle: "E-commerce Website Design",
      budget: 2500,
      timeframe: "3 weeks",
      rating: 4.9,
      submittedAt: "2024-01-15",
    },
    {
      id: "2",
      freelancer: "David Rodriguez",
      jobTitle: "Mobile App Development",
      budget: 4000,
      timeframe: "6 weeks", 
      rating: 4.7,
      submittedAt: "2024-01-14",
    },
  ];

  const ClientProjectCard: React.FC<{ project: Project }> = ({ project }) => (
    <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {project.job.title}
            </h3>
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="w-10 h-10 border-2 border-white dark:border-gray-700 shadow-sm">
                <AvatarImage src={project.freelancer.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-600 text-white font-medium">
                  {project.freelancer.name[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {project.freelancer.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Freelancer</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={`${getProjectStatusColor(project.status)} font-medium`}>
              {project.status}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSelectedProject(project)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit3 className="mr-2 h-4 w-4" />
                  Edit Project
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Message Freelancer
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" />
                  Export Data
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400 font-medium">Progress</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">75%</span>
          </div>
          <Progress value={75} className="h-2 bg-gray-100 dark:bg-gray-700" />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-gray-600 dark:text-gray-400 font-medium mb-1">Budget</p>
              <p className="font-bold text-lg text-gray-900 dark:text-white">
                ${project.budget.agreed.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-gray-600 dark:text-gray-400 font-medium mb-1">Paid</p>
              <p className="font-bold text-lg text-blue-600 dark:text-blue-400">
                ${project.budget.paid.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              <Clock className="w-4 h-4 inline mr-2" />
              Due: {project.deadline ? new Date(project.deadline).toLocaleDateString() : "No deadline"}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedProject(project)}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              View Details
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    change?: string;
    changeType?: "increase" | "decrease";
    icon: React.ReactNode;
    color: string;
  }> = ({ title, value, change, changeType = "increase", icon, color }) => (
    <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{title}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{value}</p>
            {change && (
              <div className="flex items-center text-sm">
                {changeType === "increase" ? (
                  <ArrowUp className="w-4 h-4 mr-1 text-green-500" />
                ) : (
                  <ArrowDown className="w-4 h-4 mr-1 text-red-500" />
                )}
                <span className={changeType === "increase" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                  {change}
                </span>
              </div>
            )}
          </div>
          <div className={`p-4 rounded-xl ${color} shadow-sm`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );

  // Enhanced header component
  const ClientHeader = () => (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <ContextualHelp
                title="Client Dashboard"
                content="Your central hub for posting jobs, managing projects, and working with freelancers."
              >
                <h1 className="font-bold text-lg text-gray-900 dark:text-white">Client Dashboard</h1>
              </ContextualHelp>
              <div className="flex items-center gap-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Hire freelancers and manage projects</p>
                <ActivityIndicator isActive={true} label="Live" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );

  // If a project is selected, show project details
  if (selectedProject) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
        <ClientHeader />
        
        <div className="px-4 sm:px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setSelectedProject(null)}
              className="shrink-0"
            >
              ← Back to Dashboard
            </Button>
            
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                {selectedProject.job.title}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Project Management</p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-6">
              <TaskTracker projectId={selectedProject.id} userRole="client" />
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Project Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Budget</p>
                      <p className="text-lg font-bold">${selectedProject.budget.agreed.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Paid</p>
                      <p className="text-lg font-bold text-blue-600">${selectedProject.budget.paid.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={selectedProject.freelancer.avatar} />
                      <AvatarFallback>{selectedProject.freelancer.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedProject.freelancer.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Freelancer</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Button className="w-full">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message Freelancer
                    </Button>
                    <Button variant="outline" className="w-full">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Make Payment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main dashboard view
  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
      <ClientHeader />
      
      {/* Navigation Tabs */}
      <FreelanceNavigationTabs
        tabs={navigationItems}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        variant={isMobile ? "compact" : "default"}
      />

      {/* Dashboard Content */}
      <div className="p-4 sm:p-6">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Overview */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <Skeleton className="h-20 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : clientStats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Spent"
                  value={`$${clientStats.totalSpent.toLocaleString()}`}
                  change="+8% this month"
                  icon={<DollarSign className="w-6 h-6 text-white" />}
                  color="bg-gradient-to-br from-blue-500 to-cyan-600"
                />
                <StatCard
                  title="Active Projects"
                  value={clientStats.activeProjects}
                  icon={<Briefcase className="w-6 h-6 text-white" />}
                  color="bg-gradient-to-br from-green-500 to-emerald-600"
                />
                <StatCard
                  title="Completed Projects"
                  value={clientStats.completedProjects}
                  icon={<CheckCircle2 className="w-6 h-6 text-white" />}
                  color="bg-gradient-to-br from-purple-500 to-violet-600"
                />
                <StatCard
                  title="Freelancers Hired"
                  value={clientStats.freelancersHired}
                  icon={<Users className="w-6 h-6 text-white" />}
                  color="bg-gradient-to-br from-orange-500 to-amber-600"
                />
              </div>
            ) : null}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Active Projects */}
              <div className="xl:col-span-2 space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Layers className="w-5 h-5 text-blue-600" />
                      Active Projects
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={() => setActiveTab("projects")}>
                      View All
                      <ExternalLink className="w-4 h-4 ml-1" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <Skeleton key={i} className="h-40 w-full" />
                        ))}
                      </div>
                    ) : activeProjects.length > 0 ? (
                      <div className="space-y-4">
                        {activeProjects.slice(0, 3).map((project) => (
                          <ClientProjectCard key={project.id} project={project} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Plus className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          No active projects
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          Start by posting your first job to find freelancers
                        </p>
                        <Button onClick={() => navigate('/app/freelance/create-job')}>
                          Post Your First Job
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Proposals */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-green-600" />
                      Recent Proposals
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {getMockProposals().map((proposal) => (
                        <div key={proposal.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-sm text-gray-900 dark:text-white">
                              {proposal.freelancer}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                              {proposal.jobTitle}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>${proposal.budget.toLocaleString()}</span>
                              <span>{proposal.timeframe}</span>
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span>{proposal.rating}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                            <Button size="sm">
                              <ThumbsUp className="w-3 h-3 mr-1" />
                              Accept
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-purple-600" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button className="w-full justify-start" onClick={() => navigate('/app/freelance/create-job')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Post New Job
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab("freelancers")}>
                      <Search className="w-4 h-4 mr-2" />
                      Find Freelancers
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab("proposals")}>
                      <FileText className="w-4 h-4 mr-2" />
                      Review Proposals
                    </Button>
                  </CardContent>
                </Card>

                {/* Top Freelancers */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-600" />
                      Top Freelancers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {getMockFreelancers().map((freelancer) => (
                        <div key={freelancer.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className="flex items-center gap-3 mb-2">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={freelancer.avatar} />
                              <AvatarFallback>{freelancer.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                                {freelancer.name}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {freelancer.title}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span>{freelancer.rating}</span>
                            </div>
                            <span>${freelancer.hourlyRate}/hr</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                      This Month
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Jobs Posted</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">3</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Proposals Received</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">24</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Avg Response Time</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">&lt; 4 hours</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Project Success Rate</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">96%</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {activeTab === "projects" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">My Projects</h2>
                <p className="text-gray-600 dark:text-gray-400">Manage all your projects and freelancers</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {activeProjects.map((project) => (
                <ClientProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        )}

        {activeTab === "manage" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Post Job Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5 text-blue-600" />
                    Post a New Job
                  </CardTitle>
                  <p className="text-gray-600 dark:text-gray-400">
                    Create a detailed job posting to attract the best freelancers
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={() => setShowCreateJobModal(true)} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Job Posting
                  </Button>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                      <p className="text-2xl font-bold text-blue-600">3</p>
                      <p className="text-gray-600 dark:text-gray-400">Active Jobs</p>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                      <p className="text-2xl font-bold text-green-600">24</p>
                      <p className="text-gray-600 dark:text-gray-400">Proposals</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Find Freelancers Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="w-5 h-5 text-green-600" />
                    Find Freelancers
                  </CardTitle>
                  <p className="text-gray-600 dark:text-gray-400">
                    Browse and hire talented freelancers for your projects
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full">
                    <Search className="w-4 h-4 mr-2" />
                    Browse Freelancers
                  </Button>
                  <div className="space-y-3">
                    {getMockFreelancers().slice(0, 2).map((freelancer) => (
                      <div key={freelancer.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={freelancer.avatar} />
                            <AvatarFallback>{freelancer.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                              {freelancer.name}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {freelancer.title}
                            </p>
                            <div className="flex items-center justify-between mt-1">
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs">{freelancer.rating}</span>
                              </div>
                              <span className="text-xs text-gray-500">${freelancer.hourlyRate}/hr</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "proposals" && <ClientProposals />}

        {activeTab === "campaigns" && (
          <UnifiedCampaignManager
            context="client"
            entityId={user?.id}
            entityType="job"
            showCreateButton={true}
            compact={false}
          />
        )}

        {/* Placeholder for other tabs */}
        {!["overview", "projects", "manage", "proposals", "campaigns"].includes(activeTab) && (
          <div className="text-center py-12">
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {navigationItems.find(item => item.id === activeTab)?.label}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              This section is coming soon. Check back later for updates.
            </p>
          </div>
        )}
      </div>

      {/* Enhanced Components */}
      <KeyboardShortcuts
        onNavigate={setActiveTab}
      />
      <AccessibilitySettings />
      <HelpCenter />
      <PerformanceMonitor />

      <OnboardingTour
        userType="client"
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={handleTourComplete}
      />

      {/* Create Job Modal */}
      {showCreateJobModal && (
        <CreateJobModal
          isOpen={showCreateJobModal}
          onClose={() => setShowCreateJobModal(false)}
          onSubmit={(jobData) => {
            console.log("Job created:", jobData);
            setShowCreateJobModal(false);
          }}
        />
      )}

      {/* Review Modal */}
      {showReviewModal && selectedProject && (
        <ReviewForm
          project={selectedProject}
          userRole="client"
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          onSubmit={(review) => {
            console.log("Review submitted:", review);
            setShowReviewModal(false);
          }}
        />
      )}
    </div>
  );
};

export default ClientDashboard;
