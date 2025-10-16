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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  MoreVertical,
  Calendar,
  DollarSign,
  FileText,
  Target,
  TrendingUp,
  MessageCircle,
  Upload,
  Edit,
  Trash2,
  Play,
  Pause,
  Archive,
  Award,
  Timer,
  CheckSquare,
  Flag,
  Download,
} from "lucide-react";
import { Project, Milestone } from "@/types/freelance";
import { useFreelanceProject } from "@/hooks/use-freelance";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface TaskTrackerProps {
  projectId: string;
  userRole: "client" | "freelancer";
}

interface TaskItem {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed" | "blocked" | "review";
  assignedTo: "client" | "freelancer" | "both";
  dueDate?: string;
  completedAt?: string;
  milestoneId?: string;
  priority: "low" | "medium" | "high" | "urgent";
  estimatedHours?: number;
  actualHours?: number;
  dependencies?: string[];
  tags?: string[];
  files?: {
    id: string;
    name: string;
    url: string;
    uploadedAt: string;
  }[];
  comments?: {
    id: string;
    userId: string;
    userName: string;
    content: string;
    createdAt: string;
  }[];
  checklist?: {
    id: string;
    title: string;
    completed: boolean;
  }[];
}

interface EnhancedMilestone extends Milestone {
  tasks: TaskItem[];
  progress: number;
  estimatedHours: number;
  actualHours: number;
  paymentStatus: "pending" | "escrowed" | "released";
  autoReleaseDate?: string;
  deliverables: {
    id: string;
    title: string;
    description: string;
    fileUrl?: string;
    status: "pending" | "submitted" | "approved" | "rejected";
    feedback?: string;
  }[];
}

