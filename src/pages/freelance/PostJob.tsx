// @ts-nocheck
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Plus,
  X,
  DollarSign,
  Clock,
  Users,
  Briefcase,
  Target,
  Calendar,
  FileText,
  Globe,
  Star,
  CheckCircle2,
  AlertTriangle,
  Save,
  Send,
  Eye,
  Zap,
  Award,
  Shield,
  TrendingUp,
  MapPin,
  Building,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface JobFormData {
  title: string;
  description: string;
  category: string;
  skills: string[];
  budget: {
    type: "fixed" | "hourly";
    amount: number;
    currency: string;
  };
  duration: string;
  experienceLevel: "entry" | "intermediate" | "expert";
  deadline?: Date;
  attachments: string[];
  projectScope: "small" | "medium" | "large";
  timeZone?: string;
  availability: string;
  milestones: {
    id: string;
    title: string;
    description: string;
    amount: number;
    dueDate?: Date;
  }[];
  requirements: string[];
  preferredCommunication: string[];
  urgent: boolean;
  featured: boolean;
}

const PostJob: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [newSkill, setNewSkill] = useState("");
  const [newRequirement, setNewRequirement] = useState("");
  const [progress, setProgress] = useState(0);

  const [jobData, setJobData] = useState<JobFormData>({
    title: "",
    description: "",
    category: "",
    skills: [],
    budget: {
      type: "fixed",
      amount: 0,
      currency: "USD",
    },
    duration: "",
    experienceLevel: "intermediate",
    attachments: [],
    projectScope: "medium",
    availability: "full-time",
    milestones: [],
    requirements: [],
    preferredCommunication: [],
    urgent: false,
    featured: false,
  });

  const [newMilestone, setNewMilestone] = useState({
    title: "",
    description: "",
    amount: 0,
    dueDate: "",
  });

  const categories = [
    "Web Development",
    "Mobile Development", 
    "UI/UX Design",
    "Data Science",
    "DevOps",
    "Content Writing",
    "Digital Marketing",
    "Graphic Design",
    "Video Editing",
    "Consulting",
  ];

  const popularSkills = [
    "React", "Node.js", "Python", "JavaScript", "TypeScript",
    "AWS", "Docker", "MongoDB", "PostgreSQL", "Figma",
    "Photoshop", "SEO", "Content Writing", "Machine Learning",
  ];

  const communicationMethods = [
    "Email", "Slack", "Zoom", "Discord", "Microsoft Teams", "WhatsApp"
  ];

  React.useEffect(() => {
    // Calculate form completion progress
    const fields = [
      jobData.title,
      jobData.description,
      jobData.category,
      jobData.skills.length > 0,
      jobData.budget.amount > 0,
      jobData.duration,
      jobData.experienceLevel,
    ];
    const completed = fields.filter(Boolean).length;
    setProgress((completed / fields.length) * 100);
  }, [jobData]);

  const handleInputChange = (field: string, value: any) => {
    setJobData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (section: string, field: string, value: any) => {
    setJobData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof JobFormData],
        [field]: value
      }
    }));
  };

  const addSkill = (skill?: string) => {
    const skillToAdd = skill || newSkill.trim();
    if (skillToAdd && !jobData.skills.includes(skillToAdd)) {
      setJobData(prev => ({
        ...prev,
        skills: [...prev.skills, skillToAdd]
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setJobData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const addRequirement = () => {
    if (newRequirement.trim() && !jobData.requirements.includes(newRequirement.trim())) {
      setJobData(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()]
      }));
      setNewRequirement("");
    }
  };

  const removeRequirement = (reqToRemove: string) => {
    setJobData(prev => ({
      ...prev,
      requirements: prev.requirements.filter(req => req !== reqToRemove)
    }));
  };

  const addMilestone = () => {
    if (newMilestone.title.trim()) {
      const milestone = {
        id: Date.now().toString(),
        title: newMilestone.title,
        description: newMilestone.description,
        amount: newMilestone.amount,
        dueDate: newMilestone.dueDate ? new Date(newMilestone.dueDate) : undefined,
      };
      
      setJobData(prev => ({
        ...prev,
        milestones: [...prev.milestones, milestone]
      }));
      
      setNewMilestone({ title: "", description: "", amount: 0, dueDate: "" });
    }
  };

  const removeMilestone = (id: string) => {
    setJobData(prev => ({
      ...prev,
      milestones: prev.milestones.filter(m => m.id !== id)
    }));
  };

  const toggleCommunicationMethod = (method: string) => {
    setJobData(prev => ({
      ...prev,
      preferredCommunication: prev.preferredCommunication.includes(method)
        ? prev.preferredCommunication.filter(m => m !== method)
        : [...prev.preferredCommunication, method]
    }));
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return jobData.title.trim() && jobData.description.trim() && jobData.category;
      case 2:
        return jobData.skills.length > 0 && jobData.experienceLevel;
      case 3:
        return jobData.budget.amount > 0 && jobData.duration;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    } else {
      toast.error("Please fill in all required fields");
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    try {
      // Save as draft
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Job saved as draft");
    } catch (error) {
      toast.error("Failed to save draft");
    } finally {
      setLoading(false);
    }
  };

  const handlePublishJob = async () => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      toast.error("Please complete all required fields");
      return;
    }

    setLoading(true);
    try {
      // Publish job
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success("Job posted successfully!");
      navigate("/app/freelance/client-dashboard");
    } catch (error) {
      toast.error("Failed to publish job");
    } finally {
      setLoading(false);
    }
  };

  const getEstimatedCost = () => {
    const baseCost = jobData.budget.amount;
    const platformFee = baseCost * 0.05; // 5% platform fee
    const paymentProcessing = baseCost * 0.029; // 2.9% payment processing
    const total = baseCost + platformFee + paymentProcessing;
    return { baseCost, platformFee, paymentProcessing, total };
  };

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
          <h1 className="text-2xl sm:text-3xl font-bold">Post a Job</h1>
          <p className="text-muted-foreground">Find the perfect freelancer for your project</p>
        </div>
      </div>

      {/* Progress Bar */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Step {currentStep} of 4</h3>
              <p className="text-sm text-muted-foreground">
                {currentStep === 1 && "Job Details"}
                {currentStep === 2 && "Skills & Requirements"}
                {currentStep === 3 && "Budget & Timeline"}
                {currentStep === 4 && "Review & Publish"}
              </p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold">{Math.round(progress)}%</div>
              <div className="text-sm text-muted-foreground">Complete</div>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {currentStep === 1 && "Tell us about your project"}
                {currentStep === 2 && "What skills do you need?"}
                {currentStep === 3 && "Set your budget and timeline"}
                {currentStep === 4 && "Review your job post"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="title">Job Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g. Build a responsive e-commerce website"
                      value={jobData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <select
                      id="category"
                      className="w-full px-3 py-2 border rounded-md"
                      value={jobData.category}
                      onChange={(e) => handleInputChange("category", e.target.value)}
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="description">Project Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your project in detail. What do you want to accomplish?"
                      value={jobData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      rows={8}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Minimum 50 characters ({jobData.description.length}/50)
                    </p>
                  </div>

                  <div>
                    <Label>Project Scope</Label>
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      {[
                        { value: "small", label: "Small", desc: "1-3 days", icon: <Target className="w-4 h-4" /> },
                        { value: "medium", label: "Medium", desc: "1-4 weeks", icon: <Briefcase className="w-4 h-4" /> },
                        { value: "large", label: "Large", desc: "1+ months", icon: <Building className="w-4 h-4" /> },
                      ].map((scope) => (
                        <Card
                          key={scope.value}
                          className={`cursor-pointer transition-all ${
                            jobData.projectScope === scope.value ? "ring-2 ring-blue-500" : ""
                          }`}
                          onClick={() => handleInputChange("projectScope", scope.value)}
                        >
                          <CardContent className="pt-4 text-center">
                            <div className="mb-2">{scope.icon}</div>
                            <div className="font-medium">{scope.label}</div>
                            <div className="text-sm text-muted-foreground">{scope.desc}</div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Skills & Requirements */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <Label>Required Skills *</Label>
                    <div className="flex gap-2 mb-3">
                      <Input
                        placeholder="Add a skill"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && addSkill()}
                      />
                      <Button onClick={() => addSkill()} type="button">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {/* Popular Skills */}
                    <div className="mb-3">
                      <p className="text-sm font-medium mb-2">Popular Skills:</p>
                      <div className="flex flex-wrap gap-2">
                        {popularSkills.map((skill) => (
                          <Badge
                            key={skill}
                            variant="outline"
                            className="cursor-pointer hover:bg-gray-100"
                            onClick={() => addSkill(skill)}
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Selected Skills */}
                    <div className="flex flex-wrap gap-2">
                      {jobData.skills.map((skill, index) => (
                        <Badge key={index} className="flex items-center gap-1">
                          {skill}
                          <X
                            className="w-3 h-3 cursor-pointer"
                            onClick={() => removeSkill(skill)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Experience Level *</Label>
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      {[
                        { value: "entry", label: "Entry Level", desc: "New to this skill" },
                        { value: "intermediate", label: "Intermediate", desc: "Some experience" },
                        { value: "expert", label: "Expert", desc: "Extensive experience" },
                      ].map((level) => (
                        <Card
                          key={level.value}
                          className={`cursor-pointer transition-all ${
                            jobData.experienceLevel === level.value ? "ring-2 ring-blue-500" : ""
                          }`}
                          onClick={() => handleInputChange("experienceLevel", level.value)}
                        >
                          <CardContent className="pt-4 text-center">
                            <div className="font-medium">{level.label}</div>
                            <div className="text-sm text-muted-foreground">{level.desc}</div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Project Requirements</Label>
                    <div className="flex gap-2 mb-3">
                      <Input
                        placeholder="Add a requirement"
                        value={newRequirement}
                        onChange={(e) => setNewRequirement(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && addRequirement()}
                      />
                      <Button onClick={addRequirement} type="button">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {jobData.requirements.map((req, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm">{req}</span>
                          <X
                            className="w-4 h-4 cursor-pointer text-muted-foreground hover:text-red-500"
                            onClick={() => removeRequirement(req)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Preferred Communication</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {communicationMethods.map((method) => (
                        <Button
                          key={method}
                          variant={jobData.preferredCommunication.includes(method) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleCommunicationMethod(method)}
                        >
                          {method}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Budget & Timeline */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <Label>Budget Type *</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <Card
                        className={`cursor-pointer transition-all ${
                          jobData.budget.type === "fixed" ? "ring-2 ring-blue-500" : ""
                        }`}
                        onClick={() => handleNestedChange("budget", "type", "fixed")}
                      >
                        <CardContent className="pt-4 text-center">
                          <DollarSign className="w-6 h-6 mx-auto mb-2" />
                          <div className="font-medium">Fixed Price</div>
                          <div className="text-sm text-muted-foreground">Pay a set amount</div>
                        </CardContent>
                      </Card>
                      <Card
                        className={`cursor-pointer transition-all ${
                          jobData.budget.type === "hourly" ? "ring-2 ring-blue-500" : ""
                        }`}
                        onClick={() => handleNestedChange("budget", "type", "hourly")}
                      >
                        <CardContent className="pt-4 text-center">
                          <Clock className="w-6 h-6 mx-auto mb-2" />
                          <div className="font-medium">Hourly Rate</div>
                          <div className="text-sm text-muted-foreground">Pay per hour worked</div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="budget-amount">
                      {jobData.budget.type === "fixed" ? "Project Budget" : "Hourly Rate"} *
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="budget-amount"
                        type="number"
                        placeholder={jobData.budget.type === "fixed" ? "5000" : "75"}
                        value={jobData.budget.amount || ""}
                        onChange={(e) => handleNestedChange("budget", "amount", Number(e.target.value))}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="duration">Project Duration *</Label>
                    <select
                      id="duration"
                      className="w-full px-3 py-2 border rounded-md"
                      value={jobData.duration}
                      onChange={(e) => handleInputChange("duration", e.target.value)}
                    >
                      <option value="">Select duration</option>
                      <option value="1-3 days">1-3 days</option>
                      <option value="1 week">1 week</option>
                      <option value="2-4 weeks">2-4 weeks</option>
                      <option value="1-3 months">1-3 months</option>
                      <option value="3-6 months">3-6 months</option>
                      <option value="6+ months">6+ months</option>
                      <option value="ongoing">Ongoing</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="deadline">Deadline (Optional)</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={jobData.deadline ? jobData.deadline.toISOString().split('T')[0] : ""}
                      onChange={(e) => handleInputChange("deadline", e.target.value ? new Date(e.target.value) : undefined)}
                    />
                  </div>

                  {/* Milestones */}
                  <div>
                    <Label>Project Milestones (Optional)</Label>
                    <div className="border rounded-lg p-4 space-y-4 mt-2">
                      <h4 className="font-medium">Add Milestone</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          placeholder="Milestone title"
                          value={newMilestone.title}
                          onChange={(e) => setNewMilestone(prev => ({ ...prev, title: e.target.value }))}
                        />
                        <Input
                          type="number"
                          placeholder="Amount"
                          value={newMilestone.amount || ""}
                          onChange={(e) => setNewMilestone(prev => ({ ...prev, amount: Number(e.target.value) }))}
                        />
                      </div>
                      <Textarea
                        placeholder="Milestone description"
                        value={newMilestone.description}
                        onChange={(e) => setNewMilestone(prev => ({ ...prev, description: e.target.value }))}
                        rows={2}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          type="date"
                          value={newMilestone.dueDate}
                          onChange={(e) => setNewMilestone(prev => ({ ...prev, dueDate: e.target.value }))}
                        />
                        <Button onClick={addMilestone} disabled={!newMilestone.title}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Milestone
                        </Button>
                      </div>
                    </div>

                    {/* Milestone List */}
                    {jobData.milestones.length > 0 && (
                      <div className="space-y-3 mt-4">
                        {jobData.milestones.map((milestone) => (
                          <div key={milestone.id} className="border rounded-lg p-3">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-medium">{milestone.title}</h4>
                                <p className="text-sm text-muted-foreground">{milestone.description}</p>
                                <div className="flex items-center gap-4 mt-2 text-sm">
                                  <span className="font-medium">${milestone.amount}</span>
                                  {milestone.dueDate && (
                                    <span className="text-muted-foreground">
                                      Due: {milestone.dueDate.toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeMilestone(milestone.id)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Job Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <span className="font-medium">Title:</span>
                          <p className="text-muted-foreground">{jobData.title}</p>
                        </div>
                        <div>
                          <span className="font-medium">Category:</span>
                          <p className="text-muted-foreground">{jobData.category}</p>
                        </div>
                        <div>
                          <span className="font-medium">Project Scope:</span>
                          <p className="text-muted-foreground capitalize">{jobData.projectScope}</p>
                        </div>
                        <div>
                          <span className="font-medium">Experience Level:</span>
                          <p className="text-muted-foreground capitalize">{jobData.experienceLevel}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Budget & Timeline</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <span className="font-medium">Budget Type:</span>
                          <p className="text-muted-foreground capitalize">{jobData.budget.type}</p>
                        </div>
                        <div>
                          <span className="font-medium">Amount:</span>
                          <p className="text-muted-foreground">${jobData.budget.amount}</p>
                        </div>
                        <div>
                          <span className="font-medium">Duration:</span>
                          <p className="text-muted-foreground">{jobData.duration}</p>
                        </div>
                        {jobData.deadline && (
                          <div>
                            <span className="font-medium">Deadline:</span>
                            <p className="text-muted-foreground">{jobData.deadline.toLocaleDateString()}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Skills Required</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {jobData.skills.map((skill, index) => (
                          <Badge key={index}>{skill}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Job Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground whitespace-pre-wrap">{jobData.description}</p>
                    </CardContent>
                  </Card>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={jobData.urgent}
                        onChange={(e) => handleInputChange("urgent", e.target.checked)}
                      />
                      <Zap className="w-4 h-4 text-orange-500" />
                      <span>Mark as urgent (+$5 fee)</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={jobData.featured}
                        onChange={(e) => handleInputChange("featured", e.target.checked)}
                      />
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>Feature this job (+$15 fee)</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                >
                  Back
                </Button>
                
                <div className="flex gap-2">
                  {currentStep < 4 && (
                    <Button variant="outline" onClick={handleSaveDraft} disabled={loading}>
                      <Save className="w-4 h-4 mr-2" />
                      Save Draft
                    </Button>
                  )}
                  
                  {currentStep < 4 ? (
                    <Button onClick={handleNext}>
                      Next
                    </Button>
                  ) : (
                    <Button onClick={handlePublishJob} disabled={loading}>
                      <Send className="w-4 h-4 mr-2" />
                      {loading ? "Publishing..." : "Publish Job"}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Cost Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cost Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {jobData.budget.amount > 0 && (
                <>
                  <div className="flex justify-between">
                    <span>Project Budget</span>
                    <span>${jobData.budget.amount}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Platform Fee (5%)</span>
                    <span>${(jobData.budget.amount * 0.05).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Payment Processing (2.9%)</span>
                    <span>${(jobData.budget.amount * 0.029).toFixed(2)}</span>
                  </div>
                  {jobData.urgent && (
                    <div className="flex justify-between text-sm text-orange-600">
                      <span>Urgent Job Fee</span>
                      <span>$5.00</span>
                    </div>
                  )}
                  {jobData.featured && (
                    <div className="flex justify-between text-sm text-yellow-600">
                      <span>Featured Job Fee</span>
                      <span>$15.00</span>
                    </div>
                  )}
                  <hr />
                  <div className="flex justify-between font-bold">
                    <span>Total Cost</span>
                    <span>${getEstimatedCost().total.toFixed(2)}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tips for Success</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Be specific</p>
                  <p className="text-muted-foreground">Clear requirements get better proposals</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Set milestones</p>
                  <p className="text-muted-foreground">Break large projects into phases</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Budget wisely</p>
                  <p className="text-muted-foreground">Competitive budgets attract top talent</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Job Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                <Eye className="w-4 h-4 mr-2" />
                Preview Job Post
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PostJob;
