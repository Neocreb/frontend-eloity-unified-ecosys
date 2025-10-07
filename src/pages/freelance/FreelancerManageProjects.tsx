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
  Package,
  Zap,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useFreelance } from "@/hooks/use-freelance";
import { Project } from "@/types/freelance";
import { toast } from "sonner";

const FreelancerManageProjects: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getProjects, loading } = useFreelance();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [projects, setProjects] = useState<Project[]>([]);
  
  // Filters
  const [filters, setFilters] = useState({
    status: "all",
    priority: "all",
    client: "all",
  });

  const [feedback, setFeedback] = useState("");
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");

  useEffect(() => {
    const loadProjects = async () => {
      if (!user) return;
      
      try {
        const projectsData = await getProjects(user.id, "freelancer");
        if (projectsData) {
          setProjects(projectsData);
        }
      } catch (error) {
        console.error("Error loading freelancer projects:", error);
        toast.error("Failed to load projects");
      }
    };

    loadProjects();
  }, [user, getProjects]);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = activeTab === "all" || project.status === activeTab;
    const matchesStatus = filters.status === "all" || project.status === filters.status;
    
    return matchesSearch && matchesTab && matchesStatus;
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
      case "pending":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTimeAgo = (date: Date | string) => {
    const now = new Date();
    const targetDate = typeof date === 'string' ? new Date(date) : date;
    const diff = now.getTime() - targetDate.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  const handleProjectUpdate = async (projectId: string, message: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Project update sent successfully!");
      setShowUpdateModal(false);
      setUpdateMessage("");
    } catch (error) {
      toast.error("Failed to send project update");
    }
  };

  const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
    const progressPercentage = 75; // This would come from actual calculation

    return (
      <Card className="hover:shadow-lg transition-all duration-200">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg line-clamp-2 mb-2">{project.job.title}</h3>
                <p className="text-muted-foreground text-sm line-clamp-2 mb-3">{project.job.description}</p>
                
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                  <Badge variant="outline">{project.job.category}</Badge>
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
                <span className="font-medium">{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            {/* Budget */}
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <div className="font-bold text-lg">${project.budget.agreed.toLocaleString()}</div>
                <div className="text-muted-foreground">Budget</div>
              </div>
              <div>
                <div className="font-bold text-lg text-green-600">${project.budget.paid.toLocaleString()}</div>
                <div className="text-muted-foreground">Earned</div>
              </div>
              <div>
                <div className="font-bold text-lg text-blue-600">${project.budget.remaining.toLocaleString()}</div>
                <div className="text-muted-foreground">Remaining</div>
              </div>
            </div>

            {/* Client */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Avatar className="w-10 h-10">
                <AvatarImage src={project.client.avatar} />
                <AvatarFallback>{project.client.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-medium">{project.client.name}</div>
                <div className="text-sm text-muted-foreground">Client</div>
              </div>
              <Button variant="ghost" size="sm">
                <MessageCircle className="w-4 h-4" />
              </Button>
            </div>

            {/* Timeline */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Due: {project.deadline ? new Date(project.deadline).toLocaleDateString() : "No deadline"}</span>
              </div>
              <div className="text-muted-foreground">
                Updated {getTimeAgo(project.updatedAt || new Date())}
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
              <Button variant="outline" onClick={() => setShowUpdateModal(true)}>
                <MessageCircle className="w-4 h-4" />
              </Button>
              <Button variant="outline">
                <Upload className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <Button
          variant="outline"
          onClick={() => navigate("/app/freelance")}
          className="w-full sm:w-auto"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="w-full sm:w-auto">
          <h1 className="text-2xl sm:text-3xl font-bold">My Projects</h1>
          <p className="text-muted-foreground">Manage and track your freelance projects</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" asChild>
            <Link to="/app/freelance/browse-jobs">
              <Search className="w-4 h-4 mr-2" />
              Browse Jobs
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
                <div className="text-2xl font-bold">${projects.reduce((sum, p) => sum + p.budget.paid, 0).toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Earned</div>
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
                  {projects.length > 0 ? Math.round(projects.reduce((sum, p) => sum + 75, 0) / projects.length) : 0}%
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
                placeholder="Search projects or clients..."
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
              <option value="pending">Pending</option>
              <option value="paused">Paused</option>
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
            <TabsTrigger value="pending">Pending ({projects.filter(p => p.status === "pending").length})</TabsTrigger>
            <TabsTrigger value="paused">Paused ({projects.filter(p => p.status === "paused").length})</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))
        ) : (
          <div className="col-span-full">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No projects found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || activeTab !== "all" 
                      ? "Try adjusting your search or filters"
                      : "Start applying to jobs to see your projects here"
                    }
                  </p>
                  <Button asChild>
                    <Link to="/app/freelance/browse-jobs">Browse Available Jobs</Link>
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
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{selectedProject.job.title}</CardTitle>
                  <p className="text-muted-foreground">{selectedProject.job.category}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getStatusColor(selectedProject.status)}>
                      {selectedProject.status}
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
                    <CardTitle className="text-lg">Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-4">
                      <div className="text-3xl font-bold">75%</div>
                      <div className="text-muted-foreground">Complete</div>
                    </div>
                    <Progress value={75} className="h-3" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Earnings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Budget</span>
                      <span className="font-bold">${selectedProject.budget.agreed.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Earned</span>
                      <span className="font-bold text-green-600">${selectedProject.budget.paid.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pending</span>
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
                      <span className="text-muted-foreground">Deadline</span>
                      <div className="font-medium">
                        {selectedProject.deadline ? new Date(selectedProject.deadline).toLocaleDateString() : "No deadline"}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button onClick={() => setShowUpdateModal(true)}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Send Update
                </Button>
                <Button variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Files
                </Button>
                <Button variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Meeting
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Update Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <CardTitle>Send Project Update</CardTitle>
              <p className="text-muted-foreground">
                Keep your client informed about the project progress
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Write your project update here..."
                value={updateMessage}
                onChange={(e) => setUpdateMessage(e.target.value)}
                rows={6}
              />
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleProjectUpdate(selectedProject?.id || "", updateMessage)}
                  disabled={!updateMessage.trim()}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Update
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowUpdateModal(false);
                    setUpdateMessage("");
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

export default FreelancerManageProjects;
