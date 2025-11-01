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
    try {
      // Check if the freelancer_profiles table exists
      const { data: tableExists, error: tableError } = await supabase
        .from('freelance_profiles')
        .select('id')
        .limit(1);

      if (tableError) {
        console.warn("searchFreelancers: Database table 'freelance_profiles' does not exist yet. Returning empty array.");
        return [];
      }

      let query = supabase
        .from('freelance_profiles')
        .select(`
          *,
          users:profiles(user_id, full_name, username, avatar_url, bio)
        `);

      if (filters.query) {
        query = query.ilike('professional_title', `%${filters.query}%`);
      }

      if (filters.skills && filters.skills.length > 0) {
        // This would require a join with user skills table
        // For now, we'll do a simple filter
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error("Error searching freelancers:", error);
        return [];
      }

      return data.map(profile => ({
        id: profile.id,
        userId: profile.user_id,
        title: profile.professional_title || "",
        description: profile.overview || "",
        skills: [], // Would need to fetch from user skills table
        hourlyRate: parseFloat(profile.hourly_rate || "0"),
        experience: profile.experience_level || "intermediate",
        portfolio: profile.portfolio_url ? [profile.portfolio_url] : [],
        rating: parseFloat(profile.success_rate || "0") * 5, // Convert to 5-star scale
        reviewCount: 0, // Would need to fetch from reviews table
        totalEarnings: parseFloat(profile.total_earnings || "0"),
        completedProjects: profile.completed_projects || 0,
        availability: profile.availability === "available" ? "available" : "busy",
        languages: Array.isArray(profile.languages) ? profile.languages : [],
        education: Array.isArray(profile.education) ? profile.education : [],
        certifications: Array.isArray(profile.certifications) ? profile.certifications : [],
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
        .from('freelance_profiles')
        .select(`
          *,
          users:profiles(user_id, full_name, username, avatar_url, bio)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.warn("getFreelancerProfile: Database table 'freelance_profiles' does not exist yet or profile not found. Returning null.");
        return null;
      }

      if (!data) return null;

      return {
        id: data.id,
        userId: data.user_id,
        title: data.professional_title || "",
        description: data.overview || "",
        skills: [], // Would need to fetch from user skills table
        hourlyRate: parseFloat(data.hourly_rate || "0"),
        experience: data.experience_level || "intermediate",
        portfolio: data.portfolio_url ? [data.portfolio_url] : [],
        rating: parseFloat(data.success_rate || "0") * 5, // Convert to 5-star scale
        reviewCount: 0, // Would need to fetch from reviews table
        totalEarnings: parseFloat(data.total_earnings || "0"),
        completedProjects: data.completed_projects || 0,
        availability: data.availability === "available" ? "available" : "busy",
        languages: Array.isArray(data.languages) ? data.languages : [],
        education: Array.isArray(data.education) ? data.education : [],
        certifications: Array.isArray(data.certifications) ? data.certifications : [],
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
      const updateData: any = {};

      if (updates.title !== undefined) updateData.professional_title = updates.title;
      if (updates.description !== undefined) updateData.overview = updates.description;
      if (updates.hourlyRate !== undefined) updateData.hourly_rate = updates.hourlyRate.toString();
      if (updates.experience !== undefined) updateData.experience_level = updates.experience;
      if (updates.portfolio !== undefined) updateData.portfolio_url = updates.portfolio[0] || null;
      if (updates.availability !== undefined) updateData.availability = updates.availability;
      if (updates.languages !== undefined) updateData.languages = updates.languages;
      if (updates.education !== undefined) updateData.education = updates.education;
      if (updates.certifications !== undefined) updateData.certifications = updates.certifications;

      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('freelance_profiles')
        .update(updateData)
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
        title: data.professional_title || "",
        description: data.overview || "",
        skills: [], // Would need to fetch from user skills table
        hourlyRate: parseFloat(data.hourly_rate || "0"),
        experience: data.experience_level || "intermediate",
        portfolio: data.portfolio_url ? [data.portfolio_url] : [],
        rating: parseFloat(data.success_rate || "0") * 5, // Convert to 5-star scale
        reviewCount: 0, // Would need to fetch from reviews table
        totalEarnings: parseFloat(data.total_earnings || "0"),
        completedProjects: data.completed_projects || 0,
        availability: data.availability === "available" ? "available" : "busy",
        languages: Array.isArray(data.languages) ? data.languages : [],
        education: Array.isArray(data.education) ? data.education : [],
        certifications: Array.isArray(data.certifications) ? data.certifications : [],
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
      // Check if the proposals table exists
      const { data: tableExists, error: tableError } = await supabase
        .from('freelance_proposals')
        .select('id')
        .limit(1);

      if (tableError) {
        console.warn("submitProposal: Database table 'freelance_proposals' does not exist yet. Returning null.");
        return null;
      }

      const { data, error } = await supabase
        .from('freelance_proposals')
        .insert([{
          project_id: proposalData.jobId,
          freelancer_id: proposalData.freelancerId,
          cover_letter: proposalData.coverLetter,
          proposed_budget: proposalData.proposedRate,
          estimated_duration: proposalData.proposedDuration,
          attachments: proposalData.attachments,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error("Error submitting proposal:", error);
        return null;
      }

      return {
        id: data.id,
        jobId: data.project_id,
        freelancerId: data.freelancer_id,
        coverLetter: data.cover_letter,
        proposedRate: data.proposed_budget ? parseFloat(data.proposed_budget.toString()) : undefined,
        proposedDuration: data.estimated_duration,
        attachments: data.attachments || [],
        status: "pending",
        submittedDate: new Date(data.created_at),
        client: undefined // Would need to fetch client data
      };
    } catch (error) {
      console.error("Error in submitProposal:", error);
      return null;
    }
  }

  static async getProposals(freelancerId: string): Promise<Proposal[]> {
    try {
      // Check if the proposals table exists
      const { data: tableExists, error: tableError } = await supabase
        .from('freelance_proposals')
        .select('id')
        .limit(1);

      if (tableError) {
        console.warn("getProposals: Database table 'freelance_proposals' does not exist yet. Returning empty array.");
        return [];
      }

      const { data, error } = await supabase
        .from('freelance_proposals')
        .select('*')
        .eq('freelancer_id', freelancerId);

      if (error) {
        console.error("Error fetching proposals:", error);
        return [];
      }

      return data.map(proposal => ({
        id: proposal.id,
        jobId: proposal.project_id,
        freelancerId: proposal.freelancer_id,
        coverLetter: proposal.cover_letter,
        proposedRate: proposal.proposed_budget ? parseFloat(proposal.proposed_budget.toString()) : undefined,
        proposedDuration: proposal.estimated_duration,
        attachments: proposal.attachments || [],
        status: proposal.status as "pending" | "accepted" | "rejected" | "withdrawn" || "pending",
        submittedDate: new Date(proposal.created_at),
        client: undefined // Would need to fetch client data
      }));
    } catch (error) {
      console.error("Error in getProposals:", error);
      return [];
    }
  }

  // Project operations
  static async getProjects(userId: string, userType: "freelancer" | "client"): Promise<Project[]> {
    try {
      // Check if the projects table exists
      const { data: tableExists, error: tableError } = await supabase
        .from('freelance_projects')
        .select('id')
        .limit(1);

      if (tableError) {
        console.warn("getProjects: Database table 'freelance_projects' does not exist yet. Returning empty array.");
        return [];
      }

      let query = supabase
        .from('freelance_projects')
        .select('*');

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
        jobId: project.id, // Using project ID as job ID for now
        clientId: project.client_id,
        freelancerId: project.freelancer_id || "",
        title: project.title,
        description: project.description,
        budget: project.budget_min ? parseFloat(project.budget_min.toString()) : 0,
        status: project.status as "pending" | "active" | "completed" | "cancelled" | "disputed" || "pending",
        startDate: project.start_date ? new Date(project.start_date) : new Date(),
        endDate: project.completion_date ? new Date(project.completion_date) : undefined,
        milestones: [], // Would need to fetch from milestones table
        contractTerms: "", // Would need to fetch from contracts table
        escrowAmount: undefined, // Would need to fetch from escrow table
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
      // Check if the projects table exists
      const { data: tableExists, error: tableError } = await supabase
        .from('freelance_projects')
        .select('id')
        .limit(1);

      if (tableError) {
        console.warn("getProject: Database table 'freelance_projects' does not exist yet. Returning null.");
        return null;
      }

      const { data, error } = await supabase
        .from('freelance_projects')
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
        jobId: data.id, // Using project ID as job ID for now
        clientId: data.client_id,
        freelancerId: data.freelancer_id || "",
        title: data.title,
        description: data.description,
        budget: data.budget_min ? parseFloat(data.budget_min.toString()) : 0,
        status: data.status as "pending" | "active" | "completed" | "cancelled" | "disputed" || "pending",
        startDate: data.start_date ? new Date(data.start_date) : new Date(),
        endDate: data.completion_date ? new Date(data.completion_date) : undefined,
        milestones: [], // Would need to fetch from milestones table
        contractTerms: "", // Would need to fetch from contracts table
        escrowAmount: undefined, // Would need to fetch from escrow table
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
        .from('freelance_projects')
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
      // Fetch stats from the new API endpoint
      const response = await fetch(`/api/freelance/stats/${freelancerId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        return data.data;
      }
      
      console.error("Error fetching freelance stats from API:", response.statusText);
      return null;
    } catch (error) {
      console.error("Error in getFreelanceStats:", error);
      return null;
    }
  }

  // Get freelancer's earnings balance from unified wallet
  static async getFreelancerBalance(freelancerId: string): Promise<number> {
    try {
      const response = await fetch(`/api/wallet/balance?userId=${freelancerId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        return data.data?.balances?.freelance || 0;
      }
      return 0;
    } catch (error) {
      console.error("Error fetching freelancer balance:", error);
      return 0;
    }
  }

  // Get freelancer's earnings records
  static async getFreelancerEarnings(freelancerId: string): Promise<any[]> {
    try {
      // Fetch earnings from the transactions API
      const response = await fetch(`/api/wallet/transactions?userId=${freelancerId}&type=freelance`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        return data.data || [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching freelancer earnings:", error);
      return [];
    }
  }

  // Get freelancer's earnings statistics
  static async getFreelancerEarningsStats(freelancerId: string): Promise<any> {
    try {
      // Fetch earnings stats from the wallet API
      const response = await fetch(`/api/wallet/stats?userId=${freelancerId}&type=freelance`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        return data.data || {};
      }
      return {};
    } catch (error) {
      console.error("Error fetching freelancer earnings stats:", error);
      return {};
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
      // Check if the skills table exists
      const { data: tableExists, error: tableError } = await supabase
        .from('freelance_skills')
        .select('name')
        .limit(1);

      if (tableError) {
        // Fallback to hardcoded list if table doesn't exist
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
      }

      // Fetch skills from database
      const { data, error } = await supabase
        .from('freelance_skills')
        .select('name')
        .eq('is_active', true);

      if (error) {
        console.error("Error fetching skills:", error);
        // Fallback to hardcoded list
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
      }

      return data.map(skill => skill.name);
    } catch (error) {
      console.error("Error in getSkills:", error);
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
    }
  }
}