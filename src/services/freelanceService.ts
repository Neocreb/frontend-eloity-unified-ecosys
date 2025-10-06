import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { UserService, UserWithProfile } from "./userService.ts";
import {
  FreelancerProfile,
  JobPosting,
  Proposal,
  Project,
  SearchFilters,
  FreelanceStats,
  Milestone,
} from "@/types/freelance";

export class FreelanceService {
  // Job operations (using real Supabase database)
  static async searchJobs(filters: SearchFilters): Promise<JobPosting[]> {
    try {
      let query = supabase
        .from('job_postings')
        .select('*')
        .eq('status', 'active');

      if (filters.query) {
        query = query.ilike('title', `%${filters.query}%`);
      }

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.skills && filters.skills.length > 0) {
        query = query.overlaps('skills', filters.skills);
      }

      const { data, error } = await query.order('posted_date', { ascending: false });

      if (error) {
        console.error("Error searching jobs:", error);
        return [];
      }

      return data.map(job => ({
        id: job.id,
        clientId: job.client_id,
        title: job.title,
        description: job.description,
        category: job.category,
        subcategory: job.subcategory || undefined,
        skills: job.skills || [],
        budget: {
          type: job.budget_type as "fixed" | "hourly",
          amount: job.budget_amount,
          range: job.budget_min && job.budget_max ? 
            { min: job.budget_min, max: job.budget_max } : undefined
        },
        duration: job.duration,
        experience: job.experience_level as "entry" | "intermediate" | "expert",
        status: job.status as "draft" | "active" | "closed" | "in_progress" | "completed",
        postedDate: new Date(job.posted_date),
        deadline: job.deadline ? new Date(job.deadline) : undefined,
        applicationsCount: job.applications_count || 0,
        proposals: [], // Will need to fetch separately if needed
        attachments: job.attachments || [],
        location: job.location || undefined,
        isRemote: job.is_remote || false,
        createdAt: new Date(job.created_at),
        updatedAt: new Date(job.updated_at)
      }));
    } catch (error) {
      console.error("Error in searchJobs:", error);
      return [];
    }
  }

  static async getJobPosting(id: string): Promise<JobPosting | null> {
    try {
      const { data, error } = await supabase
        .from('job_postings')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error("Error fetching job:", error);
        return null;
      }

      if (!data) return null;

      return {
        id: data.id,
        clientId: data.client_id,
        title: data.title,
        description: data.description,
        category: data.category,
        subcategory: data.subcategory || undefined,
        skills: data.skills || [],
        budget: {
          type: data.budget_type as "fixed" | "hourly",
          amount: data.budget_amount,
          range: data.budget_min && data.budget_max ? 
            { min: data.budget_min, max: data.budget_max } : undefined
        },
        duration: data.duration,
        experience: data.experience_level as "entry" | "intermediate" | "expert",
        status: data.status as "draft" | "active" | "closed" | "in_progress" | "completed",
        postedDate: new Date(data.posted_date),
        deadline: data.deadline ? new Date(data.deadline) : undefined,
        applicationsCount: data.applications_count || 0,
        proposals: [],
        attachments: data.attachments || [],
        location: data.location || undefined,
        isRemote: data.is_remote || false,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      console.error("Error in getJobPosting:", error);
      return null;
    }
  }

  static async createJobPosting(jobData: Omit<JobPosting, "id" | "postedDate" | "applicationsCount" | "proposals">): Promise<JobPosting | null> {
    try {
      const { data, error } = await supabase
        .from('job_postings')
        .insert([{
          client_id: jobData.clientId,
          title: jobData.title,
          description: jobData.description,
          category: jobData.category,
          subcategory: jobData.subcategory,
          skills: jobData.skills,
          budget_type: jobData.budget.type,
          budget_amount: jobData.budget.amount,
          budget_min: jobData.budget.range?.min,
          budget_max: jobData.budget.range?.max,
          duration: jobData.duration,
          experience_level: jobData.experience,
          status: jobData.status,
          deadline: jobData.deadline?.toISOString(),
          attachments: jobData.attachments,
          location: jobData.location,
          is_remote: jobData.isRemote,
          posted_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error("Error creating job:", error);
        return null;
      }

      return {
        id: data.id,
        clientId: data.client_id,
        title: data.title,
        description: data.description,
        category: data.category,
        subcategory: data.subcategory || undefined,
        skills: data.skills || [],
        budget: {
          type: data.budget_type as "fixed" | "hourly",
          amount: data.budget_amount,
          range: data.budget_min && data.budget_max ? 
            { min: data.budget_min, max: data.budget_max } : undefined
        },
        duration: data.duration,
        experience: data.experience_level as "entry" | "intermediate" | "expert",
        status: data.status as "draft" | "active" | "closed" | "in_progress" | "completed",
        postedDate: new Date(data.posted_date),
        deadline: data.deadline ? new Date(data.deadline) : undefined,
        applicationsCount: data.applications_count || 0,
        proposals: [],
        attachments: data.attachments || [],
        location: data.location || undefined,
        isRemote: data.is_remote || false,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      console.error("Error in createJobPosting:", error);
      return null;
    }
  }

  // Freelancer operations
  static async searchFreelancers(filters: SearchFilters): Promise<FreelancerProfile[]> {
    try {
      let query = supabase
        .from('freelancer_profiles')
        .select('*');

      if (filters.query) {
        query = query.ilike('title', `%${filters.query}%`);
      }

      if (filters.skills && filters.skills.length > 0) {
        query = query.overlaps('skills', filters.skills);
      }

      const { data, error } = await query.order('rating', { ascending: false });

      if (error) {
        console.error("Error searching freelancers:", error);
        return [];
      }

      return data.map(profile => ({
        id: profile.id,
        userId: profile.user_id,
        title: profile.title,
        description: profile.description,
        skills: profile.skills || [],
        hourlyRate: profile.hourly_rate || 0,
        experience: profile.experience || "",
        portfolio: profile.portfolio || [],
        rating: profile.rating || 0,
        reviewCount: profile.review_count || 0,
        totalEarnings: profile.total_earnings || 0,
        completedProjects: profile.completed_projects || 0,
        availability: profile.availability as "available" | "busy" | "unavailable" || "available",
        languages: profile.languages || [],
        education: profile.education || [],
        certifications: profile.certifications || [],
        createdAt: new Date(profile.created_at),
        updatedAt: new Date(profile.updated_at)
      }));
    } catch (error) {
      console.error("Error in searchFreelancers:", error);
      return [];
    }
  }

  static async getFreelancerProfile(id: string): Promise<FreelancerProfile | null> {
    try {
      const { data, error } = await supabase
        .from('freelancer_profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error("Error fetching freelancer profile:", error);
        return null;
      }

      if (!data) return null;

      return {
        id: data.id,
        userId: data.user_id,
        title: data.title,
        description: data.description,
        skills: data.skills || [],
        hourlyRate: data.hourly_rate || 0,
        experience: data.experience || "",
        portfolio: data.portfolio || [],
        rating: data.rating || 0,
        reviewCount: data.review_count || 0,
        totalEarnings: data.total_earnings || 0,
        completedProjects: data.completed_projects || 0,
        availability: data.availability as "available" | "busy" | "unavailable" || "available",
        languages: data.languages || [],
        education: data.education || [],
        certifications: data.certifications || [],
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      console.error("Error in getFreelancerProfile:", error);
      return null;
    }
  }

  static async updateFreelancerProfile(id: string, updates: Partial<FreelancerProfile>): Promise<FreelancerProfile | null> {
    try {
      const { data, error } = await supabase
        .from('freelancer_profiles')
        .update({
          title: updates.title,
          description: updates.description,
          skills: updates.skills,
          hourly_rate: updates.hourlyRate,
          experience: updates.experience,
          portfolio: updates.portfolio,
          availability: updates.availability,
          languages: updates.languages,
          education: updates.education,
          certifications: updates.certifications,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error("Error updating freelancer profile:", error);
        return null;
      }

      return {
        id: data.id,
        userId: data.user_id,
        title: data.title,
        description: data.description,
        skills: data.skills || [],
        hourlyRate: data.hourly_rate || 0,
        experience: data.experience || "",
        portfolio: data.portfolio || [],
        rating: data.rating || 0,
        reviewCount: data.review_count || 0,
        totalEarnings: data.total_earnings || 0,
        completedProjects: data.completed_projects || 0,
        availability: data.availability as "available" | "busy" | "unavailable" || "available",
        languages: data.languages || [],
        education: data.education || [],
        certifications: data.certifications || [],
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      console.error("Error in updateFreelancerProfile:", error);
      return null;
    }
  }

  // Proposal operations
  static async submitProposal(proposalData: Omit<Proposal, "id" | "submittedDate" | "status">): Promise<Proposal | null> {
    try {
      const { data, error } = await supabase
        .from('proposals')
        .insert([{
          job_id: proposalData.jobId,
          freelancer_id: proposalData.freelancerId,
          cover_letter: proposalData.coverLetter,
          proposed_rate: proposalData.proposedRate,
          proposed_duration: proposalData.proposedDuration,
          attachments: proposalData.attachments,
          status: 'pending',
          submitted_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error("Error submitting proposal:", error);
        return null;
      }

      // Update job applications count
      await supabase
        .from('job_postings')
        .update({ 
          applications_count: supabase.rpc('increment', { row_id: proposalData.jobId, column: 'applications_count' })
        })
        .eq('id', proposalData.jobId);

      return {
        id: data.id,
        jobId: data.job_id,
        freelancerId: data.freelancer_id,
        coverLetter: data.cover_letter,
        proposedRate: data.proposed_rate,
        proposedDuration: data.proposed_duration,
        attachments: data.attachments || [],
        status: data.status as "pending" | "accepted" | "rejected" | "withdrawn",
        submittedDate: new Date(data.submitted_date),
        client: undefined // Would need to fetch client data separately if needed
      };
    } catch (error) {
      console.error("Error in submitProposal:", error);
      return null;
    }
  }

  static async getProposals(freelancerId: string): Promise<Proposal[]> {
    try {
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('freelancer_id', freelancerId)
        .order('submitted_date', { ascending: false });

      if (error) {
        console.error("Error fetching proposals:", error);
        return [];
      }

      return data.map(proposal => ({
        id: proposal.id,
        jobId: proposal.job_id,
        freelancerId: proposal.freelancer_id,
        coverLetter: proposal.cover_letter,
        proposedRate: proposal.proposed_rate,
        proposedDuration: proposal.proposed_duration,
        attachments: proposal.attachments || [],
        status: proposal.status as "pending" | "accepted" | "rejected" | "withdrawn",
        submittedDate: new Date(proposal.submitted_date),
        client: undefined
      }));
    } catch (error) {
      console.error("Error in getProposals:", error);
      return [];
    }
  }

  // Project operations
  static async getProjects(userId: string, userType: "freelancer" | "client"): Promise<Project[]> {
    try {
      let query = supabase.from('projects').select('*');
      
      if (userType === "freelancer") {
        query = query.eq('freelancer_id', userId);
      } else {
        query = query.eq('client_id', userId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching projects:", error);
        return [];
      }

      return data.map(project => ({
        id: project.id,
        jobId: project.job_id,
        clientId: project.client_id,
        freelancerId: project.freelancer_id,
        title: project.title,
        description: project.description,
        budget: project.budget,
        status: project.status as "pending" | "active" | "completed" | "cancelled" | "disputed",
        startDate: new Date(project.start_date),
        endDate: project.end_date ? new Date(project.end_date) : undefined,
        milestones: [], // Will need to fetch separately if needed
        contractTerms: project.contract_terms || "",
        escrowAmount: project.escrow_amount,
        createdAt: new Date(project.created_at),
        updatedAt: new Date(project.updated_at)
      }));
    } catch (error) {
      console.error("Error in getProjects:", error);
      return [];
    }
  }

  static async getProject(id: string): Promise<Project | null> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error("Error fetching project:", error);
        return null;
      }

      if (!data) return null;

      return {
        id: data.id,
        jobId: data.job_id,
        clientId: data.client_id,
        freelancerId: data.freelancer_id,
        title: data.title,
        description: data.description,
        budget: data.budget,
        status: data.status as "pending" | "active" | "completed" | "cancelled" | "disputed",
        startDate: new Date(data.start_date),
        endDate: data.end_date ? new Date(data.end_date) : undefined,
        milestones: [],
        contractTerms: data.contract_terms || "",
        escrowAmount: data.escrow_amount,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      console.error("Error in getProject:", error);
      return null;
    }
  }

  static async updateProjectStatus(id: string, status: Project["status"]): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error("Error updating project status:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in updateProjectStatus:", error);
      return false;
    }
  }

  // Stats
  static async getFreelanceStats(freelancerId: string): Promise<FreelanceStats | null> {
    try {
      // Get freelancer stats
      const { data, error } = await supabase
        .from('freelance_stats')
        .select('*')
        .eq('user_id', freelancerId)
        .single();

      if (error) {
        console.error("Error fetching freelance stats:", error);
        return null;
      }

      if (!data) return null;

      return {
        totalProjects: data.total_projects,
        completedProjects: data.completed_projects,
        totalEarnings: data.total_earnings,
        averageRating: data.average_rating,
        responseTime: data.response_time,
        successRate: data.success_rate,
        repeatClients: data.repeat_clients
      };
    } catch (error) {
      console.error("Error in getFreelanceStats:", error);
      return null;
    }
  }

  // Categories and skills
  static async getCategories(): Promise<string[]> {
    try {
      // In a real implementation, this would come from a database table
      return [
        "Web Development",
        "Mobile Development",
        "Design",
        "Writing",
        "Marketing",
        "Data Science",
        "DevOps",
        "Cybersecurity",
        "Finance",
        "Legal",
        "Translation",
        "Video Editing",
        "Photography",
        "3D Modeling",
        "Animation"
      ];
    } catch (error) {
      console.error("Error in getCategories:", error);
      return [];
    }
  }

  static async getSkills(): Promise<string[]> {
    try {
      // In a real implementation, this would come from a database table
      return [
        "React",
        "Vue.js",
        "Angular",
        "Node.js",
        "Python",
        "Java",
        "JavaScript",
        "TypeScript",
        "HTML",
        "CSS",
        "UI/UX Design",
        "Graphic Design",
        "Content Writing",
        "SEO",
        "Digital Marketing",
        "Data Analysis",
        "Machine Learning",
        "AWS",
        "Docker",
        "Kubernetes",
        "Blockchain",
        "Solidity",
        "Smart Contracts",
        "Project Management",
        "Agile",
        "Scrum"
      ];
    } catch (error) {
      console.error("Error in getSkills:", error);
      return [];
    }
  }
}