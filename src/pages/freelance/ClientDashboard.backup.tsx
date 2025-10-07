// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
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
  Search,
  Filter,
  Eye,
  ThumbsUp,
  ThumbsDown,
  CreditCard,
  Download,
  Upload,
  Edit,
  UserCheck,
  Menu,
  MoreVertical,
  ArrowUp,
  ArrowDown,
  Home,
  FolderOpen,
  HelpCircle,
  LogOut,
  Edit3,
  Share2,
} from "lucide-react";
import { Project, FreelanceStats } from "@/types/freelance";
import { useFreelance, useEscrow } from "@/hooks/use-freelance";
import { useAuth } from "@/contexts/AuthContext";
import TaskTracker from "@/components/freelance/TaskTracker";
import NegotiationChat from "@/components/freelance/NegotiationChat";
import ReviewForm from "@/components/freelance/ReviewForm";
import CreateJobModal from "@/components/freelance/CreateJobModal";
import FileUpload from "@/components/freelance/FileUpload";
import { Skeleton } from "@/components/ui/skeleton";
import { UnifiedCampaignManager } from "@/components/campaigns/UnifiedCampaignManager";
import { cn } from "@/lib/utils";

interface ClientStats {
  totalSpent: number;
  activeProjects: number;
  completedProjects: number;
  averageProjectRating: number;
  totalSavings: number;
  freelancersHired: number;
}

