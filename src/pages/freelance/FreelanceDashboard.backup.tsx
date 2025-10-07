// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
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
  Menu,
  Search,
  Filter,
  MoreVertical,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  Home,
  FolderOpen,
  UserCheck,
  CreditCard,
  HelpCircle,
  LogOut,
  Eye,
  Edit3,
  Download,
  Share2,
} from "lucide-react";
import { SmartFreelanceMatching } from "@/components/freelance/SmartFreelanceMatching";
import { FreelanceBusinessIntelligence } from "@/components/freelance/FreelanceBusinessIntelligence";
import { FreelanceCollaborationTools } from "@/components/freelance/FreelanceCollaborationTools";
import RateCalculator from "@/components/freelance/RateCalculator";
import ProjectPlanner from "@/components/freelance/ProjectPlanner";
import FileUpload from "@/components/freelance/FileUpload";
import { FreelanceNavigationTabs, TabItem } from "@/components/freelance/FreelanceNavigationTabs";
import { Project, FreelanceStats } from "@/types/freelance";
import { useFreelance, useEscrow } from "@/hooks/use-freelance";
import { useAuth } from "@/contexts/AuthContext";
import TaskTracker from "@/components/freelance/TaskTracker";
import NegotiationChat from "@/components/freelance/NegotiationChat";
import ReviewForm from "@/components/freelance/ReviewForm";
import { Skeleton } from "@/components/ui/skeleton";
import { UnifiedCampaignManager } from "@/components/campaigns/UnifiedCampaignManager";
import { cn } from "@/lib/utils";

// Navigation items for the tabs
const navigationItems: TabItem[] = [
  {
    id: "overview",
    label: "Overview",
    icon: Home,
    description: "Dashboard overview",
  },
  {
    id: "projects",
    label: "Projects",
    icon: FolderOpen,
    description: "Active & completed projects",
    badge: "3",
  },
  {
    id: "proposals",
    label: "Proposals",
    icon: FileText,
    description: "Submitted proposals",
  },
  {
    id: "earnings",
    label: "Earnings",
    icon: DollarSign,
    description: "Revenue & analytics",
  },
  {
    id: "messages",
    label: "Messages",
    icon: MessageCircle,
    description: "Client communications",
    badge: "2",
  },
  {
    id: "campaigns",
    label: "Campaigns",
    icon: Sparkles,
    description: "Boost your profile",
  },
  {
    id: "ai-matching",
    label: "AI Matching",
    icon: Brain,
    description: "Smart job recommendations",
  },
  {
    id: "business-intel",
    label: "Analytics",
    icon: BarChart3,
    description: "Business intelligence",
  },
  {
    id: "collaboration",
    label: "Collaboration",
    icon: Users,
    description: "Team tools",
  },
];

// Secondary navigation items
const secondaryItems = [
  {
    id: "profile",
    label: "Profile",
    icon: UserCheck,
    href: "/app/profile",
  },
  {
    id: "wallet",
    label: "Wallet",
    icon: Wallet,
    href: "/app/wallet",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    href: "/app/settings",
  },
  {
    id: "help",
    label: "Help & Support",
    icon: HelpCircle,
    href: "/app/support",
  },
];

