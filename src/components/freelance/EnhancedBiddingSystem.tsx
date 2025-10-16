// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DollarSign,
  Clock,
  Star,
  MessageCircle,
  FileText,
  TrendingUp,
  Award,
  Calendar,
  Target,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MoreVertical,
  ThumbsUp,
  ThumbsDown,
  Edit,
  Send,
  Plus,
  Minus,
  Users,
  Briefcase,
  Eye,
  Download,
  Filter,
  Search,
} from "lucide-react";
import { JobPosting, FreelancerProfile } from "@/types/freelance";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface EnhancedProposal {
  id: string;
  jobId: string;
  freelancer: FreelancerProfile;
  coverLetter: string;
  proposedRate: {
    type: "fixed" | "hourly";
    amount: number;
    currency: string;
  };
  deliveryTime: string;
  milestones: {
    id: string;
    title: string;
    description: string;
    amount: number;
    deliveryDays: number;
  }[];
  attachments: {
    id: string;
    name: string;
    url: string;
    type: string;
  }[];
  submittedDate: string;
  status:
    | "pending"
    | "shortlisted"
    | "interviewing"
    | "accepted"
    | "rejected"
    | "withdrawn";
  clientViews: number;
  clientNotes?: string;
  negotiationHistory: {
    id: string;
    type: "counteroffer" | "question" | "acceptance" | "rejection";
    fromUser: "client" | "freelancer";
    content: string;
    proposedChanges?: {
      rate?: number;
      deliveryTime?: string;
      scope?: string;
    };
    timestamp: string;
  }[];
  rating?: {
    communication: number;
    expertise: number;
    professionalism: number;
    overall: number;
  };
}

interface BiddingSystemProps {
  job: JobPosting;
  userRole: "client" | "freelancer";
  currentUserId: string;
}

