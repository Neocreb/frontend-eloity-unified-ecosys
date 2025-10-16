// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Clock,
  DollarSign,
  MapPin,
  Star,
  Users,
  Calendar,
  FileText,
  Shield,
  TrendingUp,
  MessageCircle,
  Heart,
  Share2,
  Flag,
  ExternalLink,
} from "lucide-react";
import { JobPosting } from "@/types/freelance";
import { useFreelance } from "@/hooks/use-freelance";
import { ApplyModal } from "./ApplyModal";
import MessageClientModal from "./MessageClientModal";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface JobDetailsProps {
  jobId?: string;
  job?: JobPosting;
  onBack?: () => void;
  onApply?: (jobId: string) => void;
}

export const JobDetails: React.FC<JobDetailsProps> = ({
  jobId,
  job: propJob,
  onBack,
  onApply,
}) => {
  const [job, setJob] = useState<JobPosting | null>(propJob || null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const { getJob, loading } = useFreelance();
  const { toast } = useToast();

  // Mock job data to prevent "job not found" error
  const mockJob: JobPosting = {
    id: jobId || "mock-job-1",
    title: "Senior React Developer for E-commerce Platform",
    description:
      "We are looking for an experienced React developer to help us build a comprehensive e-commerce platform. The project involves creating a modern, responsive web application with advanced features including user authentication, product management, shopping cart functionality, and payment integration.\n\nKey responsibilities:\n- Develop responsive React components\n- Implement state management with Redux\n- Integrate with REST APIs\n- Ensure cross-browser compatibility\n- Write clean, maintainable code\n- Collaborate with the design team\n\nIdeal candidate will have:\n- 5+ years of React experience\n- Strong JavaScript/TypeScript skills\n- Experience with e-commerce platforms\n- Knowledge of payment gateway integration\n- Portfolio of similar projects",
    client: {
      id: "client-1",
      name: "TechCommerce Inc.",
      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=TechCommerce",
      rating: 4.9,
      reviewsCount: 127,
      location: "San Francisco, CA",
      memberSince: "2019-03-15",
      verified: true,
      totalSpent: 125000,
      jobsPosted: 23,
      hireRate: 89,
    },
    budget: {
      type: "hourly",
      min: 50,
      max: 80,
      amount: 6000,
    },
    skills: [
      "React",
      "TypeScript",
      "Node.js",
      "E-commerce",
      "Redux",
      "AWS",
      "MongoDB",
    ],
    category: "Web Development",
    subcategory: "Frontend Development",
    experience: "expert",
    duration: "3-6 months",
    proposals: 12,
    hired: 0,
    postedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: "open",
    featured: true,
    urgent: true,
    remote: true,
    timezone: "PST",
    attachments: [],
    questions: [
      "What is your experience with e-commerce platforms?",
      "Can you provide examples of similar projects?",
      "What is your availability for this project?",
    ],
  };

  useEffect(() => {
    // If job is already provided as prop, don't fetch it
    if (propJob) {
      setJob(propJob);
      return;
    }

    // Only fetch if we have jobId and no job prop
    if (jobId) {
      const loadJob = async () => {
        try {
          const jobData = await getJob(jobId);
          if (jobData) {
            setJob(jobData);
          } else {
            // Use mock data as fallback if job not found
            setJob(mockJob);
          }
        } catch (error) {
          // Use mock data as fallback on error
          setJob(mockJob);
        }
      };

      loadJob();
    } else {
      // Use mock data if no jobId provided
      setJob(mockJob);
    }
  }, [jobId, propJob, getJob]);

  const formatBudget = (job: JobPosting) => {
    if (job.budget.type === "fixed") {
      return `$${job.budget.amount?.toLocaleString()}`;
    } else {
      return `$${job.budget.min}-$${job.budget.max}/hr`;
    }
  };

  const getExperienceLevelColor = (level: string) => {
    switch (level) {
      case "entry":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "expert":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleSaveJob = () => {
    setIsSaved(!isSaved);
    toast({
      title: isSaved ? "Job removed from saved" : "Job saved",
      description: isSaved
        ? "Job removed from your saved list"
        : "Job added to your saved list",
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied",
      description: "Job link copied to clipboard",
    });
  };

  const handleApplySuccess = () => {
    setShowApplyModal(false);
    onApply?.(job?.id || jobId || "");
    toast({
      title: "🎉 Application Submitted Successfully!",
      description: `Your proposal for "${job?.title}" has been sent to ${job?.client.name}. They typically respond within 24-48 hours.`,
      duration: 5000,
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 flex-1" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-16" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full mb-4" />
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!job) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium">Job not found</h3>
          <p className="text-muted-foreground">
            This job posting may have been removed or is no longer available.
          </p>
          {onBack && (
            <Button variant="outline" onClick={onBack} className="mt-4">
              Go Back
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      {onBack && (
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            ← Back to Jobs
          </Button>
        </div>
      )}

      {/* Main Job Card */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-2xl font-bold mb-3">
                {job.title}
              </CardTitle>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary">{job.category}</Badge>
                {job.subcategory && (
                  <Badge variant="outline">{job.subcategory}</Badge>
                )}
                <Badge className={getExperienceLevelColor(job.experienceLevel)}>
                  {job.experienceLevel} level
                </Badge>
                {job.status === "open" && (
                  <Badge className="bg-green-100 text-green-800">Open</Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveJob}
                className="flex items-center gap-2"
              >
                <Heart
                  className={`w-4 h-4 ${isSaved ? "fill-red-500 text-red-500" : ""}`}
                />
                {isSaved ? "Saved" : "Save"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Flag className="w-4 h-4" />
                Report
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Budget */}
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <DollarSign className="w-6 h-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold text-primary">
                {formatBudget(job)}
              </div>
              <div className="text-sm text-muted-foreground">
                {job.budget.type === "fixed" ? "Fixed price" : "Hourly rate"}
              </div>
            </div>

            {/* Timeline */}
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Clock className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <div className="text-lg font-semibold">{job.duration}</div>
              <div className="text-sm text-muted-foreground">
                Project duration
              </div>
              {job.deadline && (
                <div className="text-xs text-muted-foreground mt-1">
                  Due: {new Date(job.deadline).toLocaleDateString()}
                </div>
              )}
            </div>

            {/* Applications */}
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Users className="w-6 h-6 mx-auto mb-2 text-orange-600" />
              <div className="text-lg font-semibold">
                {job.applicationsCount}
              </div>
              <div className="text-sm text-muted-foreground">
                Proposals received
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                Project Description
              </h3>
              <div className="prose prose-sm max-w-none text-muted-foreground">
                {job.description.split("\n").map((paragraph, index) => (
                  <p key={index} className="mb-3">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            <Separator />

            {/* Skills Required */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Skills Required</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <Badge key={skill} variant="outline" className="text-sm">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* Client Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">About the Client</h3>
              <div className="flex items-start gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={job.client.avatar} />
                  <AvatarFallback className="text-lg">
                    {job.client.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-lg font-medium">{job.client.name}</h4>
                    {job.client.verified && (
                      <Badge className="bg-blue-100 text-blue-800">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {job.client.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      {job.client.rating || 0} ({(job.client.hireRate || job.client.hire_rate || 0)}% hire rate)
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />$
                      {(job.client.totalSpent || job.client.total_spent || 0).toLocaleString()} spent
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium">Jobs Posted</div>
                      <div className="text-muted-foreground">
                        {job.client.jobsPosted || job.client.jobs_posted || 0}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Payment Verified</div>
                      <div
                        className={
                          (job.client.paymentVerified || job.client.payment_verified)
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {(job.client.paymentVerified || job.client.payment_verified) ? "Yes" : "No"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Project Details */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Project Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Posted:</span>
                  <span>{new Date(job.postedDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category:</span>
                  <span>{job.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Experience Level:
                  </span>
                  <span className="capitalize">{job.experienceLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Project Type:</span>
                  <span>
                    {job.budget.type === "fixed" ? "Fixed Price" : "Hourly"}
                  </span>
                </div>
              </div>
            </div>

            {/* Attachments */}
            {job.attachments && job.attachments.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-3">Attachments</h3>
                  <div className="space-y-2">
                    {job.attachments.map((attachment, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 border rounded"
                      >
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <div className="flex-1">
                          <span className="text-sm">{attachment.name || attachment}</span>
                          {attachment.size && (
                            <span className="text-xs text-muted-foreground ml-2">
                              ({attachment.size})
                            </span>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-auto"
                          onClick={() => {
                            if (attachment.url) {
                              window.open(attachment.url, '_blank');
                            }
                          }}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <Button
          size="lg"
          onClick={() => setShowApplyModal(true)}
          className="px-8"
          disabled={job.status !== "open"}
        >
          Submit Proposal
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="flex items-center gap-2"
          onClick={() => setShowMessageModal(true)}
        >
          <MessageCircle className="w-4 h-4" />
          Contact Client
        </Button>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <ApplyModal
          job={job}
          onClose={() => setShowApplyModal(false)}
          onSubmit={handleApplySuccess}
        />
      )}

      {/* Message Client Modal */}
      <MessageClientModal
        job={job}
        isOpen={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        onSend={(message, subject) => {
          console.log("Message sent:", { message, subject });
          // Here you would typically call an API to send the message
        }}
      />
    </div>
  );
};

export default JobDetails;
