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
import { USE_MOCK_DATA } from "@/lib/featureFlags";

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

// Simple mock data used when USE_MOCK_DATA is enabled
const mockJobs: JobPosting[] = [
  {
    id: 'job_1',
    clientId: 'c1',
    title: 'React Developer for E-commerce Platform',
    description: 'Build a responsive e-commerce frontend using React and TypeScript.',
    category: 'Web Development',
    subcategory: 'Frontend',
    skills: ['React', 'TypeScript', 'Tailwind'],
    budget: { type: 'fixed', amount: 5000, min: 0, max: 0 },
    duration: '2-3 months',
    experienceLevel: 'intermediate',
    status: 'open',
    postedDate: new Date().toISOString(),
    deadline: undefined,
    applicationsCount: 12,
    proposals: [],
    client: {
      id: 'c1',
      name: 'TechCorp Inc.',
      email: '',
      avatar: '',
      location: 'Remote',
      timezone: 'UTC',
      verified: true,
      joinedDate: new Date().toISOString(),
      companyName: 'TechCorp',
      totalSpent: 0,
      jobsPosted: 5,
      hireRate: 0,
      rating: 4.8,
      paymentVerified: true,
    },
    visibility: 'public'
  }
];

const mockFreelancers: FreelancerProfile[] = [
  {
    id: 'freelancer_1',
    userId: 'freelancer_1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    avatar: '',
    location: 'Remote',
    timezone: 'UTC',
    verified: true,
    joinedDate: new Date().toISOString(),
    title: 'Senior React Developer',
    bio: 'Experienced frontend developer.',
    hourlyRate: 60,
    skills: ['React','TypeScript'],
    rating: 4.9,
    totalEarned: 12000,
    completedJobs: 34,
    successRate: 95,
    languages: ['English'],
    education: [],
    certifications: [],
    portfolio: [],
    availability: 'available',
    responseTime: 'within 24 hours'
  }
];

