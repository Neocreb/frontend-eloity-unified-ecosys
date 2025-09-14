import { 
  FreelancerProfile,
  ClientProfile,
  JobPosting,
  Proposal,
  Project,
  SearchFilters,
  FreelanceStats,
} from "@/types/freelance";
import { supabase } from "@/integrations/supabase/client";
import { realFreelanceService } from "./realFreelanceService";

function mapDatabaseToProject(data: any): Project {
  return {
    id: data.id,
    jobId: data.job_id,
    clientId: data.client_id,
    freelancerId: data.freelancer_id,
    title: data.job?.title || "Project",
    description: data.job?.description || "",
    budget: data.agreed_budget || 0,
    status: data.status,
    startDate: data.start_date || data.created_at,
    endDate: data.end_date,
    milestones:
      data.milestones?.map((m: any) => ({
        id: m.id,
        projectId: data.id,
        title: m.title,
        description: m.description,
        amount: m.amount,
        dueDate: m.due_date,
        status: m.status,
        submissionDate: m.submission_date,
        approvalDate: m.approval_date,
        deliverables: m.deliverables || [],
      })) || [],
    contractTerms: data.contract_terms,
    escrowAmount: data.escrow_amount,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export const freelanceService = {
  // Freelancer operations (delegated)
  async searchFreelancers(filters: SearchFilters): Promise<FreelancerProfile[]> {
    return realFreelanceService.searchFreelancers(filters);
  },

  async getFreelancerProfile(id: string): Promise<FreelancerProfile | null> {
    return realFreelanceService.getFreelancerProfile(id);
  },

  async updateFreelancerProfile(
    id: string,
    updates: Partial<FreelancerProfile>
  ): Promise<FreelancerProfile> {
    return realFreelanceService.updateFreelancerProfile(id, updates);
  },

  // Job operations (delegated)
  async searchJobs(filters: SearchFilters): Promise<JobPosting[]> {
    return realFreelanceService.searchJobs(filters);
  },

  async getJobPosting(id: string): Promise<JobPosting | null> {
    return realFreelanceService.getJobPosting(id);
  },

  async createJobPosting(
    job: Omit<JobPosting, "id" | "postedDate" | "applicationsCount" | "proposals">
  ): Promise<JobPosting> {
    return realFreelanceService.createJobPosting(job);
  },

  // Proposal operations (delegated)
  async submitProposal(
    proposal: Omit<Proposal, "id" | "submittedDate" | "status">
  ): Promise<Proposal> {
    return realFreelanceService.submitProposal(proposal);
  },

  async getProposals(freelancerId: string): Promise<Proposal[]> {
    return realFreelanceService.getProposals(freelancerId);
  },

  // Project operations (real implementations)
  async getProjects(
    userId: string,
    userType: "freelancer" | "client"
  ): Promise<Project[]> {
    return realFreelanceService.getProjects(userId, userType);
  },

  async getProject(id: string): Promise<Project | null> {
    const { data, error } = await supabase
      .from("freelance_projects")
      .select(
        `*,
        job:freelance_jobs!job_id (
          id,
          title,
          description,
          category,
          skills
        ),
        freelancer:profiles!freelancer_id (
          id,
          full_name,
          username,
          avatar_url
        ),
        client:profiles!client_id (
          id,
          full_name,
          username,
          avatar_url
        ),
        milestones:project_milestones (
          id,
          title,
          description,
          amount,
          due_date,
          status,
          submission_date,
          approval_date,
          deliverables
        )`
      )
      .eq("id", id)
      .single();

    if (error) return null;
    return data ? mapDatabaseToProject(data) : null;
  },

  async updateProjectStatus(
    id: string,
    status: Project["status"]
  ): Promise<Project> {
    return realFreelanceService.updateProjectStatus(id, status);
  },

  // Stats and analytics (delegated)
  async getFreelanceStats(freelancerId: string): Promise<FreelanceStats> {
    return realFreelanceService.getFreelanceStats(freelancerId);
  },

  // Categories and skills (delegated with real fallbacks)
  async getCategories(): Promise<string[]> {
    const { data, error } = await supabase
      .from('freelance_categories')
      .select('name')
      .order('name');
    if (error) return [];
    return data?.map((c: any) => c.name) || [];
  },

  async getSkills(): Promise<string[]> {
    const { data, error } = await supabase
      .from('freelance_skills')
      .select('name')
      .order('name');
    if (error) return [];
    return data?.map((s: any) => s.name) || [];
  },
};
