// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Users,
  Plus,
  FolderOpen,
  Clock,
  FileText,
  Upload,
  Download,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  Calendar,
  MessageSquare,
  Settings,
  Search,
  Filter,
  Star,
  Share2,
  Eye,
  Edit,
  Trash2,
  Timer,
  BarChart3,
  DollarSign,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
  skills: string[];
  hourlyRate: number;
  availability: "available" | "busy" | "unavailable";
  rating: number;
  completedProjects: number;
}

interface ProjectWorkspace {
  id: string;
  name: string;
  description: string;
  teamMembers: TeamMember[];
  files: ProjectFile[];
  createdAt: Date;
  lastActivity: Date;
  status: "active" | "completed" | "archived";
}

interface ProjectFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedBy: string;
  uploadedAt: Date;
  version: number;
  url: string;
  category: "design" | "document" | "code" | "media" | "other";
}

interface TimeEntry {
  id: string;
  userId: string;
  projectId: string;
  description: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
  billable: boolean;
  approved: boolean;
  hourlyRate: number;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  status: "pending" | "in-progress" | "review" | "completed";
  assignedTo: string[];
  deliverables: string[];
  clientApproval: boolean;
  payment: {
    amount: number;
    released: boolean;
    releaseDate?: Date;
  };
}

interface ContractTemplate {
  id: string;
  name: string;
  category: "web-development" | "design" | "content" | "marketing" | "general";
  description: string;
  clauses: string[];
  customizable: boolean;
  lastUpdated: Date;
}

const mockTeamMembers: TeamMember[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    avatar: "/api/placeholder/32/32",
    role: "Frontend Developer",
    skills: ["React", "TypeScript", "CSS"],
    hourlyRate: 85,
    availability: "available",
    rating: 4.9,
    completedProjects: 87,
  },
  {
    id: "2",
    name: "Alex Developer",
    avatar: "/api/placeholder/32/32",
    role: "Backend Developer",
    skills: ["Node.js", "Python", "AWS"],
    hourlyRate: 90,
    availability: "busy",
    rating: 4.8,
    completedProjects: 65,
  },
  {
    id: "3",
    name: "Emma Designer",
    avatar: "/api/placeholder/32/32",
    role: "UI/UX Designer",
    skills: ["Figma", "Sketch", "Prototyping"],
    hourlyRate: 75,
    availability: "available",
    rating: 4.9,
    completedProjects: 102,
  },
];

const mockContractTemplates: ContractTemplate[] = [
  {
    id: "1",
    name: "Web Development Contract",
    category: "web-development",
    description: "Standard contract for web development projects",
    clauses: [
      "Project scope and deliverables",
      "Payment terms and milestones",
      "Intellectual property rights",
      "Revision and approval process",
      "Timeline and deadlines",
    ],
    customizable: true,
    lastUpdated: new Date("2024-01-15"),
  },
  {
    id: "2",
    name: "Design Services Agreement",
    category: "design",
    description: "Contract template for design and creative services",
    clauses: [
      "Design specifications",
      "Copyright and usage rights",
      "Revision rounds",
      "File delivery formats",
      "Client feedback process",
    ],
    customizable: true,
    lastUpdated: new Date("2024-01-10"),
  },
];