export const TaskTracker: React.FC<TaskTrackerProps> = ({
  projectId,
  userRole,
}) => {
  const [milestones, setMilestones] = useState<EnhancedMilestone[]>([]);
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(
    null,
  );
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [activeTab, setActiveTab] = useState("milestones");
  const [timeTracking, setTimeTracking] = useState<{
    [taskId: string]: { start: Date; duration: number; active: boolean };
  }>({});
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assignedTo: "freelancer" as TaskItem["assignedTo"],
    dueDate: "",
    priority: "medium" as TaskItem["priority"],
    estimatedHours: 0,
    milestoneId: "",
    tags: [] as string[],
  });
  const [newMilestone, setNewMilestone] = useState({
    title: "",
    description: "",
    amount: 0,
    dueDate: "",
    deliverables: [
      {
        title: "",
        description: "",
      },
    ],
  });

  const { project, loading, updateProjectStatus } =
    useFreelanceProject(projectId);
  const { toast } = useToast();

  // Time tracking functions
  const startTimeTracking = (taskId: string) => {
    setTimeTracking((prev) => ({
      ...prev,
      [taskId]: {
        start: new Date(),
        duration: prev[taskId]?.duration || 0,
        active: true,
      },
    }));
  };

  const stopTimeTracking = (taskId: string) => {
    setTimeTracking((prev) => {
      const current = prev[taskId];
      if (!current?.active) return prev;

      const sessionDuration = Date.now() - current.start.getTime();
      return {
        ...prev,
        [taskId]: {
          ...current,
          duration: current.duration + sessionDuration,
          active: false,
        },
      };
    });
  };

  const formatDuration = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // Task management functions
  const updateTaskStatus = (taskId: string, status: TaskItem["status"]) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status,
              completedAt:
                status === "completed" ? new Date().toISOString() : undefined,
            }
          : task,
      ),
    );

    if (status === "completed") {
      stopTimeTracking(taskId);
      toast({
        title: "Task Completed",
        description: "Great job! Task marked as completed.",
      });
    }
  };

  const addTaskToChecklist = (taskId: string, checklistItem: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              checklist: [
                ...(task.checklist || []),
                {
                  id: `check_${Date.now()}`,
                  title: checklistItem,
                  completed: false,
                },
              ],
            }
          : task,
      ),
    );
  };

  const toggleChecklistItem = (
    taskId: string,
    checklistId: string,
    completed: boolean,
  ) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              checklist: task.checklist?.map((item) =>
                item.id === checklistId ? { ...item, completed } : item,
              ),
            }
          : task,
      ),
    );
  };

  const submitMilestone = (milestoneId: string) => {
    setMilestones((prev) =>
      prev.map((milestone) =>
        milestone.id === milestoneId
          ? { ...milestone, status: "submitted" }
          : milestone,
      ),
    );

    toast({
      title: "Milestone Submitted",
      description:
        "Milestone has been submitted for client review. You'll be notified when it's approved.",
    });
  };

  const approveMilestone = (milestoneId: string) => {
    if (userRole !== "client") return;

    setMilestones((prev) =>
      prev.map((milestone) =>
        milestone.id === milestoneId
          ? {
              ...milestone,
              status: "approved",
              paymentStatus: "released",
            }
          : milestone,
      ),
    );

    toast({
      title: "Milestone Approved",
      description: "Payment has been released to the freelancer.",
    });
  };

  // Mock milestones and tasks - in real app, these would come from the project data
  useEffect(() => {
    if (project) {
      const mockMilestones: EnhancedMilestone[] = [
        {
          id: "milestone_1",
          title: "Project Setup & Planning",
          description:
            "Initial project setup, requirements review, and planning",
          amount: 500,
          dueDate: "2024-01-18",
          status: "approved",
          progress: 100,
          estimatedHours: 20,
          actualHours: 18,
          paymentStatus: "released",
          deliverables: [
            {
              id: "del_1",
              title: "Requirements Document Review",
              description: "Detailed analysis of project requirements",
              status: "approved",
            },
            {
              id: "del_2",
              title: "Project Timeline",
              description: "Detailed project timeline with milestones",
              status: "approved",
            },
          ],
          tasks: [],
        },
        {
          id: "milestone_2",
          title: "Design & Wireframes",
          description: "Create wireframes and design mockups",
          amount: 1200,
          dueDate: "2024-01-25",
          status: "in-progress",
          progress: 65,
          estimatedHours: 40,
          actualHours: 26,
          paymentStatus: "escrowed",
          autoReleaseDate: "2024-01-27",
          deliverables: [
            {
              id: "del_3",
              title: "Wireframes",
              description: "Complete wireframes for all pages",
              status: "submitted",
            },
            {
              id: "del_4",
              title: "Design Mockups",
              description: "High-fidelity design mockups",
              status: "pending",
            },
          ],
          tasks: [],
        },
        {
          id: "milestone_3",
          title: "Frontend Development",
          description: "Build responsive frontend components",
          amount: 2000,
          dueDate: "2024-02-10",
          status: "pending",
          progress: 0,
          estimatedHours: 80,
          actualHours: 0,
          paymentStatus: "pending",
          deliverables: [
            {
              id: "del_5",
              title: "React Components",
              description: "Reusable React components",
              status: "pending",
            },
            {
              id: "del_6",
              title: "Responsive Design",
              description: "Mobile-responsive implementation",
              status: "pending",
            },
          ],
          tasks: [],
        },
      ];

      const mockTasks: TaskItem[] = [
        {
          id: "task_1",
          title: "Review project requirements",
          description:
            "Go through the detailed requirements document and ask any clarifying questions",
          status: "completed",
          assignedTo: "freelancer",
          dueDate: "2024-01-16",
          completedAt: "2024-01-15T14:30:00Z",
          milestoneId: "milestone_1",
          priority: "high",
          estimatedHours: 4,
          actualHours: 3.5,
          tags: ["planning", "requirements"],
          checklist: [
            { id: "check_1", title: "Read requirements doc", completed: true },
            {
              id: "check_2",
              title: "Prepare clarification questions",
              completed: true,
            },
            { id: "check_3", title: "Schedule kickoff call", completed: true },
          ],
        },
        {
          id: "task_2",
          title: "Provide project assets",
          description:
            "Share brand guidelines, logos, and other necessary assets",
          status: "completed",
          assignedTo: "client",
          dueDate: "2024-01-17",
          completedAt: "2024-01-16T10:00:00Z",
          milestoneId: "milestone_1",
          priority: "medium",
          estimatedHours: 2,
          actualHours: 1,
          tags: ["assets", "branding"],
          files: [
            {
              id: "file_1",
              name: "brand-guidelines.pdf",
              url: "/files/brand-guidelines.pdf",
              uploadedAt: "2024-01-16T10:00:00Z",
            },
          ],
        },
        {
          id: "task_3",
          title: "Create initial wireframes",
          description: "Design wireframes for main pages and user flows",
          status: "in-progress",
          assignedTo: "freelancer",
          dueDate: "2024-01-20",
          milestoneId: "milestone_2",
          priority: "high",
          estimatedHours: 16,
          actualHours: 12,
          tags: ["design", "wireframes"],
          checklist: [
            { id: "check_4", title: "Homepage wireframe", completed: true },
            { id: "check_5", title: "Product page wireframe", completed: true },
            {
              id: "check_6",
              title: "User dashboard wireframe",
              completed: false,
            },
            { id: "check_7", title: "Mobile wireframes", completed: false },
          ],
        },
        {
          id: "task_4",
          title: "Review and approve wireframes",
          description: "Review wireframes and provide feedback or approval",
          status: "pending",
          assignedTo: "client",
          dueDate: "2024-01-22",
          milestoneId: "milestone_2",
          priority: "medium",
          estimatedHours: 4,
          tags: ["review", "approval"],
          dependencies: ["task_3"],
        },
        {
          id: "task_5",
          title: "Develop frontend components",
          description: "Build React components based on approved designs",
          status: "pending",
          assignedTo: "freelancer",
          dueDate: "2024-01-28",
          milestoneId: "milestone_3",
          priority: "high",
          estimatedHours: 40,
          tags: ["development", "react"],
          dependencies: ["task_4"],
        },
      ];

      setMilestones(mockMilestones);
      setTasks(mockTasks);
      if (mockMilestones.length > 0) {
        setSelectedMilestone(mockMilestones[0].id);
      }
    }
  }, [project]);

  const getTaskStatusColor = (status: TaskItem["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "blocked":
        return "bg-red-100 text-red-800 border-red-200";
      case "review":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority: TaskItem["priority"]) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500 text-white";
      case "high":
        return "bg-orange-500 text-white";
      case "medium":
        return "bg-yellow-500 text-white";
      case "low":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getMilestoneStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "submitted":
        return "bg-blue-100 text-blue-800";
      case "in-progress":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "released":
        return "bg-green-100 text-green-800";
      case "escrowed":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTaskPriorityIcon = (
    dueDate?: string,
    priority?: TaskItem["priority"],
  ) => {
    if (!dueDate) return null;

    const due = new Date(dueDate);
    const now = new Date();
    const hoursUntilDue = (due.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (priority === "urgent" || hoursUntilDue < 24) {
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
    if (priority === "high" || hoursUntilDue < 72) {
      return <Flag className="w-4 h-4 text-orange-500" />;
    }
    if (hoursUntilDue < 168) {
      return <Clock className="w-4 h-4 text-yellow-500" />;
    }
    return <Calendar className="w-4 h-4 text-gray-500" />;
  };

  const getTaskProgress = (task: TaskItem) => {
    if (task.status === "completed") return 100;
    if (task.status === "in-progress") {
      const completed =
        task.checklist?.filter((item) => item.completed).length || 0;
      const total = task.checklist?.length || 1;
      return Math.round((completed / total) * 100);
    }
    return 0;
  };

  const selectedMilestoneData = milestones.find(
    (m) => m.id === selectedMilestone,
  );
  const milestoneTasks = tasks.filter(
    (task) => task.milestoneId === selectedMilestone,
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="h-32 bg-gray-200 rounded animate-pulse" />
        <div className="h-48 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Project Management</h2>
          <p className="text-muted-foreground">
            Track milestones, manage tasks, and monitor progress
          </p>
        </div>
        <div className="flex gap-2">
          {userRole === "client" && (
            <Button
              onClick={() => setShowAddMilestone(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Milestone
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => setShowAddTask(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Milestones Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {milestones.map((milestone) => (
          <Card
            key={milestone.id}
            className={`cursor-pointer transition-all ${
              selectedMilestone === milestone.id
                ? "ring-2 ring-blue-500 shadow-md"
                : "hover:shadow-md"
            }`}
            onClick={() => setSelectedMilestone(milestone.id)}
          >
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Milestone Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg line-clamp-1">
                      {milestone.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {milestone.description}
                    </p>
                  </div>
                  <Badge className={getMilestoneStatusColor(milestone.status)}>
                    {milestone.status}
                  </Badge>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span className="font-medium">{milestone.progress}%</span>
                  </div>
                  <Progress value={milestone.progress} className="h-2" />
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Amount</div>
                    <div className="font-semibold">${milestone.amount}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Due Date</div>
                    <div className="font-semibold">
                      {new Date(milestone.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Payment Status */}
                <div className="flex items-center justify-between">
                  <Badge
                    className={getPaymentStatusColor(milestone.paymentStatus)}
                  >
                    {milestone.paymentStatus}
                  </Badge>
                  {milestone.autoReleaseDate && (
                    <div className="text-xs text-muted-foreground">
                      Auto-release:{" "}
                      {formatDistanceToNow(
                        new Date(milestone.autoReleaseDate),
                        { addSuffix: true },
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                {milestone.status === "in-progress" &&
                  userRole === "freelancer" && (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        submitMilestone(milestone.id);
                      }}
                      className="w-full"
                    >
                      Submit for Review
                    </Button>
                  )}

                {milestone.status === "submitted" && userRole === "client" && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        approveMilestone(milestone.id);
                      }}
                      className="flex-1"
                    >
                      Approve & Pay
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Request changes
                      }}
                      className="flex-1"
                    >
                      Request Changes
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Simple Task List for selected milestone */}
      {selectedMilestoneData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              {selectedMilestoneData.title} - Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {milestoneTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{task.title}</h4>
                      {getTaskPriorityIcon(task.dueDate, task.priority)}
                      <Badge
                        className={getPriorityColor(task.priority)}
                        size="sm"
                      >
                        {task.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {task.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Assigned to: {task.assignedTo}</span>
                      {task.dueDate && (
                        <span>
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                      {task.estimatedHours && (
                        <span>Est: {task.estimatedHours}h</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getTaskStatusColor(task.status)}>
                      {task.status}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {task.status !== "completed" && (
                          <>
                            <DropdownMenuItem
                              onClick={() =>
                                updateTaskStatus(task.id, "in-progress")
                              }
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Start Task
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                updateTaskStatus(task.id, "completed")
                              }
                            >
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Mark Complete
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Task
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Add Comment
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Task Modal */}
      <Dialog open={showAddTask} onOpenChange={setShowAddTask}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="task-title">Task Title</Label>
              <Input
                id="task-title"
                value={newTask.title}
                onChange={(e) =>
                  setNewTask((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Enter task title"
              />
            </div>
            <div>
              <Label htmlFor="task-description">Description</Label>
              <Textarea
                id="task-description"
                value={newTask.description}
                onChange={(e) =>
                  setNewTask((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe the task"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="task-milestone">Milestone</Label>
                <select
                  id="task-milestone"
                  value={newTask.milestoneId}
                  onChange={(e) =>
                    setNewTask((prev) => ({
                      ...prev,
                      milestoneId: e.target.value,
                    }))
                  }
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select milestone</option>
                  {milestones.map((milestone) => (
                    <option key={milestone.id} value={milestone.id}>
                      {milestone.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="task-priority">Priority</Label>
                <select
                  id="task-priority"
                  value={newTask.priority}
                  onChange={(e) =>
                    setNewTask((prev) => ({
                      ...prev,
                      priority: e.target.value as TaskItem["priority"],
                    }))
                  }
                  className="w-full p-2 border rounded-md"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="task-assigned">Assigned To</Label>
                <select
                  id="task-assigned"
                  value={newTask.assignedTo}
                  onChange={(e) =>
                    setNewTask((prev) => ({
                      ...prev,
                      assignedTo: e.target.value as TaskItem["assignedTo"],
                    }))
                  }
                  className="w-full p-2 border rounded-md"
                >
                  <option value="freelancer">Freelancer</option>
                  <option value="client">Client</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <div>
                <Label htmlFor="task-due">Due Date</Label>
                <Input
                  id="task-due"
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) =>
                    setNewTask((prev) => ({ ...prev, dueDate: e.target.value }))
                  }
                />
              </div>
            </div>
            <div>
              <Label htmlFor="task-hours">Estimated Hours</Label>
              <Input
                id="task-hours"
                type="number"
                value={newTask.estimatedHours}
                onChange={(e) =>
                  setNewTask((prev) => ({
                    ...prev,
                    estimatedHours: parseInt(e.target.value) || 0,
                  }))
                }
                placeholder="0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTask(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                const newTaskItem: TaskItem = {
                  id: `task_${Date.now()}`,
                  title: newTask.title,
                  description: newTask.description,
                  status: "pending",
                  assignedTo: newTask.assignedTo,
                  dueDate: newTask.dueDate,
                  milestoneId: newTask.milestoneId,
                  priority: newTask.priority,
                  estimatedHours: newTask.estimatedHours,
                  tags: newTask.tags,
                };
                setTasks((prev) => [...prev, newTaskItem]);
                setNewTask({
                  title: "",
                  description: "",
                  assignedTo: "freelancer",
                  dueDate: "",
                  priority: "medium",
                  estimatedHours: 0,
                  milestoneId: "",
                  tags: [],
                });
                setShowAddTask(false);
                toast({
                  title: "Task Added",
                  description: "New task has been added successfully.",
                });
              }}
            >
              Add Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Milestone Modal */}
      <Dialog open={showAddMilestone} onOpenChange={setShowAddMilestone}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Add New Milestone</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="milestone-title">Milestone Title</Label>
              <Input
                id="milestone-title"
                value={newMilestone.title}
                onChange={(e) =>
                  setNewMilestone((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                placeholder="Enter milestone title"
              />
            </div>
            <div>
              <Label htmlFor="milestone-description">Description</Label>
              <Textarea
                id="milestone-description"
                value={newMilestone.description}
                onChange={(e) =>
                  setNewMilestone((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe the milestone"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="milestone-amount">Amount ($)</Label>
                <Input
                  id="milestone-amount"
                  type="number"
                  value={newMilestone.amount}
                  onChange={(e) =>
                    setNewMilestone((prev) => ({
                      ...prev,
                      amount: parseFloat(e.target.value) || 0,
                    }))
                  }
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="milestone-due">Due Date</Label>
                <Input
                  id="milestone-due"
                  type="date"
                  value={newMilestone.dueDate}
                  onChange={(e) =>
                    setNewMilestone((prev) => ({
                      ...prev,
                      dueDate: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddMilestone(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                const newMilestoneItem: EnhancedMilestone = {
                  id: `milestone_${Date.now()}`,
                  title: newMilestone.title,
                  description: newMilestone.description,
                  amount: newMilestone.amount,
                  dueDate: newMilestone.dueDate,
                  status: "pending",
                  progress: 0,
                  estimatedHours: 40, // Default
                  actualHours: 0,
                  paymentStatus: "pending",
                  deliverables: newMilestone.deliverables.map((del, index) => ({
                    id: `del_${Date.now()}_${index}`,
                    title: del.title,
                    description: del.description,
                    status: "pending",
                  })),
                  tasks: [],
                };
                setMilestones((prev) => [...prev, newMilestoneItem]);
                setNewMilestone({
                  title: "",
                  description: "",
                  amount: 0,
                  dueDate: "",
                  deliverables: [{ title: "", description: "" }],
                });
                setShowAddMilestone(false);
                toast({
                  title: "Milestone Added",
                  description: "New milestone has been added successfully.",
                });
              }}
            >
              Add Milestone
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskTracker;