export const EnhancedBiddingSystem: React.FC<BiddingSystemProps> = ({
  job,
  userRole,
  currentUserId,
}) => {
  const [proposals, setProposals] = useState<EnhancedProposal[]>([]);
  const [selectedProposal, setSelectedProposal] =
    useState<EnhancedProposal | null>(null);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [showNegotiationDialog, setShowNegotiationDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [filterBy, setFilterBy] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [proposalForm, setProposalForm] = useState({
    coverLetter: "",
    rateType: "fixed" as "fixed" | "hourly",
    amount: 0,
    deliveryTime: "",
    milestones: [{ title: "", description: "", amount: 0, deliveryDays: 0 }],
  });
  const [negotiationMessage, setNegotiationMessage] = useState("");
  const [counterOffer, setCounterOffer] = useState({
    rate: 0,
    deliveryTime: "",
    scope: "",
  });

  const { toast } = useToast();

  // Mock proposals data
  useEffect(() => {
    const mockProposals: EnhancedProposal[] = [
      {
        id: "prop_1",
        jobId: job.id,
        freelancer: {
          id: "freelancer_1",
          name: "Sarah Chen",
          email: "sarah@example.com",
          avatar:
            "https://images.unsplash.com/photo-1494790108755-2616b612b5c5?w=100&h=100&fit=crop&crop=face",
          location: "San Francisco, CA",
          timezone: "PST",
          verified: true,
          joinedDate: "2022-03-15",
          title: "Senior Full-Stack Developer",
          bio: "Experienced developer with 8+ years in React and Node.js. Specialized in building scalable web applications for startups and enterprises.",
          hourlyRate: 95,
          skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "AWS"],
          rating: 4.9,
          totalEarned: 180000,
          completedJobs: 87,
          successRate: 98,
          languages: ["English (Native)", "Spanish (Conversational)"],
          education: [],
          certifications: [],
          portfolio: [],
          availability: "available",
          responseTime: "within 2 hours",
        },
        coverLetter:
          "I'm excited about this project and believe my 8+ years of experience with React and Node.js makes me a perfect fit. I've built similar e-commerce platforms and can deliver high-quality, scalable code. I'm available to start immediately and can commit to your timeline.",
        proposedRate: {
          type: "fixed",
          amount: 4500,
          currency: "USD",
        },
        deliveryTime: "14 days",
        milestones: [
          {
            id: "mil_1",
            title: "Project Setup & UI Design",
            description: "Set up project structure and create UI components",
            amount: 1500,
            deliveryDays: 5,
          },
          {
            id: "mil_2",
            title: "Backend Development",
            description: "API development and database setup",
            amount: 2000,
            deliveryDays: 7,
          },
          {
            id: "mil_3",
            title: "Testing & Deployment",
            description: "Testing, bug fixes, and deployment",
            amount: 1000,
            deliveryDays: 2,
          },
        ],
        attachments: [
          {
            id: "att_1",
            name: "portfolio.pdf",
            url: "/files/portfolio.pdf",
            type: "application/pdf",
          },
        ],
        submittedDate: "2024-01-15T10:30:00Z",
        status: "shortlisted",
        clientViews: 3,
        clientNotes: "Impressive portfolio and experience",
        negotiationHistory: [
          {
            id: "neg_1",
            type: "question",
            fromUser: "client",
            content:
              "Can you provide more details about your testing approach?",
            timestamp: "2024-01-16T14:20:00Z",
          },
          {
            id: "neg_2",
            type: "counteroffer",
            fromUser: "freelancer",
            content:
              "I use comprehensive testing including unit tests, integration tests, and end-to-end testing with Cypress.",
            timestamp: "2024-01-16T15:45:00Z",
          },
        ],
        rating: {
          communication: 5,
          expertise: 5,
          professionalism: 4,
          overall: 4.7,
        },
      },
      {
        id: "prop_2",
        jobId: job.id,
        freelancer: {
          id: "freelancer_2",
          name: "Alex Rodriguez",
          email: "alex@example.com",
          avatar:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
          location: "Austin, TX",
          timezone: "CST",
          verified: true,
          joinedDate: "2021-08-20",
          title: "Full-Stack Developer & DevOps Engineer",
          bio: "Passionate developer with strong DevOps background. I build fast, secure applications with modern deployment practices.",
          hourlyRate: 75,
          skills: ["React", "Python", "Docker", "AWS", "CI/CD"],
          rating: 4.7,
          totalEarned: 125000,
          completedJobs: 64,
          successRate: 96,
          languages: ["English (Native)", "Portuguese (Fluent)"],
          education: [],
          certifications: [],
          portfolio: [],
          availability: "available",
          responseTime: "within 4 hours",
        },
        coverLetter:
          "Hello! I'm very interested in this project. With my background in full-stack development and DevOps, I can not only build the application but also set up proper CI/CD pipelines and cloud infrastructure. I offer competitive rates and quick turnaround.",
        proposedRate: {
          type: "fixed",
          amount: 3800,
          currency: "USD",
        },
        deliveryTime: "18 days",
        milestones: [
          {
            id: "mil_1",
            title: "Frontend Development",
            description: "React application with responsive design",
            amount: 2000,
            deliveryDays: 10,
          },
          {
            id: "mil_2",
            title: "Backend & DevOps Setup",
            description: "API, database, and deployment infrastructure",
            amount: 1800,
            deliveryDays: 8,
          },
        ],
        attachments: [],
        submittedDate: "2024-01-15T16:45:00Z",
        status: "pending",
        clientViews: 1,
        negotiationHistory: [],
      },
      {
        id: "prop_3",
        jobId: job.id,
        freelancer: {
          id: "freelancer_3",
          name: "Emma Thompson",
          email: "emma@example.com",
          avatar:
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
          location: "London, UK",
          timezone: "GMT",
          verified: true,
          joinedDate: "2020-11-10",
          title: "UI/UX Designer & Frontend Developer",
          bio: "Creative designer and developer focused on user experience. I create beautiful, intuitive interfaces that users love.",
          hourlyRate: 65,
          skills: ["React", "UI/UX Design", "Figma", "TypeScript"],
          rating: 4.8,
          totalEarned: 95000,
          completedJobs: 52,
          successRate: 94,
          languages: ["English (Native)", "French (Conversational)"],
          education: [],
          certifications: [],
          portfolio: [],
          availability: "busy",
          responseTime: "within 6 hours",
        },
        coverLetter:
          "I specialize in creating exceptional user experiences with modern React applications. My design-first approach ensures your users will have an intuitive and engaging experience. I'd love to contribute my expertise to your project.",
        proposedRate: {
          type: "hourly",
          amount: 65,
          currency: "USD",
        },
        deliveryTime: "21 days",
        milestones: [
          {
            id: "mil_1",
            title: "UX Research & Design",
            description: "User research and UI/UX design",
            amount: 1200,
            deliveryDays: 7,
          },
          {
            id: "mil_2",
            title: "Frontend Implementation",
            description: "React development based on designs",
            amount: 2300,
            deliveryDays: 14,
          },
        ],
        attachments: [
          {
            id: "att_1",
            name: "design-samples.pdf",
            url: "/files/design-samples.pdf",
            type: "application/pdf",
          },
        ],
        submittedDate: "2024-01-14T09:15:00Z",
        status: "interviewing",
        clientViews: 5,
        clientNotes: "Great design skills, scheduling interview",
        negotiationHistory: [
          {
            id: "neg_1",
            type: "question",
            fromUser: "client",
            content: "Would you be available for a quick video call this week?",
            timestamp: "2024-01-15T11:30:00Z",
          },
        ],
      },
    ];

    setProposals(mockProposals);
  }, [job.id]);

  const getStatusColor = (status: EnhancedProposal["status"]) => {
    switch (status) {
      case "pending":
        return "bg-gray-100 text-gray-800";
      case "shortlisted":
        return "bg-blue-100 text-blue-800";
      case "interviewing":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "withdrawn":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredProposals = proposals.filter((proposal) => {
    const matchesSearch =
      proposal.freelancer.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      proposal.coverLetter.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filterBy === "all" || proposal.status === filterBy;

    return matchesSearch && matchesFilter;
  });

  const sortedProposals = [...filteredProposals].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return (
          new Date(b.submittedDate).getTime() -
          new Date(a.submittedDate).getTime()
        );
      case "oldest":
        return (
          new Date(a.submittedDate).getTime() -
          new Date(b.submittedDate).getTime()
        );
      case "price_low":
        return a.proposedRate.amount - b.proposedRate.amount;
      case "price_high":
        return b.proposedRate.amount - a.proposedRate.amount;
      case "rating":
        return (b.rating?.overall || 0) - (a.rating?.overall || 0);
      default:
        return 0;
    }
  });

  const handleStatusUpdate = (
    proposalId: string,
    newStatus: EnhancedProposal["status"],
  ) => {
    setProposals((prev) =>
      prev.map((proposal) =>
        proposal.id === proposalId
          ? { ...proposal, status: newStatus }
          : proposal,
      ),
    );

    toast({
      title: "Status Updated",
      description: `Proposal status changed to ${newStatus}`,
    });
  };

  const handleSendNegotiationMessage = () => {
    if (!selectedProposal || !negotiationMessage.trim()) return;

    const newMessage = {
      id: `neg_${Date.now()}`,
      type: "question" as const,
      fromUser: userRole,
      content: negotiationMessage,
      timestamp: new Date().toISOString(),
    };

    setProposals((prev) =>
      prev.map((proposal) =>
        proposal.id === selectedProposal.id
          ? {
              ...proposal,
              negotiationHistory: [...proposal.negotiationHistory, newMessage],
            }
          : proposal,
      ),
    );

    setNegotiationMessage("");
    toast({
      title: "Message Sent",
      description: "Your message has been sent to the freelancer",
    });
  };

  const handleCounterOffer = () => {
    if (!selectedProposal) return;

    const counterOfferMessage = {
      id: `neg_${Date.now()}`,
      type: "counteroffer" as const,
      fromUser: userRole,
      content: `Counter offer: $${counterOffer.rate}, delivery in ${counterOffer.deliveryTime}`,
      proposedChanges: counterOffer,
      timestamp: new Date().toISOString(),
    };

    setProposals((prev) =>
      prev.map((proposal) =>
        proposal.id === selectedProposal.id
          ? {
              ...proposal,
              negotiationHistory: [
                ...proposal.negotiationHistory,
                counterOfferMessage,
              ],
            }
          : proposal,
      ),
    );

    setCounterOffer({ rate: 0, deliveryTime: "", scope: "" });
    setShowNegotiationDialog(false);
    toast({
      title: "Counter Offer Sent",
      description: "Your counter offer has been sent",
    });
  };

  const ProposalCard: React.FC<{ proposal: EnhancedProposal }> = ({
    proposal,
  }) => (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => setSelectedProposal(proposal)}
    >
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Freelancer Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={proposal.freelancer.avatar} />
                <AvatarFallback>{proposal.freelancer.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{proposal.freelancer.name}</h3>
                  {proposal.freelancer.verified && (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {proposal.freelancer.title}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span>{proposal.freelancer.rating}</span>
                  </div>
                  <span>{proposal.freelancer.completedJobs} jobs</span>
                  <span>{proposal.freelancer.successRate}% success</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <Badge className={getStatusColor(proposal.status)}>
                {proposal.status}
              </Badge>
              <div className="text-sm text-muted-foreground mt-1">
                {proposal.clientViews} views
              </div>
            </div>
          </div>

          {/* Proposal Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-green-600 font-semibold text-sm">
                Proposed Rate
              </div>
              <div className="text-lg font-bold">
                ${proposal.proposedRate.amount}
                {proposal.proposedRate.type === "hourly" && "/hr"}
              </div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-blue-600 font-semibold text-sm">
                Delivery Time
              </div>
              <div className="text-lg font-bold">{proposal.deliveryTime}</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="text-purple-600 font-semibold text-sm">
                Milestones
              </div>
              <div className="text-lg font-bold">
                {proposal.milestones.length}
              </div>
            </div>
          </div>

          {/* Cover Letter Preview */}
          <div>
            <h4 className="font-medium mb-2">Cover Letter</h4>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {proposal.coverLetter}
            </p>
          </div>

          {/* Skills */}
          <div>
            <div className="flex flex-wrap gap-1">
              {proposal.freelancer.skills.slice(0, 4).map((skill) => (
                <Badge key={skill} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {proposal.freelancer.skills.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{proposal.freelancer.skills.length - 4} more
                </Badge>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="text-sm text-muted-foreground">
              Submitted{" "}
              {formatDistanceToNow(new Date(proposal.submittedDate), {
                addSuffix: true,
              })}
            </div>
            {userRole === "client" && (
              <div className="flex gap-2">
                {proposal.status === "pending" && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusUpdate(proposal.id, "shortlisted");
                      }}
                    >
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      Shortlist
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusUpdate(proposal.id, "rejected");
                      }}
                    >
                      <ThumbsDown className="w-4 h-4 mr-1" />
                      Decline
                    </Button>
                  </>
                )}
                {proposal.status === "shortlisted" && (
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusUpdate(proposal.id, "interviewing");
                    }}
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Interview
                  </Button>
                )}
                {proposal.status === "interviewing" && (
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusUpdate(proposal.id, "accepted");
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Accept
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Proposals ({proposals.length})</h2>
          <p className="text-muted-foreground">
            Manage proposals for: {job.title}
          </p>
        </div>
        {userRole === "freelancer" && (
          <Button onClick={() => setShowProposalForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Submit Proposal
          </Button>
        )}
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search proposals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={filterBy} onValueChange={setFilterBy}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="shortlisted">Shortlisted</SelectItem>
            <SelectItem value="interviewing">Interviewing</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="price_low">Price: Low to High</SelectItem>
            <SelectItem value="price_high">Price: High to Low</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Status Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All ({proposals.length})</TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({proposals.filter((p) => p.status === "pending").length})
          </TabsTrigger>
          <TabsTrigger value="shortlisted">
            Shortlisted (
            {proposals.filter((p) => p.status === "shortlisted").length})
          </TabsTrigger>
          <TabsTrigger value="interviewing">
            Interviewing (
            {proposals.filter((p) => p.status === "interviewing").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {sortedProposals.length > 0 ? (
            sortedProposals.map((proposal) => (
              <ProposalCard key={proposal.id} proposal={proposal} />
            ))
          ) : (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium">No proposals found</h3>
              <p className="text-muted-foreground">
                {proposals.length === 0
                  ? "No proposals have been submitted yet"
                  : "No proposals match your current filters"}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Proposal Details Modal */}
      {selectedProposal && (
        <Dialog
          open={!!selectedProposal}
          onOpenChange={() => setSelectedProposal(null)}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={selectedProposal.freelancer.avatar} />
                  <AvatarFallback>
                    {selectedProposal.freelancer.name[0]}
                  </AvatarFallback>
                </Avatar>
                Proposal from {selectedProposal.freelancer.name}
              </DialogTitle>
            </DialogHeader>

            <Tabs defaultValue="proposal" className="space-y-6">
              <TabsList>
                <TabsTrigger value="proposal">Proposal Details</TabsTrigger>
                <TabsTrigger value="milestones">Milestones</TabsTrigger>
                <TabsTrigger value="negotiation">
                  Negotiation ({selectedProposal.negotiationHistory.length})
                </TabsTrigger>
                <TabsTrigger value="freelancer">Freelancer Profile</TabsTrigger>
              </TabsList>

              <TabsContent value="proposal" className="space-y-6">
                {/* Proposal Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-600" />
                        <div className="text-2xl font-bold">
                          ${selectedProposal.proposedRate.amount}
                          {selectedProposal.proposedRate.type === "hourly" &&
                            "/hr"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {selectedProposal.proposedRate.type === "fixed"
                            ? "Fixed Price"
                            : "Hourly Rate"}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Clock className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                        <div className="text-2xl font-bold">
                          {selectedProposal.deliveryTime}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Delivery Time
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Target className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                        <div className="text-2xl font-bold">
                          {selectedProposal.milestones.length}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Milestones
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Cover Letter */}
                <Card>
                  <CardHeader>
                    <CardTitle>Cover Letter</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{selectedProposal.coverLetter}</p>
                  </CardContent>
                </Card>

                {/* Attachments */}
                {selectedProposal.attachments.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Attachments</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {selectedProposal.attachments.map((attachment) => (
                          <div
                            key={attachment.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="w-5 h-5" />
                              <span className="font-medium">
                                {attachment.name}
                              </span>
                            </div>
                            <Button size="sm" variant="outline">
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="milestones">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Milestones</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedProposal.milestones.map((milestone, index) => (
                        <div
                          key={milestone.id}
                          className="flex items-start gap-4 p-4 border rounded-lg"
                        >
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-semibold">
                                {index + 1}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{milestone.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {milestone.description}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-sm">
                              <span className="font-medium">
                                ${milestone.amount}
                              </span>
                              <span className="text-muted-foreground">
                                {milestone.deliveryDays} days
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="negotiation" className="space-y-4">
                {/* Negotiation History */}
                <Card>
                  <CardHeader>
                    <CardTitle>Negotiation History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedProposal.negotiationHistory.length > 0 ? (
                        selectedProposal.negotiationHistory.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${
                              message.fromUser === userRole
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[70%] p-3 rounded-lg ${
                                message.fromUser === userRole
                                  ? "bg-blue-500 text-white"
                                  : "bg-gray-100"
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium capitalize">
                                  {message.fromUser}
                                </span>
                                <Badge
                                  variant={
                                    message.type === "counteroffer"
                                      ? "default"
                                      : "secondary"
                                  }
                                  className="text-xs"
                                >
                                  {message.type}
                                </Badge>
                              </div>
                              <p className="text-sm">{message.content}</p>
                              <div className="text-xs opacity-75 mt-1">
                                {formatDistanceToNow(
                                  new Date(message.timestamp),
                                  { addSuffix: true },
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          No negotiation messages yet
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Send Message */}
                {userRole === "client" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Send Message</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Textarea
                        placeholder="Type your message..."
                        value={negotiationMessage}
                        onChange={(e) => setNegotiationMessage(e.target.value)}
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button onClick={handleSendNegotiationMessage}>
                          <Send className="w-4 h-4 mr-2" />
                          Send Message
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowNegotiationDialog(true)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Counter Offer
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="freelancer">
                <div className="space-y-6">
                  {/* Freelancer Summary */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage
                            src={selectedProposal.freelancer.avatar}
                          />
                          <AvatarFallback>
                            {selectedProposal.freelancer.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-semibold">
                              {selectedProposal.freelancer.name}
                            </h3>
                            {selectedProposal.freelancer.verified && (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            )}
                          </div>
                          <p className="text-muted-foreground mb-2">
                            {selectedProposal.freelancer.title}
                          </p>
                          <p className="text-sm mb-4">
                            {selectedProposal.freelancer.bio}
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <div className="text-muted-foreground">
                                Rating
                              </div>
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-medium">
                                  {selectedProposal.freelancer.rating}
                                </span>
                              </div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">
                                Jobs Completed
                              </div>
                              <div className="font-medium">
                                {selectedProposal.freelancer.completedJobs}
                              </div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">
                                Success Rate
                              </div>
                              <div className="font-medium">
                                {selectedProposal.freelancer.successRate}%
                              </div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">
                                Hourly Rate
                              </div>
                              <div className="font-medium">
                                ${selectedProposal.freelancer.hourlyRate}/hr
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Skills */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Skills</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {selectedProposal.freelancer.skills.map((skill) => (
                          <Badge key={skill} variant="outline">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSelectedProposal(null)}
              >
                Close
              </Button>
              {userRole === "client" &&
                selectedProposal.status === "pending" && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleStatusUpdate(selectedProposal.id, "rejected");
                        setSelectedProposal(null);
                      }}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Decline
                    </Button>
                    <Button
                      onClick={() => {
                        handleStatusUpdate(selectedProposal.id, "shortlisted");
                        setSelectedProposal(null);
                      }}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Shortlist
                    </Button>
                  </div>
                )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Counter Offer Dialog */}
      <Dialog
        open={showNegotiationDialog}
        onOpenChange={setShowNegotiationDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Counter Offer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="counter-rate">Proposed Rate ($)</Label>
              <Input
                id="counter-rate"
                type="number"
                value={counterOffer.rate}
                onChange={(e) =>
                  setCounterOffer((prev) => ({
                    ...prev,
                    rate: parseFloat(e.target.value) || 0,
                  }))
                }
                placeholder="Enter proposed rate"
              />
            </div>
            <div>
              <Label htmlFor="counter-delivery">Delivery Time</Label>
              <Input
                id="counter-delivery"
                value={counterOffer.deliveryTime}
                onChange={(e) =>
                  setCounterOffer((prev) => ({
                    ...prev,
                    deliveryTime: e.target.value,
                  }))
                }
                placeholder="e.g., 10 days"
              />
            </div>
            <div>
              <Label htmlFor="counter-scope">Scope Changes (Optional)</Label>
              <Textarea
                id="counter-scope"
                value={counterOffer.scope}
                onChange={(e) =>
                  setCounterOffer((prev) => ({
                    ...prev,
                    scope: e.target.value,
                  }))
                }
                placeholder="Describe any scope changes..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNegotiationDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCounterOffer}>Send Counter Offer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedBiddingSystem;
