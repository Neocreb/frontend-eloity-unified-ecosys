// @ts-nocheck
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Briefcase,
  TrendingUp,
  DollarSign,
  Clock,
  Users,
  Filter,
  BookOpen,
  Star,
  Award,
} from "lucide-react";
import { JobPosting } from "@/types/freelance";
import JobList from "@/components/freelance/JobList";
import JobDetails from "@/components/freelance/JobDetails";
import TalentsList, { Talent } from "@/components/freelance/TalentsList";
import TalentProfile from "@/components/freelance/TalentProfile";
import { useFreelance } from "@/hooks/use-freelance";
import { useAuth } from "@/contexts/AuthContext";
import EnhancedFreelanceHub from "@/components/freelance/EnhancedFreelanceHub";

export const FreelanceJobs: React.FC = () => {
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [selectedTalent, setSelectedTalent] = useState<Talent | null>(null);
  const [activeTab, setActiveTab] = useState("browse");
  const { user } = useAuth();

  const handleJobSelect = (job: JobPosting) => {
    setSelectedJob(job);
  };

  const handleTalentSelect = (talent: Talent) => {
    setSelectedTalent(talent);
  };

  const handleBack = () => {
    setSelectedJob(null);
    setSelectedTalent(null);
  };

  const handleApply = (jobId: string) => {
    // Handle successful application
    setSelectedJob(null);
    setActiveTab("proposals");
  };

  const handleHire = (talentId: string) => {
    // Handle talent hiring
    setSelectedTalent(null);
    // Could redirect to messaging or contract creation
  };

  // Preserve existing modal functionality - exactly as it was
  if (selectedJob) {
    return (
      <div className="container mx-auto px-4 py-6">
        <JobDetails
          job={selectedJob}
          jobId={selectedJob.id}
          onBack={handleBack}
          onApply={handleApply}
        />
      </div>
    );
  }

  if (selectedTalent) {
    return (
      <TalentProfile
        talentId={selectedTalent.id}
        onBack={handleBack}
        onHire={handleHire}
      />
    );
  }

  // Use the new enhanced freelance hub for the main view
  return <EnhancedFreelanceHub />;
};

export default FreelanceJobs;