export const FreelanceDashboard: React.FC = () => {
  const [activeProjects, setActiveProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<FreelanceStats | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isMobile, setIsMobile] = useState(false);

  const { getProjects, getFreelanceStats, loading } = useFreelance();
  const { getUserEscrows } = useEscrow();
  const { user } = useAuth();

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

      const [projectsData, statsData] = await Promise.all([
        getProjects(user.id, "freelancer"),
        getFreelanceStats(user.id),
      ]);

      if (projectsData) setActiveProjects(projectsData);
      if (statsData) setStats(statsData);
    };

    loadData();
  }, [user, getProjects, getFreelanceStats]);

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

  const getUrgentTasks = () => {
    return [
      {
        id: "1",
        title: "Submit wireframes for review",
        project: "E-commerce Platform",
        dueDate: "2024-01-18",
        priority: "high",
      },
      {
        id: "2",
        title: "Client feedback response needed",
        project: "Mobile App Design",
        dueDate: "2024-01-19",
        priority: "medium",
      },
    ];
  };

  const getRecentActivities = () => {
    return [
      {
        id: "1",
        type: "message",
        title: "New message from Alice Johnson",
        project: "E-commerce Platform",
        timestamp: "2 hours ago",
      },
      {
        id: "2",
        type: "payment",
        title: "Payment received: $1,500",
        project: "Mobile App Design",
        timestamp: "1 day ago",
      },
      {
        id: "3",
        type: "milestone",
        title: "Milestone approved",
        project: "Website Redesign",
        timestamp: "2 days ago",
      },
    ];
  };

  const ProjectCard: React.FC<{ project: Project }> = ({ project }) => (
    <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {project.job.title}
            </h3>
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="w-10 h-10 border-2 border-white dark:border-gray-700 shadow-sm">
                <AvatarImage src={project.client.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium">
                  {project.client.name[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {project.client.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Client</p>
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
                  Message Client
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
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-gray-600 dark:text-gray-400 font-medium mb-1">Earned</p>
              <p className="font-bold text-lg text-green-600 dark:text-green-400">
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

  // Header component with user info and quick actions
  const FreelanceHeader = () => (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-gray-900 dark:text-white">Freelance Hub</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Welcome back, {user?.username}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick action buttons */}
            <div className="hidden sm:flex items-center gap-2">
              {secondaryItems.slice(0, 2).map((item) => (
                <Button key={item.id} variant="outline" size="sm" asChild>
                  <Link to={item.href} className="flex items-center gap-2">
                    <item.icon className="w-4 h-4" />
                    <span className="hidden md:inline">{item.label}</span>
                  </Link>
                </Button>
              ))}
            </div>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                      {user?.username?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div>
                    <p className="font-medium">{user?.username}</p>
                    <p className="text-xs text-gray-500">Freelancer</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {secondaryItems.map((item) => (
                  <DropdownMenuItem key={item.id} asChild>
                    <Link to={item.href}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );

  // If a project is selected, show project details
  if (selectedProject) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
        <div className="flex">
          {isDesktop && <Sidebar className="w-80 fixed left-0 top-0 h-screen z-40" />}
          
          <div className={cn("flex-1", isDesktop && "ml-80")}>
            <div className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <div className="flex items-center gap-4">
                {!isDesktop && (
                  <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Menu className="h-5 w-5" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-80">
                      <Sidebar />
                    </SheetContent>
                  </Sheet>
                )}
                
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

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 space-y-6">
                  <TaskTracker projectId={selectedProject.id} userRole="freelancer" />
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
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Earned</p>
                          <p className="text-lg font-bold text-green-600">${selectedProject.budget.paid.toLocaleString()}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={selectedProject.client.avatar} />
                          <AvatarFallback>{selectedProject.client.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{selectedProject.client.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Client</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Button className="w-full">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Message Client
                        </Button>
                        <Button variant="outline" className="w-full">
                          <Share2 className="w-4 h-4 mr-2" />
                          Share Progress
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main dashboard view
  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
      <div className="flex">
        {/* Desktop Sidebar */}
        {isDesktop && <Sidebar className="w-80 fixed left-0 top-0 h-screen z-40" />}
        
        {/* Main Content */}
        <div className={cn("flex-1", isDesktop && "ml-80")}>
          {/* Mobile Header */}
          {!isDesktop && (
            <div className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
              <div className="flex items-center justify-between">
                <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0 w-80">
                    <Sidebar />
                  </SheetContent>
                </Sheet>
                
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                    <Briefcase className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="font-bold text-gray-900 dark:text-white">Freelance Hub</h1>
                </div>
                
                <Button variant="ghost" size="sm">
                  <Bell className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Page Header */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {navigationItems.find(item => item.id === activeTab)?.label || "Overview"}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {navigationItems.find(item => item.id === activeTab)?.description}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Button variant="outline" asChild className="w-full sm:w-auto">
                  <Link to="/app/profile">
                    <Plus className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Link>
                </Button>
                <Button asChild className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                  <Link to="/app/wallet">
                    <Wallet className="w-4 h-4 mr-2" />
                    View Wallet
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="p-6">
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
                ) : stats ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                      title="Total Earnings"
                      value={`$${stats.totalEarnings.toLocaleString()}`}
                      change="+12% this month"
                      icon={<DollarSign className="w-6 h-6 text-white" />}
                      color="bg-gradient-to-br from-green-500 to-emerald-600"
                    />
                    <StatCard
                      title="Active Projects"
                      value={stats.activeProjects}
                      icon={<Briefcase className="w-6 h-6 text-white" />}
                      color="bg-gradient-to-br from-blue-500 to-cyan-600"
                    />
                    <StatCard
                      title="Completed Projects"
                      value={stats.completedProjects}
                      icon={<CheckCircle2 className="w-6 h-6 text-white" />}
                      color="bg-gradient-to-br from-purple-500 to-violet-600"
                    />
                    <StatCard
                      title="Success Rate"
                      value={`${stats.successRate}%`}
                      icon={<Star className="w-6 h-6 text-white" />}
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
                        <Button variant="outline" size="sm" asChild>
                          <Link to="/app/freelance">
                            View All
                            <ExternalLink className="w-4 h-4 ml-1" />
                          </Link>
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
                              <ProjectCard key={project.id} project={project} />
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                              No active projects
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                              Start applying to jobs to see your projects here
                            </p>
                            <Button asChild>
                              <Link to="/app/freelance">Browse Jobs</Link>
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Activity className="w-5 h-5 text-purple-600" />
                          Recent Activity
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {getRecentActivities().map((activity) => (
                            <div key={activity.id} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                                {activity.type === "message" && <MessageCircle className="w-4 h-4 text-blue-600" />}
                                {activity.type === "payment" && <DollarSign className="w-4 h-4 text-green-600" />}
                                {activity.type === "milestone" && <Target className="w-4 h-4 text-purple-600" />}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-sm text-gray-900 dark:text-white">
                                  {activity.title}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  {activity.project}
                                </p>
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {activity.timestamp}
                              </p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Urgent Tasks */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-orange-600" />
                          Urgent Tasks
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {getUrgentTasks().map((task) => (
                            <div key={task.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                              <p className="font-medium text-sm mb-1 text-gray-900 dark:text-white">
                                {task.title}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                {task.project}
                              </p>
                              <div className="flex items-center justify-between">
                                <Badge variant={task.priority === "high" ? "destructive" : "secondary"}>
                                  {task.priority}
                                </Badge>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Due: {new Date(task.dueDate).toLocaleDateString()}
                                </p>
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
                          <TrendingUp className="w-5 h-5 text-purple-600" />
                          This Month
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Response Time</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">&lt; 2 hours</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Client Rating</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">4.9</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">On-time Delivery</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">98%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Repeat Clients</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">67%</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Quick Tools */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Zap className="w-5 h-5 text-green-600" />
                          Quick Tools
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <RateCalculator
                          trigger={
                            <Button variant="outline" className="w-full justify-start">
                              <BarChart3 className="w-4 h-4 mr-2" />
                              Rate Calculator
                            </Button>
                          }
                        />
                        <ProjectPlanner
                          trigger={
                            <Button variant="outline" className="w-full justify-start">
                              <Target className="w-4 h-4 mr-2" />
                              Project Planner
                            </Button>
                          }
                        />
                        <Button variant="outline" className="w-full justify-start" asChild>
                          <Link to="/app/rewards">
                            <Trophy className="w-4 h-4 mr-2" />
                            Achievements
                          </Link>
                        </Button>
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
                    <p className="text-gray-600 dark:text-gray-400">Manage all your active and completed projects</p>
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
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              </div>
            )}

            {activeTab === "campaigns" && (
              <UnifiedCampaignManager
                context="freelancer"
                entityId={user?.id}
                entityType="profile"
                showCreateButton={true}
                compact={false}
              />
            )}

            {activeTab === "ai-matching" && <SmartFreelanceMatching userType="freelancer" />}
            {activeTab === "business-intel" && <FreelanceBusinessIntelligence />}
            {activeTab === "collaboration" && <FreelanceCollaborationTools />}

            {/* Placeholder for other tabs */}
            {!["overview", "projects", "campaigns", "ai-matching", "business-intel", "collaboration"].includes(activeTab) && (
              <div className="text-center py-12">
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4">
                  <Briefcase className="w-8 h-8 text-gray-400 mx-auto" />
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
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedProject && (
        <ReviewForm
          project={selectedProject}
          userRole="freelancer"
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

export default FreelanceDashboard;
