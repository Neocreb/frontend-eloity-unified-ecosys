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
import {
  ArrowLeft,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  Calendar,
  Star,
  MessageCircle,
  Download,
  Eye,
  FileText,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Send,
  Upload,
  Flag,
  Users,
  Target,
  Award,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface WorkSubmission {
  id: string;
  projectId: string;
  projectTitle: string;
  freelancer: {
    id: string;
    name: string;
    avatar?: string;
    rating: number;
  };
  milestone: {
    id: string;
    title: string;
    description: string;
    amount: number;
    dueDate: Date;
  };
  submission: {
    title: string;
    description: string;
    submittedDate: Date;
    files: {
      id: string;
      name: string;
      type: string;
      size: number;
      url: string;
    }[];
    notes: string;
  };
  status: "pending" | "approved" | "rejected" | "revision-requested";
  priority: "low" | "medium" | "high";
  clientFeedback?: string;
  revisionCount: number;
  category: string;
}

const ApproveWork: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState<WorkSubmission | null>(null);
  const [feedback, setFeedback] = useState("");
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | "revision">("approve");
  
  // Filters
  const [filters, setFilters] = useState({
    status: "pending",
    priority: "all",
    category: "all",
    freelancer: "all",
  });

  const [submissions, setSubmissions] = useState<WorkSubmission[]>([
    {
      id: "ws1",
      projectId: "p1",
      projectTitle: "E-commerce Platform Development",
      freelancer: {
        id: "f1",
        name: "Sarah Johnson",
        avatar: "",
        rating: 4.9,
      },
      milestone: {
        id: "m1",
        title: "Frontend Development Complete",
        description: "Responsive frontend with all main pages implemented",
        amount: 2000,
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      submission: {
        title: "Frontend Development - Complete Implementation",
        description: "I have completed the frontend development with all requested features. The application is fully responsive and includes: Home page, Product catalog, Shopping cart, User authentication, and Payment flow. All components are optimized for performance and follow best practices.",
        submittedDate: new Date(Date.now() - 6 * 60 * 60 * 1000),
        files: [
          { id: "f1", name: "frontend-source-code.zip", type: "application/zip", size: 15728640, url: "#" },
          { id: "f2", name: "component-documentation.pdf", type: "application/pdf", size: 2048000, url: "#" },
          { id: "f3", name: "responsive-demo.mp4", type: "video/mp4", size: 25165824, url: "#" },
        ],
        notes: "Please test the responsive design on various devices. All components are fully documented.",
      },
      status: "pending",
      priority: "high",
      revisionCount: 0,
      category: "Web Development",
    },
    {
      id: "ws2",
      projectId: "p2",
      projectTitle: "Mobile App UI/UX Design",
      freelancer: {
        id: "f2",
        name: "Alex Chen",
        avatar: "",
        rating: 4.8,
      },
      milestone: {
        id: "m2",
        title: "High-Fidelity Designs",
        description: "Complete pixel-perfect UI designs for all app screens",
        amount: 1200,
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      submission: {
        title: "High-Fidelity UI Designs - All Screens",
        description: "Completed all high-fidelity designs for the fitness app including: Onboarding flow, Dashboard, Workout tracking, Progress analytics, Social features, and Settings. All designs follow iOS and Android guidelines.",
        submittedDate: new Date(Date.now() - 4 * 60 * 60 * 1000),
        files: [
          { id: "f4", name: "fitness-app-designs.fig", type: "application/figma", size: 8388608, url: "#" },
          { id: "f5", name: "design-system.pdf", type: "application/pdf", size: 3145728, url: "#" },
          { id: "f6", name: "prototype-demo.gif", type: "image/gif", size: 5242880, url: "#" },
        ],
        notes: "Included interactive prototype and comprehensive design system documentation.",
      },
      status: "pending",
      priority: "medium",
      revisionCount: 1,
      category: "Design",
    },
    {
      id: "ws3",
      projectId: "p3",
      projectTitle: "Data Analysis Dashboard",
      freelancer: {
        id: "f3",
        name: "Maria Rodriguez",
        avatar: "",
        rating: 4.9,
      },
      milestone: {
        id: "m3",
        title: "Data Visualization Module",
        description: "Interactive charts and analytics dashboard",
        amount: 1500,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      },
      submission: {
        title: "Interactive Data Visualization Dashboard",
        description: "Developed comprehensive analytics dashboard with real-time data visualization. Features include: Sales performance charts, Customer behavior analytics, Predictive modeling graphs, Export functionality, and Custom date range filtering.",
        submittedDate: new Date(Date.now() - 1 * 60 * 60 * 1000),
        files: [
          { id: "f7", name: "dashboard-source.py", type: "text/python", size: 1048576, url: "#" },
          { id: "f8", name: "data-models.csv", type: "text/csv", size: 524288, url: "#" },
          { id: "f9", name: "dashboard-demo.html", type: "text/html", size: 2097152, url: "#" },
        ],
        notes: "Dashboard is deployed on staging server for testing. All data models are optimized for performance.",
      },
      status: "revision-requested",
      priority: "medium",
      clientFeedback: "Please add more filtering options for the date ranges and include quarterly reports.",
      revisionCount: 1,
      category: "Data Science",
    },
    {
      id: "ws4",
      projectId: "p4",
      projectTitle: "Content Writing for Tech Blog",
      freelancer: {
        id: "f4",
        name: "David Kim",
        avatar: "",
        rating: 4.7,
      },
      milestone: {
        id: "m4",
        title: "First Batch of Articles",
        description: "6 high-quality tech articles with SEO optimization",
        amount: 900,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
      submission: {
        title: "Tech Blog Articles - First Batch (6 Articles)",
        description: "Completed 6 comprehensive articles covering: AI in Healthcare, Blockchain Security, Cloud Computing Trends, DevOps Best Practices, Mobile Development Future, and Cybersecurity Innovations. All articles are SEO-optimized and fact-checked.",
        submittedDate: new Date(Date.now() - 12 * 60 * 60 * 1000),
        files: [
          { id: "f10", name: "ai-healthcare-article.docx", type: "application/word", size: 262144, url: "#" },
          { id: "f11", name: "blockchain-security.docx", type: "application/word", size: 278528, url: "#" },
          { id: "f12", name: "seo-keywords.xlsx", type: "application/excel", size: 131072, url: "#" },
        ],
        notes: "All articles include relevant keywords and are ready for publication. Plagiarism reports included.",
      },
      status: "approved",
      priority: "low",
      clientFeedback: "Excellent work! Articles are well-researched and engaging.",
      revisionCount: 0,
      category: "Writing",
    },
  ]);

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = submission.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.freelancer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.milestone.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filters.status === "all" || submission.status === filters.status;
    const matchesPriority = filters.priority === "all" || submission.priority === filters.priority;
    const matchesCategory = filters.category === "all" || submission.category === filters.category;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "revision-requested":
        return "bg-blue-100 text-blue-800";
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

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return "Just now";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleWorkAction = async (submissionId: string, action: "approve" | "reject" | "revision") => {
    if ((action === "reject" || action === "revision") && !feedback.trim()) {
      toast.error("Please provide feedback for this action");
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newStatus = action === "approve" ? "approved" : 
                       action === "reject" ? "rejected" : "revision-requested";
      
      setSubmissions(prev => prev.map(submission => 
        submission.id === submissionId 
          ? { 
              ...submission, 
              status: newStatus as any,
              clientFeedback: feedback.trim() || undefined,
              revisionCount: action === "revision" ? submission.revisionCount + 1 : submission.revisionCount
            }
          : submission
      ));
      
      const actionText = action === "approve" ? "approved" : 
                        action === "reject" ? "rejected" : "revision requested";
      toast.success(`Work ${actionText} successfully!`);
      
      setShowFeedbackModal(false);
      setFeedback("");
      setSelectedSubmission(null);
    } catch (error) {
      toast.error(`Failed to ${action} work`);
    } finally {
      setLoading(false);
    }
  };

  const SubmissionCard: React.FC<{ submission: WorkSubmission }> = ({ submission }) => (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg line-clamp-2 mb-1">{submission.submission.title}</h3>
              <p className="text-muted-foreground font-medium mb-2">{submission.projectTitle}</p>
              
              <div className="flex items-center gap-2 mb-3">
                <Badge className={getStatusColor(submission.status)}>
                  {submission.status.replace('-', ' ')}
                </Badge>
                <Badge className={getPriorityColor(submission.priority)}>
                  {submission.priority} priority
                </Badge>
                {submission.revisionCount > 0 && (
                  <Badge variant="outline">
                    Rev: {submission.revisionCount}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-xl font-bold text-green-600">${submission.milestone.amount.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Milestone value</div>
            </div>
          </div>

          {/* Freelancer */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Avatar className="w-10 h-10">
              <AvatarImage src={submission.freelancer.avatar} />
              <AvatarFallback>{submission.freelancer.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="font-medium">{submission.freelancer.name}</div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span>{submission.freelancer.rating} rating</span>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              <MessageCircle className="w-4 h-4" />
            </Button>
          </div>

          {/* Submission Details */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground line-clamp-3">
              {submission.submission.description}
            </p>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <span className="text-muted-foreground">
                  <FileText className="w-4 h-4 inline mr-1" />
                  {submission.submission.files.length} files
                </span>
                <span className="text-muted-foreground">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Due: {submission.milestone.dueDate.toLocaleDateString()}
                </span>
              </div>
              <span className="text-muted-foreground">
                Submitted {getTimeAgo(submission.submission.submittedDate)}
              </span>
            </div>
          </div>

          {/* Client Feedback */}
          {submission.clientFeedback && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-blue-800 mb-1">Client Feedback:</div>
              <div className="text-sm text-blue-700">{submission.clientFeedback}</div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t">
            {submission.status === "pending" && (
              <>
                <Button
                  className="flex-1"
                  onClick={() => {
                    setSelectedSubmission(submission);
                    setActionType("approve");
                    setShowFeedbackModal(true);
                  }}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedSubmission(submission);
                    setActionType("revision");
                    setShowFeedbackModal(true);
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Request Revision
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedSubmission(submission);
                    setActionType("reject");
                    setShowFeedbackModal(true);
                  }}
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </>
            )}
            
            <Button
              variant="outline"
              onClick={() => setSelectedSubmission(submission)}
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
          <h1 className="text-2xl sm:text-3xl font-bold">Approve Work</h1>
          <p className="text-muted-foreground">Review and approve freelancer submissions</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {submissions.filter(s => s.status === "pending").length}
                </div>
                <div className="text-sm text-muted-foreground">Pending Review</div>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {submissions.filter(s => s.status === "approved").length}
                </div>
                <div className="text-sm text-muted-foreground">Approved</div>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {submissions.filter(s => s.status === "revision-requested").length}
                </div>
                <div className="text-sm text-muted-foreground">Revisions</div>
              </div>
              <RefreshCw className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  ${submissions.reduce((sum, s) => sum + s.milestone.amount, 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Value</div>
              </div>
              <DollarSign className="w-8 h-8 text-purple-500" />
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
                placeholder="Search submissions, projects, or freelancers..."
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
              <option value="pending">Pending</option>
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="revision-requested">Revision Requested</option>
              <option value="rejected">Rejected</option>
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
        <Tabs value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending">
              Pending ({submissions.filter(s => s.status === "pending").length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({submissions.filter(s => s.status === "approved").length})
            </TabsTrigger>
            <TabsTrigger value="revision-requested">
              Revisions ({submissions.filter(s => s.status === "revision-requested").length})
            </TabsTrigger>
            <TabsTrigger value="all">
              All ({submissions.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {filteredSubmissions.length > 0 ? (
          filteredSubmissions.map((submission) => (
            <SubmissionCard key={submission.id} submission={submission} />
          ))
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No submissions found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || filters.status !== "all" 
                    ? "Try adjusting your search or filters"
                    : "No work submissions are currently pending approval"
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Submission Details Modal */}
      {selectedSubmission && !showFeedbackModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{selectedSubmission.submission.title}</CardTitle>
                  <p className="text-muted-foreground">{selectedSubmission.projectTitle}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getStatusColor(selectedSubmission.status)}>
                      {selectedSubmission.status.replace('-', ' ')}
                    </Badge>
                    <Badge className={getPriorityColor(selectedSubmission.priority)}>
                      {selectedSubmission.priority} priority
                    </Badge>
                  </div>
                </div>
                <Button variant="ghost" onClick={() => setSelectedSubmission(null)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Submission Details */}
              <div>
                <h4 className="font-semibold mb-2">Submission Description</h4>
                <p className="text-muted-foreground">{selectedSubmission.submission.description}</p>
              </div>

              {/* Files */}
              <div>
                <h4 className="font-semibold mb-2">Submitted Files</h4>
                <div className="space-y-2">
                  {selectedSubmission.submission.files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-500" />
                        <div>
                          <div className="font-medium">{file.name}</div>
                          <div className="text-sm text-muted-foreground">{formatFileSize(file.size)}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          Preview
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {selectedSubmission.submission.notes && (
                <div>
                  <h4 className="font-semibold mb-2">Freelancer Notes</h4>
                  <p className="text-muted-foreground p-3 bg-gray-50 rounded-lg">
                    {selectedSubmission.submission.notes}
                  </p>
                </div>
              )}

              {/* Feedback */}
              {selectedSubmission.clientFeedback && (
                <div>
                  <h4 className="font-semibold mb-2">Previous Feedback</h4>
                  <p className="text-muted-foreground p-3 bg-blue-50 rounded-lg">
                    {selectedSubmission.clientFeedback}
                  </p>
                </div>
              )}

              {/* Actions */}
              {selectedSubmission.status === "pending" && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    onClick={() => {
                      setActionType("approve");
                      setShowFeedbackModal(true);
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Approve Work
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setActionType("revision");
                      setShowFeedbackModal(true);
                    }}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Request Revision
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setActionType("reject");
                      setShowFeedbackModal(true);
                    }}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Work
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <CardTitle>
                {actionType === "approve" && "Approve Work"}
                {actionType === "reject" && "Reject Work"}
                {actionType === "revision" && "Request Revision"}
              </CardTitle>
              <p className="text-muted-foreground">
                {actionType === "approve" && "Provide feedback and approve this submission"}
                {actionType === "reject" && "Please explain why you're rejecting this work"}
                {actionType === "revision" && "Explain what changes are needed"}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder={
                  actionType === "approve" 
                    ? "Leave positive feedback for the freelancer (optional)..."
                    : "Please provide detailed feedback..."
                }
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={6}
                required={actionType !== "approve"}
              />
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleWorkAction(selectedSubmission.id, actionType)}
                  disabled={loading || (actionType !== "approve" && !feedback.trim())}
                >
                  {loading ? "Processing..." : 
                   actionType === "approve" ? "Approve Work" :
                   actionType === "reject" ? "Reject Work" : "Request Revision"}
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

export default ApproveWork;
