// @ts-nocheck
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
    console.warn("searchFreelancers: Database table 'freelancer_profiles' does not exist yet. Returning empty array.");
    return [];
  }

  static async getFreelancerProfile(id: string): Promise<FreelancerProfile | null> {
    console.warn("getFreelancerProfile: Database table 'freelancer_profiles' does not exist yet. Returning null.");
    return null;
  }

  static async updateFreelancerProfile(id: string, updates: Partial<FreelancerProfile>): Promise<FreelancerProfile | null> {
    console.warn("updateFreelancerProfile: Database table 'freelancer_profiles' does not exist yet. Returning null.");
    return null;
  }

  // Proposal operations
  static async submitProposal(proposalData: Omit<Proposal, "id" | "submittedDate" | "status">): Promise<Proposal | null> {
    console.warn("submitProposal: Database table 'proposals' does not exist yet. Returning null.");
    return null;
  }

  static async getProposals(freelancerId: string): Promise<Proposal[]> {
    console.warn("getProposals: Database table 'proposals' does not exist yet. Returning empty array.");
    return [];
  }

  // Project operations
  static async getProjects(userId: string, userType: "freelancer" | "client"): Promise<Project[]> {
    console.warn("getProjects: Database table 'projects' does not exist yet. Returning empty array.");
    return [];
  }

  static async getProject(id: string): Promise<Project | null> {
    console.warn("getProject: Database table 'projects' does not exist yet. Returning null.");
    return null;
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
    console.warn("getFreelanceStats: Database table 'freelance_stats' does not exist yet. Returning null.");
    return null;
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