export const FreelanceCollaborationTools: React.FC = () => {
  const [activeTab, setActiveTab] = useState("team-assembly");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [projectWorkspaces, setProjectWorkspaces] = useState<
    ProjectWorkspace[]
  >([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [currentSession, setCurrentSession] = useState<{
    startTime: Date;
    description: string;
  } | null>(null);
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    loadCollaborationData();
  }, []);

  const loadCollaborationData = async () => {
    // Simulate loading collaboration data
    const mockWorkspaces: ProjectWorkspace[] = [
      {
        id: "1",
        name: "E-commerce Platform",
        description: "Modern e-commerce solution with React and Node.js",
        teamMembers: mockTeamMembers.slice(0, 2),
        files: [
          {
            id: "1",
            name: "wireframes.figma",
            size: 2450000,
            type: "application/figma",
            uploadedBy: "Emma Designer",
            uploadedAt: new Date("2024-01-15"),
            version: 2,
            url: "/files/wireframes.figma",
            category: "design",
          },
          {
            id: "2",
            name: "API_documentation.pdf",
            size: 1200000,
            type: "application/pdf",
            uploadedBy: "Alex Developer",
            uploadedAt: new Date("2024-01-14"),
            version: 1,
            url: "/files/api-docs.pdf",
            category: "document",
          },
        ],
        createdAt: new Date("2024-01-01"),
        lastActivity: new Date("2024-01-15"),
        status: "active",
      },
    ];

    const mockMilestones: Milestone[] = [
      {
        id: "1",
        title: "UI Design Completion",
        description: "Complete all UI designs and get client approval",
        dueDate: new Date("2024-02-01"),
        status: "in-progress",
        assignedTo: ["3"],
        deliverables: [
          "Homepage design",
          "Product page design",
          "Checkout flow",
        ],
        clientApproval: false,
        payment: {
          amount: 2500,
          released: false,
        },
      },
      {
        id: "2",
        title: "Backend API Development",
        description: "Develop RESTful API endpoints",
        dueDate: new Date("2024-02-15"),
        status: "pending",
        assignedTo: ["2"],
        deliverables: [
          "User authentication",
          "Product catalog API",
          "Order management",
        ],
        clientApproval: false,
        payment: {
          amount: 3500,
          released: false,
        },
      },
    ];

    setProjectWorkspaces(mockWorkspaces);
    setMilestones(mockMilestones);
  };

  const toggleMemberSelection = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId],
    );
  };

  const createTeam = () => {
    if (selectedMembers.length === 0) {
      toast({
        title: "No members selected",
        description: "Please select at least one team member.",
        variant: "destructive",
      });
      return;
    }

    const selectedTeamMembers = mockTeamMembers.filter((member) =>
      selectedMembers.includes(member.id),
    );

    const totalCost = selectedTeamMembers.reduce(
      (sum, member) => sum + member.hourlyRate,
      0,
    );

    toast({
      title: "Team assembled successfully!",
      description: `${selectedMembers.length} members selected. Estimated cost: $${totalCost}/hour`,
    });
  };

  const startTimeTracking = (description: string) => {
    setCurrentSession({
      startTime: new Date(),
      description,
    });
    setIsTracking(true);
    toast({
      title: "Time tracking started",
      description: "Timer is now running for this task.",
    });
  };

  const stopTimeTracking = () => {
    if (!currentSession) return;

    const endTime = new Date();
    const duration = Math.floor(
      (endTime.getTime() - currentSession.startTime.getTime()) / (1000 * 60),
    );

    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      userId: "current-user",
      projectId: "current-project",
      description: currentSession.description,
      startTime: currentSession.startTime,
      endTime,
      duration,
      billable: true,
      approved: false,
      hourlyRate: 85,
    };

    setTimeEntries((prev) => [newEntry, ...prev]);
    setCurrentSession(null);
    setIsTracking(false);

    toast({
      title: "Time tracking stopped",
      description: `Logged ${duration} minutes for "${currentSession.description}"`,
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.includes("image")) return "🖼️";
    if (type.includes("pdf")) return "📄";
    if (type.includes("figma")) return "🎨";
    if (type.includes("video")) return "🎥";
    return "📁";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-50 border-green-200";
      case "in-progress":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "review":
        return "text-purple-600 bg-purple-50 border-purple-200";
      case "pending":
        return "text-gray-600 bg-gray-50 border-gray-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "available":
        return "text-green-600 bg-green-50";
      case "busy":
        return "text-yellow-600 bg-yellow-50";
      case "unavailable":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            Collaboration Tools
          </h2>
          <p className="text-muted-foreground">
            Manage teams, projects, and workflows efficiently
          </p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1">
          <TabsTrigger value="team-assembly" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Team Assembly</span>
            <span className="sm:hidden">Team</span>
          </TabsTrigger>
          <TabsTrigger value="workspace" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Project Workspace</span>
            <span className="sm:hidden">Workspace</span>
          </TabsTrigger>
          <TabsTrigger value="time-tracking" className="text-xs sm:text-sm">
            <span className="hidden lg:inline">Time Tracking</span>
            <span className="lg:hidden">Time</span>
          </TabsTrigger>
          <TabsTrigger value="milestones" className="text-xs sm:text-sm">
            <span className="hidden lg:inline">Milestone Management</span>
            <span className="lg:hidden">Milestones</span>
          </TabsTrigger>
          <TabsTrigger
            value="contracts"
            className="text-xs sm:text-sm col-span-2 sm:col-span-1"
          >
            <span className="hidden lg:inline">Contract Templates</span>
            <span className="lg:hidden">Contracts</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="team-assembly" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Team Assembly Assistant
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockTeamMembers.map((member) => (
                      <div
                        key={member.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedMembers.includes(member.id)
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => toggleMemberSelection(member.id)}
                      >
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback>{member.name[0]}</AvatarFallback>
                          </Avatar>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{member.name}</h4>
                              <Badge
                                className={getAvailabilityColor(
                                  member.availability,
                                )}
                              >
                                {member.availability}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {member.role}
                            </p>

                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span>{member.rating}</span>
                              </div>
                              <span>${member.hourlyRate}/hr</span>
                              <span>{member.completedProjects} projects</span>
                            </div>

                            <div className="flex flex-wrap gap-1 mt-2">
                              {member.skills.map((skill, i) => (
                                <Badge
                                  key={i}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedMembers.includes(member.id)}
                              onChange={() => toggleMemberSelection(member.id)}
                              className="w-5 h-5 text-blue-600"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Team Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedMembers.length}
                      </div>
                      <div className="text-sm text-blue-700">
                        Members Selected
                      </div>
                    </div>

                    {selectedMembers.length > 0 && (
                      <>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            $
                            {mockTeamMembers
                              .filter((m) => selectedMembers.includes(m.id))
                              .reduce((sum, m) => sum + m.hourlyRate, 0)}
                          </div>
                          <div className="text-sm text-green-700">
                            Total Hourly Cost
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Skills Coverage</h4>
                          <div className="flex flex-wrap gap-1">
                            {[
                              ...new Set(
                                mockTeamMembers
                                  .filter((m) => selectedMembers.includes(m.id))
                                  .flatMap((m) => m.skills),
                              ),
                            ].map((skill, i) => (
                              <Badge
                                key={i}
                                variant="secondary"
                                className="text-xs"
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <Button
                          onClick={createTeam}
                          className="w-full"
                          disabled={selectedMembers.length === 0}
                        >
                          Create Team
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="workspace" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Project Workspaces</h3>
            <Dialog
              open={showCreateWorkspace}
              onOpenChange={setShowCreateWorkspace}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Workspace
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Workspace</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="workspace-name">Workspace Name</Label>
                    <Input
                      id="workspace-name"
                      placeholder="Enter workspace name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="workspace-description">Description</Label>
                    <Textarea
                      id="workspace-description"
                      placeholder="Describe the project..."
                    />
                  </div>
                  <Button
                    onClick={() => setShowCreateWorkspace(false)}
                    className="w-full"
                  >
                    Create Workspace
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {projectWorkspaces.map((workspace) => (
              <Card key={workspace.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FolderOpen className="h-5 w-5 text-blue-600" />
                      {workspace.name}
                    </CardTitle>
                    <Badge className={getStatusColor(workspace.status)}>
                      {workspace.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {workspace.description}
                  </p>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Team Members</h4>
                      <div className="flex -space-x-2">
                        {workspace.teamMembers.map((member) => (
                          <Avatar
                            key={member.id}
                            className="h-8 w-8 border-2 border-white"
                          >
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback>{member.name[0]}</AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Recent Files</h4>
                      <div className="space-y-2">
                        {workspace.files.slice(0, 3).map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center gap-3 p-2 border rounded text-sm"
                          >
                            <span className="text-lg">
                              {getFileIcon(file.type)}
                            </span>
                            <div className="flex-1">
                              <div className="font-medium">{file.name}</div>
                              <div className="text-muted-foreground text-xs">
                                {formatFileSize(file.size)} • {file.uploadedBy}
                              </div>
                            </div>
                            <Button size="sm" variant="ghost">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-xs text-muted-foreground">
                        Last activity:{" "}
                        {workspace.lastActivity.toLocaleDateString()}
                      </span>
                      <Button size="sm" variant="outline">
                        Open Workspace
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="time-tracking" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="h-5 w-5 text-green-600" />
                  Time Tracker
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {!isTracking ? (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="task-description">
                          What are you working on?
                        </Label>
                        <Input
                          id="task-description"
                          placeholder="Enter task description..."
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              startTimeTracking(e.currentTarget.value);
                              e.currentTarget.value = "";
                            }
                          }}
                        />
                      </div>
                      <Button
                        onClick={() => {
                          const input = document.getElementById(
                            "task-description",
                          ) as HTMLInputElement;
                          if (input.value.trim()) {
                            startTimeTracking(input.value);
                            input.value = "";
                          }
                        }}
                        className="w-full"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Start Timer
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center space-y-4">
                      <div className="p-6 bg-green-50 rounded-lg">
                        <div className="text-3xl font-bold text-green-600 mb-2">
                          {currentSession && new Date().toLocaleTimeString()}
                        </div>
                        <div className="text-sm text-green-700">
                          Working on: {currentSession?.description}
                        </div>
                        <div className="text-xs text-green-600 mt-1">
                          Started:{" "}
                          {currentSession?.startTime.toLocaleTimeString()}
                        </div>
                      </div>
                      <Button
                        onClick={stopTimeTracking}
                        variant="outline"
                        className="w-full"
                      >
                        <Pause className="h-4 w-4 mr-2" />
                        Stop Timer
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Time Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {Math.floor(
                          timeEntries.reduce(
                            (sum, entry) => sum + entry.duration,
                            0,
                          ) / 60,
                        )}
                        h
                      </div>
                      <div className="text-sm text-blue-700">This Week</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        $
                        {timeEntries
                          .filter((entry) => entry.billable)
                          .reduce(
                            (sum, entry) =>
                              sum + (entry.duration / 60) * entry.hourlyRate,
                            0,
                          )
                          .toFixed(0)}
                      </div>
                      <div className="text-sm text-green-700">Billable</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Recent Entries</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {timeEntries.slice(0, 5).map((entry) => (
                        <div
                          key={entry.id}
                          className="flex justify-between items-center p-2 border rounded text-sm"
                        >
                          <div>
                            <div className="font-medium">
                              {entry.description}
                            </div>
                            <div className="text-muted-foreground text-xs">
                              {entry.startTime.toLocaleDateString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              {Math.floor(entry.duration / 60)}h{" "}
                              {entry.duration % 60}m
                            </div>
                            <div className="text-xs text-green-600">
                              $
                              {(
                                (entry.duration / 60) *
                                entry.hourlyRate
                              ).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="milestones" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Milestone Management</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Milestone
            </Button>
          </div>

          <div className="space-y-4">
            {milestones.map((milestone) => (
              <Card key={milestone.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-lg">
                          {milestone.title}
                        </h4>
                        <Badge className={getStatusColor(milestone.status)}>
                          {milestone.status}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-3">
                        {milestone.description}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">
                            Due Date
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            <span>
                              {milestone.dueDate.toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">
                            Payment
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span>
                              ${milestone.payment.amount.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">
                            Assigned To
                          </div>
                          <div className="flex -space-x-1">
                            {milestone.assignedTo.map((memberId) => {
                              const member = mockTeamMembers.find(
                                (m) => m.id === memberId,
                              );
                              return member ? (
                                <Avatar
                                  key={memberId}
                                  className="h-6 w-6 border-2 border-white"
                                >
                                  <AvatarImage src={member.avatar} />
                                  <AvatarFallback>
                                    {member.name[0]}
                                  </AvatarFallback>
                                </Avatar>
                              ) : null;
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-medium mb-2">
                        Deliverables
                      </div>
                      <div className="space-y-1">
                        {milestone.deliverables.map((deliverable, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 text-sm"
                          >
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>{deliverable}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-2">
                        {milestone.clientApproval ? (
                          <Badge
                            variant="outline"
                            className="text-green-600 border-green-200"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Client Approved
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-orange-600 border-orange-200"
                          >
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Pending Approval
                          </Badge>
                        )}

                        {milestone.payment.released ? (
                          <Badge
                            variant="outline"
                            className="text-green-600 border-green-200"
                          >
                            Payment Released
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-blue-600 border-blue-200"
                          >
                            Payment Pending
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Discuss
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="contracts" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Contract Templates</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockContractTemplates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      {template.name}
                    </CardTitle>
                    <Badge variant="outline">{template.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {template.description}
                  </p>

                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-2">Included Clauses</h4>
                      <ul className="space-y-1">
                        {template.clauses.map((clause, i) => (
                          <li
                            key={i}
                            className="flex items-center gap-2 text-sm"
                          >
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span>{clause}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-2">
                        {template.customizable && (
                          <Badge
                            variant="outline"
                            className="text-blue-600 border-blue-200"
                          >
                            <Settings className="h-3 w-3 mr-1" />
                            Customizable
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          Updated: {template.lastUpdated.toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                        <Button size="sm">Use Template</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