const mockProjects: Project[] = [
  {
    id: 'project_1',
    jobId: 'job_1',
    clientId: 'c1',
    freelancerId: 'freelancer_1',
    title: 'E-commerce Frontend',
    description: 'Frontend build for e-commerce platform',
    budget: 5000,
    status: 'active',
    startDate: new Date().toISOString(),
    endDate: undefined,
    milestones: [],
    contractTerms: '',
    escrowAmount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const freelanceService = {
  // Freelancer operations (delegated)
  async searchFreelancers(filters: SearchFilters): Promise<FreelancerProfile[]> {
    if (USE_MOCK_DATA) {
      return mockFreelancers.filter(f => {
        if (filters.skills && filters.skills.length) {
          return filters.skills.every(s => f.skills.includes(s));
        }
        return true;
      });
    }
    return realFreelanceService.searchFreelancers(filters);
  },

  async getFreelancerProfile(id: string): Promise<FreelancerProfile | null> {
    if (USE_MOCK_DATA) {
      return mockFreelancers.find(f => f.id === id) || null;
    }
    return realFreelanceService.getFreelancerProfile(id);
  },

  async updateFreelancerProfile(
    id: string,
    updates: Partial<FreelancerProfile>
  ): Promise<FreelancerProfile> {
    if (USE_MOCK_DATA) {
      const idx = mockFreelancers.findIndex(f => f.id === id);
      if (idx === -1) throw new Error('Freelancer not found');
      mockFreelancers[idx] = { ...mockFreelancers[idx], ...updates } as FreelancerProfile;
      return mockFreelancers[idx];
    }
    return realFreelanceService.updateFreelancerProfile(id, updates);
  },

  // Job operations (delegated)
  async searchJobs(filters: SearchFilters): Promise<JobPosting[]> {
    if (USE_MOCK_DATA) {
      return mockJobs.filter(job => {
        if (filters.category && job.category !== filters.category) return false;
        if (filters.skills && filters.skills.length) {
          return filters.skills.every(s => job.skills.includes(s));
        }
        return true;
      });
    }
    return realFreelanceService.searchJobs(filters);
  },

  async getJobPosting(id: string): Promise<JobPosting | null> {
    if (USE_MOCK_DATA) {
      return mockJobs.find(j => j.id === id) || null;
    }
    return realFreelanceService.getJobPosting(id);
  },

  async createJobPosting(
    job: Omit<JobPosting, "id" | "postedDate" | "applicationsCount" | "proposals">
  ): Promise<JobPosting> {
    if (USE_MOCK_DATA) {
      const newJob: JobPosting = {
        ...job,
        id: `job_${Date.now()}`,
        postedDate: new Date().toISOString(),
        applicationsCount: 0,
        proposals: []
      } as JobPosting;
      mockJobs.unshift(newJob);
      return newJob;
    }
    return realFreelanceService.createJobPosting(job);
  },

  // Proposal operations (delegated)
  async submitProposal(
    proposal: Omit<Proposal, "id" | "submittedDate" | "status">
  ): Promise<Proposal> {
    if (USE_MOCK_DATA) {
      const newProposal: Proposal = {
        id: `prop_${Date.now()}`,
        jobId: (proposal as any).jobId || 'job_1',
        freelancerId: (proposal as any).freelancerId || 'freelancer_1',
        coverLetter: (proposal as any).coverLetter || '',
        proposedRate: (proposal as any).proposedRate || 0,
        proposedDuration: (proposal as any).proposedDuration || '',
        attachments: (proposal as any).attachments || [],
        status: 'pending',
        submittedDate: new Date().toISOString(),
      };
      return newProposal;
    }
    return realFreelanceService.submitProposal(proposal);
  },

  async getProposals(freelancerId: string): Promise<Proposal[]> {
    if (USE_MOCK_DATA) {
      return [];
    }
    return realFreelanceService.getProposals(freelancerId);
  },

  // Project operations (real implementations)
  async getProjects(
    userId: string,
    userType: "freelancer" | "client"
  ): Promise<Project[]> {
    if (USE_MOCK_DATA) {
      return mockProjects;
    }
    return realFreelanceService.getProjects(userId, userType);
  },

  async getProject(id: string): Promise<Project | null> {
    if (USE_MOCK_DATA) {
      return mockProjects.find(p => p.id === id) || null;
    }

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
    if (USE_MOCK_DATA) {
      const idx = mockProjects.findIndex(p => p.id === id);
      if (idx === -1) throw new Error('Project not found');
      mockProjects[idx].status = status;
      return mockProjects[idx];
    }
    return realFreelanceService.updateProjectStatus(id, status);
  },

  // Stats and analytics (delegated)
  async getFreelanceStats(freelancerId: string): Promise<FreelanceStats> {
    if (USE_MOCK_DATA) {
      return {
        totalProjects: 12,
        completedProjects: 10,
        totalEarnings: 25000,
        averageRating: 4.8,
        responseTime: 12,
        successRate: 83,
        repeatClients: 3,
      } as FreelanceStats;
    }
    return realFreelanceService.getFreelanceStats(freelancerId);
  },

  // Categories and skills (delegated with real fallbacks)
  async getCategories(): Promise<string[]> {
    if (USE_MOCK_DATA) return [
      "Web Development",
      "Mobile Development",
      "Design",
      "Writing & Content",
      "Digital Marketing",
    ];

    const { data, error } = await supabase
      .from('freelance_categories')
      .select('name')
      .order('name');
    if (error) return [];
    return data?.map((c: any) => c.name) || [];
  },

  async getSkills(): Promise<string[]> {
    if (USE_MOCK_DATA) return ["React", "Node.js", "Python", "TypeScript", "Figma"];

    const { data, error } = await supabase
      .from('freelance_skills')
      .select('name')
      .order('name');
    if (error) return [];
    return data?.map((s: any) => s.name) || [];
  },
};
