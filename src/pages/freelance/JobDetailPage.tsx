// @ts-nocheck
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2 } from "lucide-react";
import JobDetails from "@/components/freelance/JobDetails";
import { JobPosting } from "@/types/freelance";
import { useFreelance } from "@/hooks/use-freelance";

// Mock job data that includes sponsored jobs
const mockJobs: JobPosting[] = [
  {
    id: "sponsored-job-1",
    title: "Senior React Developer for E-commerce Platform",
    description: "Looking for an experienced React developer to build a modern e-commerce platform with advanced features including real-time inventory management, payment processing, and user analytics.",
    client: {
      id: "client-1",
      name: "TechStart Inc.",
      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=TechStart",
      rating: 4.9,
      location: "USA",
      verified: true,
      reviews: 156,
      jobsPosted: 45,
      totalSpent: 125000,
      memberSince: "2020-03-15",
      hireRate: 95,
      paymentVerified: true
    },
    budget: { 
      min: 50, 
      max: 80, 
      type: "hourly" as const 
    },
    skills: ["React", "TypeScript", "Node.js", "AWS", "MongoDB"],
    category: "Web Development",
    subcategory: "Frontend Development",
    experience_level: "expert",
    project_length: "3-6 months",
    workload: "full-time",
    posted_date: "2024-01-15T10:00:00Z",
    deadline: "2024-02-15T23:59:59Z",
    proposals_count: 12,
    client_budget_spent: 125000,
    client_reviews: 156,
    client_rating: 4.9,
    is_urgent: true,
    is_featured: true,
    is_sponsored: true,
    location: "Remote",
    attachments: [
      {
        name: "project-requirements.pdf",
        url: "/docs/project-requirements.pdf",
        size: "2.5 MB"
      }
    ],
    questions: [
      {
        question: "What is your experience with e-commerce platforms?",
        required: true
      },
      {
        question: "Can you provide examples of React applications you've built?",
        required: true
      },
      {
        question: "Are you available to start immediately?",
        required: false
      }
    ]
  },
  {
    id: "job-2",
    title: "UI/UX Designer for Mobile App",
    description: "We need a talented UI/UX designer to create intuitive and engaging designs for our mobile application. Experience with fintech apps is a plus.",
    client: {
      id: "client-2",
      name: "FinanceFlow",
      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=FinanceFlow",
      rating: 4.7,
      location: "Canada",
      verified: true,
      reviews: 89,
      jobsPosted: 23,
      totalSpent: 67000,
      memberSince: "2021-07-22",
      hireRate: 87,
      paymentVerified: true
    },
    budget: { 
      min: 3000, 
      max: 5000, 
      type: "fixed" as const 
    },
    skills: ["UI/UX Design", "Figma", "Adobe XD", "Mobile Design", "Prototyping"],
    category: "Design & Creative",
    subcategory: "UI/UX Design",
    experience_level: "intermediate",
    project_length: "1-3 months",
    workload: "part-time",
    posted_date: "2024-01-14T14:30:00Z",
    deadline: "2024-01-28T23:59:59Z",
    proposals_count: 8,
    client_budget_spent: 67000,
    client_reviews: 89,
    client_rating: 4.7,
    is_urgent: false,
    is_featured: false,
    is_sponsored: false,
    location: "Remote",
    attachments: [],
    questions: [
      {
        question: "What is your experience with mobile app design?",
        required: true
      }
    ]
  }
];

export const JobDetailPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(true);
  const { getJob } = useFreelance();

  useEffect(() => {
    const loadJob = async () => {
      if (!jobId) {
        navigate("/app/freelance");
        return;
      }

      setLoading(true);
      try {
        // Try to fetch from API first
        const fetchedJob = await getJob(jobId);
        if (fetchedJob) {
          setJob(fetchedJob);
        } else {
          // Fallback to mock data for sponsored jobs
          const mockJob = mockJobs.find(j => j.id === jobId);
          if (mockJob) {
            setJob(mockJob);
          } else {
            // Job not found
            navigate("/app/freelance");
            return;
          }
        }
      } catch (error) {
        console.error("Error loading job:", error);
        // Try fallback to mock data
        const mockJob = mockJobs.find(j => j.id === jobId);
        if (mockJob) {
          setJob(mockJob);
        } else {
          navigate("/app/freelance");
          return;
        }
      } finally {
        setLoading(false);
      }
    };

    loadJob();
  }, [jobId, getJob, navigate]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" onClick={() => navigate("/app/freelance")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="ml-2">Loading job details...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" onClick={() => navigate("/app/freelance")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-semibold mb-2">Job Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The job you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => navigate("/app/freelance")}>
                Browse Jobs
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => navigate("/app/freelance")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Button>
          
          {job.is_sponsored && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                Sponsored
              </Badge>
            </div>
          )}
        </div>

        <JobDetails job={job} />
      </div>
    </div>
  );
};

export default JobDetailPage;