// Navigation items for the sidebar
const navigationItems = [
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
    description: "Manage your projects",
    badge: "5",
  },
  {
    id: "post-job",
    label: "Post Job",
    icon: Plus,
    description: "Create new job posting",
  },
  {
    id: "freelancers",
    label: "Freelancers",
    icon: Users,
    description: "Find & hire talent",
  },
  {
    id: "proposals",
    label: "Proposals",
    icon: FileText,
    description: "Review received proposals",
    badge: "12",
  },
  {
    id: "messages",
    label: "Messages",
    icon: MessageCircle,
    description: "Client communications",
    badge: "3",
  },
  {
    id: "payments",
    label: "Payments",
    icon: CreditCard,
    description: "Billing & transactions",
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

export const ClientDashboard: React.FC = () => {
  const [activeProjects, setActiveProjects] = useState<Project[]>([]);
  const [clientStats, setClientStats] = useState<ClientStats | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showCreateJobModal, setShowCreateJobModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  const { getProjects, loading } = useFreelance();
  const { getUserEscrows } = useEscrow();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        // Load projects where user is the client
        const projectsData = await getProjects(user.id, "client");
        if (projectsData) {
          setActiveProjects(projectsData);
          
          // Calculate client-specific stats
          const stats: ClientStats = {
            totalSpent: projectsData.reduce((sum, p) => sum + p.budget.paid, 0),
            activeProjects: projectsData.filter(p => p.status === "active").length,
            completedProjects: projectsData.filter(p => p.status === "completed").length,
            averageProjectRating: 4.7, // This would come from actual ratings
            totalSavings: projectsData.reduce((sum, p) => sum + (p.budget.market_rate - p.budget.agreed), 0),
            freelancersHired: new Set(projectsData.map(p => p.freelancer.id)).size,
          };
          setClientStats(stats);
        }
      } catch (error) {
        console.error("Error loading client data:", error);
      }
    };

    loadData();
  }, [user, getProjects]);

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
      case "pending":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getUrgentActions = () => {
    return [
      {
        id: "1",
        title: "Review milestone delivery",
        project: "E-commerce Platform",
        freelancer: "John Doe",
        dueDate: "2024-01-18",
        priority: "high",
        type: "review",
      },
      {
        id: "2",
        title: "Payment approval needed",
        project: "Mobile App Design",
        freelancer: "Jane Smith",
        dueDate: "2024-01-19",
        priority: "medium",
        type: "payment",
      },
      {
        id: "3",
        title: "Project scope clarification",
        project: "Website Redesign",
        freelancer: "Mike Johnson",
        dueDate: "2024-01-20",
        priority: "medium",
        type: "communication",
      },
    ];
  };

  const getRecentActivities = () => {
    return [
      {
        id: "1",
        type: "milestone",
        title: "Milestone completed by Alice Johnson",
        project: "E-commerce Platform",
        timestamp: "2 hours ago",
        action: "review",
      },
      {
        id: "2",
        type: "message",
        title: "New message from Bob Wilson",
        project: "Mobile App Design",
        timestamp: "1 day ago",
        action: "reply",
      },
      {
        id: "3",
        type: "proposal",
        title: "3 new proposals received",
        project: "Website Redesign",
        timestamp: "2 days ago",
        action: "review",
      },
    ];
  };

  const filteredProjects = activeProjects.filter((project) => {
    const matchesSearch = project.job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.freelancer.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || project.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const ProjectCard: React.FC<{ project: Project }> = ({ project }) => (
    <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
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
                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span>{project.freelancer.rating}</span>
                  <span>• {project.freelancer.skills?.[0]}</span>
                </div>
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
                  <CreditCard className="mr-2 h-4 w-4" />
                  Release Payment
                </DropdownMenuItem>
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
              className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
            >
              Manage Project
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

  // Sidebar component
  const Sidebar = ({ className }: { className?: string }) => (
    <div className={cn("flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700", className)}>
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg">
            <UserCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">Client Hub</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Welcome back, {user?.username}</p>
          </div>
        </div>
      </div>
      
      <ScrollArea className="flex-1 px-4 py-4">
        <nav className="space-y-2">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === "post-job") {
                  setShowCreateJobModal(true);
                } else {
                  setActiveTab(item.id);
                }
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all duration-200",
                activeTab === item.id
                  ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium">{item.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.description}</p>
              </div>
              {item.badge && (
                <Badge variant="secondary" className="text-xs">
                  {item.badge}
                </Badge>
              )}
            </button>
          ))}
        </nav>
        
        <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-3">
            Quick Links
          </p>
          <nav className="space-y-1">
            {secondaryItems.map((item) => (
              <Link
                key={item.id}
                to={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm">{item.label}</span>
                <ExternalLink className="w-3 h-3 ml-auto" />
              </Link>
            ))}
          </nav>
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-600 text-white">
              {user?.username?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
              {user?.username}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Client</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/app/profile">
                  <UserCheck className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/app/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
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
                  <TaskTracker projectId={selectedProject.id} userRole="client" />
                </div>
                
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Freelancer Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={selectedProject.freelancer.avatar} />
                          <AvatarFallback>{selectedProject.freelancer.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{selectedProject.freelancer.name}</p>
                          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span>{selectedProject.freelancer.rating} rating</span>
                          </div>
                        </div>
                      </div>
                      
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
                      
                      <div className="space-y-2">
                        <Button className="w-full">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Message Freelancer
                        </Button>
                        <Button variant="outline" className="w-full">
                          <CreditCard className="w-4 h-4 mr-2" />
                          Release Payment
                        </Button>
                        <Button variant="outline" className="w-full">
                          <Star className="w-4 h-4 mr-2" />
                          Leave Review
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

  // Main client dashboard view
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
                  <div className="p-2 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg">
                    <UserCheck className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="font-bold text-gray-900 dark:text-white">Client Hub</h1>
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
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateJobModal(true)}
                  className="w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Post New Job
                </Button>
                <Button asChild className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700">
                  <Link to="/app/freelance">
                    <Search className="w-4 h-4 mr-2" />
                    Find Freelancers
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="p-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Search and Filters */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <Input
                          placeholder="Search projects or freelancers..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <div className="flex gap-2">
                        <select
                          className="px-3 py-2 border rounded-md bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                        >
                          <option value="all">All Status</option>
                          <option value="active">Active</option>
                          <option value="completed">Completed</option>
                          <option value="pending">Pending</option>
                          <option value="disputed">Disputed</option>
                        </select>
                        <Button variant="outline">
                          <Filter className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

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
                  {/* Main Content */}
                  <div className="xl:col-span-2 space-y-6">
                    {/* Active Projects */}
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Layers className="w-5 h-5 text-green-600" />
                          Your Projects
                        </CardTitle>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setShowCreateJobModal(true)}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          New Project
                        </Button>
                      </CardHeader>
                      <CardContent>
                        {loading ? (
                          <div className="space-y-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                              <Skeleton key={i} className="h-40 w-full" />
                            ))}
                          </div>
                        ) : filteredProjects.length > 0 ? (
                          <div className="space-y-4">
                            {filteredProjects.slice(0, 3).map((project) => (
                              <ProjectCard key={project.id} project={project} />
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                              No projects found
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                              {searchTerm || filterStatus !== "all" 
                                ? "Try adjusting your search or filters"
                                : "Start by posting your first job to find talented freelancers"
                              }
                            </p>
                            <Button onClick={() => setShowCreateJobModal(true)}>
                              Post Your First Job
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
                                {activity.type === "milestone" && <Target className="w-4 h-4 text-blue-600" />}
                                {activity.type === "message" && <MessageCircle className="w-4 h-4 text-green-600" />}
                                {activity.type === "proposal" && <FileText className="w-4 h-4 text-purple-600" />}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-sm text-gray-900 dark:text-white">
                                  {activity.title}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  {activity.project}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {activity.timestamp}
                                </p>
                                <Button size="sm" variant="outline">
                                  {activity.action}
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
                    {/* Urgent Actions */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-orange-600" />
                          Action Required
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {getUrgentActions().map((action) => (
                            <div key={action.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                              <p className="font-medium text-sm mb-1 text-gray-900 dark:text-white">
                                {action.title}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                {action.project} • {action.freelancer}
                              </p>
                              <div className="flex items-center justify-between">
                                <Badge variant={action.priority === "high" ? "destructive" : "secondary"}>
                                  {action.priority}
                                </Badge>
                                <Button size="sm" variant="outline">
                                  {action.type === "review" && <Eye className="w-3 h-3 mr-1" />}
                                  {action.type === "payment" && <CreditCard className="w-3 h-3 mr-1" />}
                                  {action.type === "communication" && <MessageCircle className="w-3 h-3 mr-1" />}
                                  Action
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Client Performance */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-purple-600" />
                          Your Performance
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Project Success Rate</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">92%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Avg. Response Time</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">&lt; 4 hours</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Freelancer Rating</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">4.8/5</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Budget Efficiency</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">15% saved</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Zap className="w-5 h-5 text-green-600" />
                          Quick Actions
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => setShowCreateJobModal(true)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Post New Job
                        </Button>
                        <Button variant="outline" className="w-full justify-start" asChild>
                          <Link to="/app/freelance">
                            <Search className="w-4 h-4 mr-2" />
                            Browse Freelancers
                          </Link>
                        </Button>
                        <Button variant="outline" className="w-full justify-start" asChild>
                          <Link to="/app/wallet">
                            <Wallet className="w-4 h-4 mr-2" />
                            View Wallet
                          </Link>
                        </Button>
                        <Button variant="outline" className="w-full justify-start" asChild>
                          <Link to="/app/chat">
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Messages
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
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">All Projects</h2>
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
                  {filteredProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              </div>
            )}

            {activeTab === "campaigns" && (
              <UnifiedCampaignManager
                context="client"
                entityId={user?.id}
                entityType="job"
                showCreateButton={true}
                compact={false}
                maxCampaigns={10}
              />
            )}

            {/* Placeholder for other tabs */}
            {!["overview", "projects", "campaigns"].includes(activeTab) && (
              <div className="text-center py-12">
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4">
                  <UserCheck className="w-8 h-8 text-gray-400 mx-auto" />
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

      {/* Create Job Modal */}
      {showCreateJobModal && (
        <CreateJobModal
          isOpen={showCreateJobModal}
          onClose={() => setShowCreateJobModal(false)}
          onSubmit={(jobData) => {
            console.log("Job created:", jobData);
            setShowCreateJobModal(false);
            // Refresh projects
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
