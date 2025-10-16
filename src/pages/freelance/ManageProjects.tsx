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
  Plus,
  Eye,
  Edit,
  MoreVertical,
  Calendar,
  DollarSign,
  Clock,
  User,
  Star,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  PlayCircle,
  PauseCircle,
  MessageCircle,
  FileText,
  Download,
  Upload,
  Send,
  Award,
  Target,
  TrendingUp,
  Activity,
  Users,
  Briefcase,
  Archive,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Project {
  id: string;
  title: string;
  description: string;
  status: "active" | "completed" | "paused" | "cancelled" | "draft";
  progress: number;
  budget: {
    total: number;
    paid: number;
    remaining: number;
  };
  freelancer: {
    id: string;
    name: string;
    avatar?: string;
    rating: number;
    responseTime: string;
  };
  timeline: {
    startDate: Date;
    endDate: Date;
    deadline?: Date;
  };
  milestones: {
    id: string;
    title: string;
    description: string;
    amount: number;
    status: "pending" | "in-progress" | "completed" | "approved";
    dueDate?: Date;
    submittedDate?: Date;
  }[];
  category: string;
  skills: string[];
  lastUpdate: Date;
  messagesCount: number;
  filesCount: number;
  priority: "low" | "medium" | "high";
  clientSatisfaction?: number;
}

