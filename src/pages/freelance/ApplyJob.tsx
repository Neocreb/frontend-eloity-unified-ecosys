// @ts-nocheck
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Upload,
  X,
  FileText,
  DollarSign,
  Clock,
  Plus,
  Trash2,
  ChevronLeft,
  Star,
  Calendar,
} from "lucide-react";
import { JobPosting, Proposal } from "@/types/freelance";
import { useFreelance } from "@/hooks/use-freelance";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/contexts/CurrencyContext";

interface Milestone {
  title: string;
  description: string;
  amount: number;
  dueDate: string;
}

const ApplyJob: React.FC = () => {
  const navigate = useNavigate();
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(true);
  const { formatCurrency } = useCurrency();

  const [coverLetter, setCoverLetter] = useState("");
  const [proposedRateType, setProposedRateType] = useState<"fixed" | "hourly">(
    "fixed"
  );
  const [proposedAmount, setProposedAmount] = useState<number>(0);
  const [deliveryTime, setDeliveryTime] = useState("");
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { submitProposal, getJobById } = useFreelance();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const loadJob = async () => {
      if (!jobId) {
        toast({
          title: "Error",
          description: "Job ID not found",
          variant: "destructive",
        });
        navigate(-1);
        return;
      }

      try {
        const jobData = await getJobById(jobId);
        if (jobData) {
          setJob(jobData);
          setProposedRateType(jobData.budget.type);
          if (jobData.budget.type === "fixed" && jobData.budget.amount) {
            setProposedAmount(jobData.budget.amount);
          } else if (jobData.budget.type === "hourly" && jobData.budget.max) {
            setProposedAmount(jobData.budget.max);
          }
        } else {
          toast({
            title: "Error",
            description: "Job not found",
            variant: "destructive",
          });
          navigate(-1);
        }
      } catch (error) {
        console.error("Error loading job:", error);
        toast({
          title: "Error",
          description: "Failed to load job details",
          variant: "destructive",
        });
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    loadJob();
  }, [jobId, getJobById, navigate, toast]);

  const addMilestone = () => {
    setMilestones([
      ...milestones,
      {
        title: "",
        description: "",
        amount: 0,
        dueDate: "",
      },
    ]);
  };

  const updateMilestone = (
    index: number,
    field: keyof Milestone,
    value: string | number
  ) => {
    const updatedMilestones = [...milestones];
    updatedMilestones[index] = {
      ...updatedMilestones[index],
      [field]: value,
    };
    setMilestones(updatedMilestones);
  };

  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments([...attachments, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    if (proposedRateType === "fixed") {
      return proposedAmount;
    }
    const estimatedHours = getEstimatedHours();
    return proposedAmount * estimatedHours;
  };

  const getEstimatedHours = () => {
    if (!job) return 160;
    const durationMap: { [key: string]: number } = {
      "1-3 days": 24,
      "1-2 weeks": 80,
      "3-4 weeks": 160,
      "1-3 months": 320,
      "3-6 months": 640,
    };
    return durationMap[job.duration] || 160;
  };

  const validateProposal = () => {
    if (!coverLetter.trim()) {
      toast({
        title: "Error",
        description: "Please write a cover letter",
        variant: "destructive",
      });
      return false;
    }

    if (!proposedAmount || proposedAmount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid rate",
        variant: "destructive",
      });
      return false;
    }

    if (!deliveryTime.trim()) {
      toast({
        title: "Error",
        description: "Please specify delivery time",
        variant: "destructive",
      });
      return false;
    }

    if (proposedRateType === "fixed" && milestones.length > 0) {
      const totalMilestoneAmount = milestones.reduce(
        (sum, m) => sum + m.amount,
        0
      );
      if (Math.abs(totalMilestoneAmount - proposedAmount) > 0.01) {
        toast({
          title: "Error",
          description: "Milestone amounts must equal the total proposal amount",
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateProposal() || !user || !job) return;

    setIsSubmitting(true);

    try {
      const proposal: Omit<Proposal, "id" | "submittedDate" | "status"> = {
        jobId: job.id,
        freelancer: {
          id: user.id,
          name: user.name || "Unknown",
          email: user.email,
          avatar: user.avatar || "/placeholder.svg",
          location: "Unknown",
          timezone: "UTC",
          verified: false,
          joinedDate: new Date().toISOString(),
          title: "Freelancer",
          bio: "",
          hourlyRate: proposedAmount,
          skills: [],
          rating: 4.8,
          totalEarned: 0,
          completedJobs: 0,
          successRate: 0,
          languages: ["English"],
          education: [],
          certifications: [],
          portfolio: [],
          availability: "available",
          responseTime: "within 24 hours",
        },
        coverLetter,
        proposedRate: {
          type: proposedRateType,
          amount: proposedAmount,
        },
        deliveryTime,
        milestones: milestones.length > 0 ? milestones : undefined,
        attachments: attachments.map((f) => f.name),
      };

      const result = await submitProposal(proposal);
      if (result) {
        toast({
          title: "Success",
          description: "Your proposal has been submitted!",
        });
        navigate(-1);
      }
    } catch (error) {
      console.error("Error submitting proposal:", error);
      toast({
        title: "Error",
        description: "Failed to submit proposal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">Loading job details...</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">Job not found</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="sticky top-0 bg-white border-b px-4 py-4 z-10">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2 mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Submit Proposal</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{job.title}</CardTitle>
              <div className="flex gap-2">
                <Badge variant="secondary">{job.category}</Badge>
                <Badge variant="outline">{job.experienceLevel}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm flex-wrap">
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  <span>
                    {job.budget.type === "fixed"
                      ? formatCurrency(job.budget.amount || 0)
                      : `${formatCurrency(job.budget.min || 0)}-${formatCurrency(job.budget.max || 0)}/hr`}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{job.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Avatar className="w-5 h-5">
                    <AvatarImage src={job.client.avatar} />
                    <AvatarFallback>{job.client.name[0]}</AvatarFallback>
                  </Avatar>
                  <span>{job.client.name}</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span>{job.client.rating}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Label htmlFor="coverLetter">Cover Letter *</Label>
            <Textarea
              id="coverLetter"
              placeholder="Introduce yourself and explain why you're the best fit for this project..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={6}
              className="resize-none"
            />
            <div className="text-xs text-muted-foreground">
              {coverLetter.length}/2000 characters
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Rate</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Rate Type</Label>
                  <Select
                    value={proposedRateType}
                    onValueChange={(value: "fixed" | "hourly") =>
                      setProposedRateType(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed Price</SelectItem>
                      <SelectItem value="hourly">Hourly Rate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>
                    {proposedRateType === "fixed"
                      ? "Total Project Cost"
                      : "Hourly Rate"}{" "}
                    *
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="0"
                      value={proposedAmount || ""}
                      onChange={(e) =>
                        setProposedAmount(Number(e.target.value))
                      }
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliveryTime">Delivery Time *</Label>
                <Input
                  id="deliveryTime"
                  placeholder="e.g., 2 weeks, 1 month"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                />
              </div>

              {proposedRateType === "hourly" && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm">
                    <div className="font-medium">Project Estimate</div>
                    <div className="text-muted-foreground">
                      Estimated hours: {getEstimatedHours()}h × $
                      {proposedAmount}/hr = ${calculateTotal().toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {proposedRateType === "fixed" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Milestones (Optional)</CardTitle>
                <Button variant="outline" size="sm" onClick={addMilestone}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Milestone
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {milestones.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-8 h-8 mx-auto mb-2" />
                    <p>No milestones added</p>
                    <p className="text-xs">
                      Break down your project into milestones for better
                      organization
                    </p>
                  </div>
                ) : (
                  <>
                    {milestones.map((milestone, index) => (
                      <Card key={index} className="relative">
                        <CardContent className="pt-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMilestone(index)}
                            className="absolute top-2 right-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Milestone Title</Label>
                              <Input
                                placeholder="e.g., Initial Design"
                                value={milestone.title}
                                onChange={(e) =>
                                  updateMilestone(
                                    index,
                                    "title",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Amount</Label>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                  type="number"
                                  placeholder="0"
                                  value={milestone.amount || ""}
                                  onChange={(e) =>
                                    updateMilestone(
                                      index,
                                      "amount",
                                      Number(e.target.value)
                                    )
                                  }
                                  className="pl-10"
                                />
                              </div>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                              <Label>Description</Label>
                              <Textarea
                                placeholder="Describe what will be delivered in this milestone..."
                                value={milestone.description}
                                onChange={(e) =>
                                  updateMilestone(
                                    index,
                                    "description",
                                    e.target.value
                                  )
                                }
                                rows={2}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Due Date</Label>
                              <Input
                                type="date"
                                value={milestone.dueDate}
                                onChange={(e) =>
                                  updateMilestone(
                                    index,
                                    "dueDate",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <span className="font-medium">
                        Total Milestone Amount:
                      </span>
                      <span className="text-lg font-bold">
                        $
                        {milestones
                          .reduce((sum, m) => sum + m.amount, 0)
                          .toLocaleString()}
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Attachments (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Upload relevant files to support your proposal
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button variant="outline" className="cursor-pointer" asChild>
                    <span>Choose Files</span>
                  </Button>
                </label>
              </div>

              {attachments.length > 0 && (
                <div className="space-y-2">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{file.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="sticky bottom-0 bg-white border-t px-4 py-4 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Total:{" "}
              <span className="font-medium text-lg">
                ${calculateTotal().toLocaleString()}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? "Submitting..." : "Submit Proposal"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyJob;
