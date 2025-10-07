// @ts-nocheck
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { JobPosting, Proposal } from "@/types/freelance";
import { useToast } from "@/components/ui/use-toast";
import {
  DollarSign,
  Clock,
  FileText,
  Upload,
  AlertCircle,
  CheckCircle,
  Star,
} from "lucide-react";

interface ProposalFormProps {
  isOpen: boolean;
  onClose: () => void;
  job: JobPosting | null;
  onSubmit: (
    proposal: Omit<Proposal, "id" | "submittedDate" | "status">,
  ) => Promise<void>;
  freelancerId: string;
}

const ProposalForm: React.FC<ProposalFormProps> = ({
  isOpen,
  onClose,
  job,
  onSubmit,
  freelancerId,
}) => {
  const [formData, setFormData] = useState({
    coverLetter: "",
    proposedRate: "",
    deliveryTime: "",
    rateType: "fixed" as "fixed" | "hourly",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !job ||
      !formData.coverLetter.trim() ||
      !formData.proposedRate ||
      !formData.deliveryTime
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        jobId: job.id,
        freelancer: {
          id: freelancerId,
          name: "Current User", // This would come from auth context
          email: "user@example.com",
          avatar:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
          location: "Remote",
          timezone: "UTC",
          verified: true,
          joinedDate: "2023-01-01",
          title: "Full-Stack Developer",
          bio: "Experienced developer",
          hourlyRate: 75,
          skills: ["React", "Node.js"],
          rating: 4.8,
          totalEarned: 50000,
          completedJobs: 25,
          successRate: 95,
          languages: ["English"],
          education: [],
          certifications: [],
          portfolio: [],
          availability: "available",
          responseTime: "within 1 hour",
        },
        coverLetter: formData.coverLetter,
        proposedRate: {
          type: formData.rateType,
          amount: parseFloat(formData.proposedRate),
        },
        deliveryTime: formData.deliveryTime,
      });

      toast({
        title: "Proposal Submitted",
        description: "Your proposal has been sent to the client successfully!",
      });

      // Reset form
      setFormData({
        coverLetter: "",
        proposedRate: "",
        deliveryTime: "",
        rateType: "fixed",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Submission Failed",
        description:
          "There was an error submitting your proposal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      coverLetter: "",
      proposedRate: "",
      deliveryTime: "",
      rateType: "fixed",
    });
  };

  if (!job) return null;

  const suggestedRate =
    job.budget.type === "fixed"
      ? job.budget.amount
      : job.budget.max || job.budget.min;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Submit Proposal
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Summary */}
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2">{job.title}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  <span>
                    {job.budget.type === "fixed"
                      ? `$${job.budget.amount?.toLocaleString()}`
                      : `$${job.budget.min}-$${job.budget.max}/hr`}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{job.duration}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {job.experienceLevel} level
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Cover Letter */}
          <div className="space-y-2">
            <Label htmlFor="coverLetter" className="text-sm font-medium">
              Cover Letter *
            </Label>
            <Textarea
              id="coverLetter"
              placeholder="Introduce yourself and explain why you're the best fit for this project..."
              value={formData.coverLetter}
              onChange={(e) =>
                setFormData({ ...formData, coverLetter: e.target.value })
              }
              rows={8}
              className="resize-none"
              required
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{formData.coverLetter.length} characters</span>
              <span>Minimum 100 characters recommended</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Pricing *</Label>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rateType" className="text-sm">
                  Rate Type
                </Label>
                <Select
                  value={formData.rateType}
                  onValueChange={(value: "fixed" | "hourly") =>
                    setFormData({ ...formData, rateType: value })
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
                <Label htmlFor="proposedRate" className="text-sm">
                  {formData.rateType === "fixed"
                    ? "Total Amount"
                    : "Hourly Rate"}{" "}
                  *
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <Input
                    id="proposedRate"
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder={suggestedRate?.toString() || "0.00"}
                    value={formData.proposedRate}
                    onChange={(e) =>
                      setFormData({ ...formData, proposedRate: e.target.value })
                    }
                    className="pl-8"
                    required
                  />
                </div>
              </div>
            </div>

            {suggestedRate && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-800">
                  Client's budget: ${suggestedRate.toLocaleString()}
                  {job.budget.type === "hourly" ? "/hr" : ""}
                </span>
              </div>
            )}
          </div>

          {/* Delivery Time */}
          <div className="space-y-2">
            <Label htmlFor="deliveryTime" className="text-sm font-medium">
              Delivery Time *
            </Label>
            <Select
              value={formData.deliveryTime}
              onValueChange={(value) =>
                setFormData({ ...formData, deliveryTime: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select delivery timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-3 days">1-3 days</SelectItem>
                <SelectItem value="1 week">1 week</SelectItem>
                <SelectItem value="2 weeks">2 weeks</SelectItem>
                <SelectItem value="1 month">1 month</SelectItem>
                <SelectItem value="2-3 months">2-3 months</SelectItem>
                <SelectItem value="3+ months">3+ months</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Skills Match */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Required Skills</Label>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <Badge key={skill} variant="outline" className="text-xs">
                  <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                  {skill}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-gray-600">
              Make sure your proposal demonstrates experience with these skills
            </p>
          </div>

          {/* Proposal Tips */}
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <h4 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
                <Star className="h-4 w-4" />
                Tips for a winning proposal
              </h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Be specific about your approach to the project</li>
                <li>• Include relevant examples from your portfolio</li>
                <li>• Ask clarifying questions to show engagement</li>
                <li>• Be realistic with your timeline and pricing</li>
              </ul>
            </CardContent>
          </Card>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? "Submitting..." : "Submit Proposal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProposalForm;