const ManageProjects: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Filters
  const [filters, setFilters] = useState({
    status: "all",
    priority: "all",
    category: "all",
    freelancer: "all",
  });

  const [projects, setProjects] = useState<Project[]>([
    {
      id: "p1",
      title: "E-commerce Platform Development",
      description: "Building a full-featured e-commerce platform with React, Node.js, and payment integration.",
      status: "active",
      progress: 75,
      budget: {
        total: 5000,
        paid: 3000,
        remaining: 2000,
      },
      freelancer: {
        id: "f1",
        name: "Sarah Johnson",
        avatar: "",
        rating: 4.9,
        responseTime: "< 1 hour",
      },
      timeline: {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      },
      milestones: [
        {
          id: "m1",
          title: "Frontend Development",
          description: "Complete responsive frontend with all main pages",
          amount: 2000,
          status: "completed",
          dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          submittedDate: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000),
        },
        {
          id: "m2",
          title: "Backend API Development",
          description: "RESTful API with authentication and payment processing",
          amount: 2000,
          status: "in-progress",
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        },
        {
          id: "m3",
          title: "Testing & Deployment",
          description: "Full testing suite and production deployment",
          amount: 1000,
          status: "pending",
          dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        },
      ],
      category: "Web Development",
      skills: ["React", "Node.js", "MongoDB", "Stripe"],
      lastUpdate: new Date(Date.now() - 2 * 60 * 60 * 1000),
      messagesCount: 23,
      filesCount: 8,
      priority: "high",
      clientSatisfaction: 4.8,
    },
    {
      id: "p2",
      title: "Mobile App UI/UX Design",
      description: "Complete UI/UX design for a fitness tracking mobile application with modern, intuitive interface.",
      status: "completed",
      progress: 100,
      budget: {
        total: 2500,
        paid: 2500,
        remaining: 0,
      },
      freelancer: {
        id: "f2",
        name: "Alex Chen",
        avatar: "",
        rating: 4.8,
        responseTime: "< 2 hours",
      },
      timeline: {
        startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        deadline: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      milestones: [
        {
          id: "m4",
          title: "Wireframes & User Flow",
          description: "Complete wireframes and user journey mapping",
          amount: 800,
          status: "completed",
          submittedDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
        },
        {
          id: "m5",
          title: "High-Fidelity Designs",
          description: "Pixel-perfect UI designs for all screens",
          amount: 1200,
          status: "completed",
          submittedDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        },
        {
          id: "m6",
          title: "Prototype & Handoff",
          description: "Interactive prototype and developer handoff",
          amount: 500,
          status: "completed",
          submittedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
      ],
      category: "Design",
      skills: ["Figma", "UI/UX Design", "Prototyping", "Mobile Design"],
      lastUpdate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      messagesCount: 15,
      filesCount: 12,
      priority: "medium",
      clientSatisfaction: 4.9,
    },
    {
      id: "p3",
      title: "Data Analysis Dashboard",
      description: "Python-based data analysis and visualization dashboard for sales and customer insights.",
      status: "active",
      progress: 45,
      budget: {
        total: 3200,
        paid: 1000,
        remaining: 2200,
      },
      freelancer: {
        id: "f3",
        name: "Maria Rodriguez",
        avatar: "",
        rating: 4.9,
        responseTime: "< 30 minutes",
      },
      timeline: {
        startDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      },
      milestones: [
        {
          id: "m7",
          title: "Data Collection & Cleaning",
          description: "Set up data pipelines and clean existing datasets",
          amount: 1000,
          status: "completed",
          submittedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        },
        {
          id: "m8",
          title: "Analysis & Insights",
          description: "Statistical analysis and key insights generation",
          amount: 1200,
          status: "in-progress",
          dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        },
        {
          id: "m9",
          title: "Dashboard Development",
          description: "Interactive dashboard with visualizations",
          amount: 1000,
          status: "pending",
          dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        },
      ],
      category: "Data Science",
      skills: ["Python", "Pandas", "Plotly", "Machine Learning"],
      lastUpdate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      messagesCount: 31,
      filesCount: 5,
      priority: "medium",
    },
    {
      id: "p4",
      title: "Content Writing for Tech Blog",
      description: "Weekly tech blog articles covering AI, blockchain, and software development trends.",
      status: "paused",
      progress: 30,
      budget: {
        total: 1800,
        paid: 600,
        remaining: 1200,
      },
      freelancer: {
        id: "f4",
        name: "David Kim",
        avatar: "",
        rating: 4.7,
        responseTime: "< 3 hours",
      },
      timeline: {
        startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      milestones: [
        {
          id: "m10",
          title: "Content Strategy",
          description: "Content calendar and topic research",
          amount: 300,
          status: "completed",
          submittedDate: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000),
        },
        {
          id: "m11",
          title: "First 6 Articles",
          description: "Research and write first batch of articles",
          amount: 900,
          status: "in-progress",
          dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        },
        {
          id: "m12",
          title: "SEO Optimization",
          description: "Optimize all articles for search engines",
          amount: 600,
          status: "pending",
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      ],
      category: "Writing",
      skills: ["Content Writing", "Technical Writing", "SEO", "Research"],
      lastUpdate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      messagesCount: 8,
      filesCount: 3,
      priority: "low",
    },
  ]);

  const [feedback, setFeedback] = useState("");
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.freelancer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTab = activeTab === "all" || project.status === activeTab;
    const matchesStatus = filters.status === "all" || project.status === filters.status;
    const matchesPriority = filters.priority === "all" || project.priority === filters.priority;
    const matchesCategory = filters.category === "all" || project.category === filters.category;
    
    return matchesSearch && matchesTab && matchesStatus && matchesPriority && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getMilestoneStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "approved":
        return "bg-blue-100 text-blue-800";
      case "in-progress":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  const handleProjectAction = async (projectId: string, action: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProjects(prev => prev.map(project => 
        project.id === projectId 
          ? { ...project, status: action as any }
          : project
      ));
      
      toast.success(`Project ${action} successfully`);
    } catch (error) {
      toast.error(`Failed to ${action} project`);
    } finally {
      setLoading(false);
    }
  };

  const handleMilestoneAction = async (projectId: string, milestoneId: string, action: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProjects(prev => prev.map(project => 
        project.id === projectId 
          ? {
              ...project,
              milestones: project.milestones.map(milestone =>
                milestone.id === milestoneId
                  ? { ...milestone, status: action as any }
                  : milestone
              )
            }
          : project
      ));
      
      toast.success(`Milestone ${action} successfully`);
    } catch (error) {
      toast.error(`Failed to ${action} milestone`);
    } finally {
      setLoading(false);
    }
  };

  const ProjectCard: React.FC<{ project: Project }> = ({ project }) => (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg line-clamp-2 mb-2">{project.title}</h3>
              <p className="text-muted-foreground text-sm line-clamp-2 mb-3">{project.description}</p>
              
              <div className="flex items-center gap-2 mb-3">
                <Badge className={getStatusColor(project.status)}>
                  {project.status}
                </Badge>
                <Badge className={getPriorityColor(project.priority)}>
                  {project.priority} priority
                </Badge>
                <Badge variant="outline">{project.category}</Badge>
              </div>
            </div>
            
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>

          {/* Progress */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-2" />
          </div>

          {/* Budget */}
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="font-bold text-lg">${project.budget.total.toLocaleString()}</div>
              <div className="text-muted-foreground">Total</div>
            </div>
            <div>
              <div className="font-bold text-lg text-green-600">${project.budget.paid.toLocaleString()}</div>
              <div className="text-muted-foreground">Paid</div>
            </div>
            <div>
              <div className="font-bold text-lg text-blue-600">${project.budget.remaining.toLocaleString()}</div>
              <div className="text-muted-foreground">Remaining</div>
            </div>
          </div>

          {/* Freelancer */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Avatar className="w-10 h-10">
              <AvatarImage src={project.freelancer.avatar} />
              <AvatarFallback>{project.freelancer.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="font-medium">{project.freelancer.name}</div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span>{project.freelancer.rating}</span>
                </div>
                <span>•</span>
                <span>{project.freelancer.responseTime}</span>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              <MessageCircle className="w-4 h-4" />
            </Button>
          </div>

          {/* Timeline */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Due: {project.timeline.deadline?.toLocaleDateString() || "No deadline"}</span>
            </div>
            <div className="text-muted-foreground">
              Updated {getTimeAgo(project.lastUpdate)}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t">
            <Button
              className="flex-1"
              onClick={() => setSelectedProject(project)}
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
            <Button variant="outline">
              <MessageCircle className="w-4 h-4" />
            </Button>
            <Button variant="outline">
              <Edit className="w-4 h-4" />
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
          <h1 className="text-2xl sm:text-3xl font-bold">Manage Projects</h1>
          <p className="text-muted-foreground">Oversee and track your ongoing projects</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" asChild>
            <Link to="/app/freelance/post-job">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{projects.filter(p => p.status === "active").length}</div>
                <div className="text-sm text-muted-foreground">Active Projects</div>
              </div>
              <PlayCircle className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">${projects.reduce((sum, p) => sum + p.budget.total, 0).toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Budget</div>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{projects.filter(p => p.status === "completed").length}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <CheckCircle2 className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)}%
                </div>
                <div className="text-sm text-muted-foreground">Avg Progress</div>
              </div>
              <Target className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search projects, freelancers, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              className="px-3 py-2 border rounded-md"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="paused">Paused</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              className="px-3 py-2 border rounded-md"
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <Button variant="outline">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Status Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All ({projects.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({projects.filter(p => p.status === "active").length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({projects.filter(p => p.status === "completed").length})</TabsTrigger>
            <TabsTrigger value="paused">Paused ({projects.filter(p => p.status === "paused").length})</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled ({projects.filter(p => p.status === "cancelled").length})</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))
        ) : (
          <div className="col-span-full">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Briefcase className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No projects found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || activeTab !== "all" 
                      ? "Try adjusting your search or filters"
                      : "Start by posting your first job to hire freelancers"
                    }
                  </p>
                  <Button asChild>
                    <Link to="/app/freelance/post-job">Post Your First Job</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{selectedProject.title}</CardTitle>
                  <p className="text-muted-foreground">{selectedProject.category}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getStatusColor(selectedProject.status)}>
                      {selectedProject.status}
                    </Badge>
                    <Badge className={getPriorityColor(selectedProject.priority)}>
                      {selectedProject.priority} priority
                    </Badge>
                  </div>
                </div>
                <Button variant="ghost" onClick={() => setSelectedProject(null)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Project Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Project Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-4">
                      <div className="text-3xl font-bold">{selectedProject.progress}%</div>
                      <div className="text-muted-foreground">Complete</div>
                    </div>
                    <Progress value={selectedProject.progress} className="h-3" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Budget Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total Budget</span>
                      <span className="font-bold">${selectedProject.budget.total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Paid</span>
                      <span className="font-bold text-green-600">${selectedProject.budget.paid.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Remaining</span>
                      <span className="font-bold text-blue-600">${selectedProject.budget.remaining.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Timeline</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-muted-foreground">Started</span>
                      <div className="font-medium">{selectedProject.timeline.startDate.toLocaleDateString()}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Deadline</span>
                      <div className="font-medium">
                        {selectedProject.timeline.deadline?.toLocaleDateString() || "No deadline"}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last Update</span>
                      <div className="font-medium">{getTimeAgo(selectedProject.lastUpdate)}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Freelancer Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Freelancer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={selectedProject.freelancer.avatar} />
                      <AvatarFallback className="text-lg">{selectedProject.freelancer.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{selectedProject.freelancer.name}</h3>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>{selectedProject.freelancer.rating} rating</span>
                        </div>
                        <span className="text-muted-foreground">•</span>
                        <span>{selectedProject.freelancer.responseTime} response</span>
                      </div>
                      {selectedProject.clientSatisfaction && (
                        <div className="mt-2">
                          <span className="text-sm text-muted-foreground">Client Satisfaction: </span>
                          <span className="font-medium">{selectedProject.clientSatisfaction}/5.0</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Message
                      </Button>
                      <Button variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        Profile
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Milestones */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Project Milestones</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedProject.milestones.map((milestone, index) => (
                      <div key={milestone.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold">{milestone.title}</h4>
                            <p className="text-muted-foreground text-sm">{milestone.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getMilestoneStatusColor(milestone.status)}>
                              {milestone.status}
                            </Badge>
                            <span className="font-bold">${milestone.amount}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="text-muted-foreground">
                            {milestone.dueDate && `Due: ${milestone.dueDate.toLocaleDateString()}`}
                            {milestone.submittedDate && ` • Submitted: ${milestone.submittedDate.toLocaleDateString()}`}
                          </div>
                          
                          {milestone.status === "in-progress" && (
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <MessageCircle className="w-3 h-3 mr-1" />
                                Comment
                              </Button>
                            </div>
                          )}
                          
                          {milestone.status === "completed" && (
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                onClick={() => handleMilestoneAction(selectedProject.id, milestone.id, "approved")}
                              >
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Approve
                              </Button>
                              <Button size="sm" variant="outline">
                                <XCircle className="w-3 h-3 mr-1" />
                                Request Changes
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Project Actions */}
              <div className="flex gap-2 pt-4 border-t">
                {selectedProject.status === "active" && (
                  <>
                    <Button 
                      variant="outline"
                      onClick={() => handleProjectAction(selectedProject.id, "paused")}
                    >
                      <PauseCircle className="w-4 h-4 mr-2" />
                      Pause Project
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setShowFeedbackModal(true)}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Send Feedback
                    </Button>
                  </>
                )}
                
                {selectedProject.status === "paused" && (
                  <Button 
                    onClick={() => handleProjectAction(selectedProject.id, "active")}
                  >
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Resume Project
                  </Button>
                )}

                {selectedProject.status === "completed" && (
                  <Button variant="outline">
                    <Star className="w-4 h-4 mr-2" />
                    Leave Review
                  </Button>
                )}

                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download Files
                </Button>

                <Button variant="outline">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View in Detail
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <CardTitle>Send Feedback</CardTitle>
              <p className="text-muted-foreground">
                Share feedback with {selectedProject.freelancer.name} about the project progress
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Write your feedback here..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={6}
              />
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    toast.success("Feedback sent successfully!");
                    setShowFeedbackModal(false);
                    setFeedback("");
                  }}
                  disabled={!feedback.trim()}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Feedback
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowFeedbackModal(false);
                    setFeedback("");
                  }}
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

export default ManageProjects;
