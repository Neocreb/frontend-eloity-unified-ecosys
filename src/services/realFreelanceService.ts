import { supabase } from "@/integrations/supabase/client";
import { 
  FreelancerProfile,
  JobPosting,
  Proposal,
  Project,
  SearchFilters,
  FreelanceStats,
  ClientProfile
} from "@/types/freelance";

class RealFreelanceService {
  // Freelancer operations
  async getFreelancerProfile(id: string): Promise<FreelancerProfile | null> {
    const { data, error } = await supabase
      .from('freelancer_profiles')
      .select(`
        *,
        profile:profiles!user_id (
          id,
          full_name,
          username,
          avatar_url,
          bio
        )
      `)
      .eq('user_id', id)
      .single();

    if (error) return null;
    return data ? this.mapDatabaseToFreelancerProfile(data) : null;
  }

  async updateFreelancerProfile(id: string, updates: Partial<FreelancerProfile>): Promise<FreelancerProfile> {
    const updateData: any = {};
    
    if (updates.title) updateData.title = updates.title;
    if (updates.bio) updateData.bio = updates.bio;
    if (updates.hourlyRate) updateData.hourly_rate = updates.hourlyRate;
    if (updates.skills) updateData.skills = updates.skills;
    if (updates.languages) updateData.languages = updates.languages;
    if (updates.education) updateData.education = updates.education;
    if (updates.certifications) updateData.certifications = updates.certifications;
    if (updates.portfolio) updateData.portfolio = updates.portfolio;
    if (updates.availability) updateData.availability = updates.availability;

    const { data, error } = await supabase
      .from('freelancer_profiles')
      .update(updateData)
      .eq('user_id', id)
      .select(`
        *,
        profile:profiles!user_id (
          id,
          full_name,
          username,
          avatar_url,
          bio
        )
      `)
      .single();

    if (error) throw error;
    return this.mapDatabaseToFreelancerProfile(data);
  }

  async searchFreelancers(filters: SearchFilters): Promise<FreelancerProfile[]> {
    let query = supabase
      .from('freelancer_profiles')
      .select(`
        *,
        profile:profiles!user_id (
          id,
          full_name,
          username,
          avatar_url,
          bio
        )
      `)
      .eq('availability', 'available');

    if (filters.skills && filters.skills.length > 0) {
      query = query.overlaps('skills', filters.skills);
    }

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.budgetMin && filters.budgetMax) {
      query = query.gte('hourly_rate', filters.budgetMin)
                  .lte('hourly_rate', filters.budgetMax);
    }

    const { data, error } = await query
      .order('rating', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data?.map(this.mapDatabaseToFreelancerProfile) || [];
  }

  // Job operations
  async getJobPosting(id: string): Promise<JobPosting | null> {
    const { data, error } = await supabase
      .from('freelance_jobs')
      .select(`
        *,
        client:profiles!client_id (
          id,
          full_name,
          username,
          avatar_url,
          bio
        ),
        proposals:freelance_proposals (
          id,
          cover_letter,
          proposed_rate,
          proposed_duration,
          status,
          submitted_date,
          freelancer:profiles!freelancer_id (
            id,
            full_name,
            username,
            avatar_url
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) return null;
    return data ? this.mapDatabaseToJobPosting(data) : null;
  }

  async createJobPosting(job: Omit<JobPosting, "id" | "postedDate" | "applicationsCount" | "proposals">): Promise<JobPosting> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error("User not authenticated");

    const jobData = {
      title: job.title,
      description: job.description,
      category: job.category,
      subcategory: job.subcategory,
      budget_type: job.budget.type,
      budget_amount: job.budget.amount,
      budget_min: job.budget.min,
      budget_max: job.budget.max,
      deadline: job.deadline,
      duration: job.duration,
      experience_level: job.experienceLevel,
      skills: job.skills,
      client_id: userId,
      status: job.status,
      visibility: job.visibility || 'public'
    };

    const { data, error } = await supabase
      .from('freelance_jobs')
      .insert(jobData)
      .select(`
        *,
        client:profiles!client_id (
          id,
          full_name,
          username,
          avatar_url,
          bio
        )
      `)
      .single();

    if (error) throw error;
    return this.mapDatabaseToJobPosting(data);
  }

  async searchJobs(filters: SearchFilters): Promise<JobPosting[]> {
    let query = supabase
      .from('freelance_jobs')
      .select(`
        *,
        client:profiles!client_id (
          id,
          full_name,
          username,
          avatar_url,
          bio
        )
      `)
      .eq('status', 'open')
      .eq('visibility', 'public');

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.skills && filters.skills.length > 0) {
      query = query.overlaps('skills', filters.skills);
    }

    if (filters.experienceLevel && filters.experienceLevel.length > 0) {
      query = query.in('experience_level', filters.experienceLevel);
    }

    if (filters.budgetMin) {
      query = query.gte('budget_min', filters.budgetMin);
    }

    if (filters.budgetMax) {
      query = query.lte('budget_max', filters.budgetMax);
    }

    const { data, error } = await query
      .order('posted_date', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data?.map(this.mapDatabaseToJobPosting) || [];
  }

  // Proposal operations
  async submitProposal(proposal: Omit<Proposal, "id" | "submittedDate" | "status">): Promise<Proposal> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error("User not authenticated");

    const proposalData = {
      job_id: proposal.jobId,
      freelancer_id: userId,
      cover_letter: proposal.coverLetter,
      proposed_rate: proposal.proposedRate,
      proposed_duration: proposal.proposedDuration,
      attachments: proposal.attachments || [],
      status: 'pending'
    };

    const { data, error } = await supabase
      .from('freelance_proposals')
      .insert(proposalData)
      .select(`
        *,
        freelancer:profiles!freelancer_id (
          id,
          full_name,
          username,
          avatar_url
        ),
        job:freelance_jobs!job_id (
          id,
          title,
          client:profiles!client_id (
            id,
            full_name,
            avatar_url
          )
        )
      `)
      .single();

    if (error) throw error;

    // Update job applications count
    await supabase.rpc('increment_job_applications', { job_id: proposal.jobId });

    return this.mapDatabaseToProposal(data);
  }

  async getProposals(freelancerId: string): Promise<Proposal[]> {
    const { data, error } = await supabase
      .from('freelance_proposals')
      .select(`
        *,
        freelancer:profiles!freelancer_id (
          id,
          full_name,
          username,
          avatar_url
        ),
        job:freelance_jobs!job_id (
          id,
          title,
          client:profiles!client_id (
            id,
            full_name,
            avatar_url
          )
        )
      `)
      .eq('freelancer_id', freelancerId)
      .order('submitted_date', { ascending: false });

    if (error) throw error;
    return data?.map(this.mapDatabaseToProposal) || [];
  }

  // Project operations
  async getProjects(userId: string, userType: "freelancer" | "client"): Promise<Project[]> {
    const column = userType === "freelancer" ? "freelancer_id" : "client_id";
    
    const { data, error } = await supabase
      .from('freelance_projects')
      .select(`
        *,
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
        )
      `)
      .eq(column, userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data?.map(this.mapDatabaseToProject) || [];
  }

  async createProject(jobId: string, freelancerId: string, clientId: string, agreedAmount: number): Promise<Project> {
    const projectData = {
      job_id: jobId,
      freelancer_id: freelancerId,
      client_id: clientId,
      status: 'pending',
      agreed_budget: agreedAmount,
      paid_amount: 0,
      remaining_amount: agreedAmount
    };

    const { data, error } = await supabase
      .from('freelance_projects')
      .insert(projectData)
      .select(`
        *,
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
        )
      `)
      .single();

    if (error) throw error;
    return this.mapDatabaseToProject(data);
  }

  async updateProjectStatus(id: string, status: Project["status"]): Promise<Project> {
    const { data, error } = await supabase
      .from('freelance_projects')
      .update({ status })
      .eq('id', id)
      .select(`
        *,
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
        )
      `)
      .single();

    if (error) throw error;
    return this.mapDatabaseToProject(data);
  }

  // Stats
  async getFreelanceStats(freelancerId: string): Promise<FreelanceStats> {
    const { data: projects } = await supabase
      .from('freelance_projects')
      .select('status, agreed_budget, rating')
      .eq('freelancer_id', freelancerId);

    const { data: earnings } = await supabase
      .from('freelance_transactions')
      .select('amount')
      .eq('freelancer_id', freelancerId)
      .eq('type', 'payment');

    const totalProjects = projects?.length || 0;
    const completedProjects = projects?.filter(p => p.status === 'completed').length || 0;
    const totalEarnings = earnings?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
    const avgRating = projects?.reduce((sum, p) => sum + (p.rating || 0), 0) / totalProjects || 0;
    const successRate = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0;

    // Get response time from profile
    const { data: profile } = await supabase
      .from('freelancer_profiles')
      .select('response_time')
      .eq('user_id', freelancerId)
      .single();

    return {
      totalProjects,
      completedProjects,
      totalEarnings,
      averageRating: avgRating,
      responseTime: profile?.response_time || 24,
      successRate,
      repeatClients: Math.floor(completedProjects * 0.3) // Estimate
    };
  }

  // Categories and skills
  async getCategories(): Promise<string[]> {
    const { data, error } = await supabase
      .from('freelance_categories')
      .select('name')
      .order('name');

    if (error) {
      return [
        "Web Development",
        "Mobile Development", 
        "Design",
        "Writing & Content",
        "Digital Marketing",
        "Data Science",
        "DevOps & Cloud",
        "AI & Machine Learning"
      ];
    }

    return data?.map(cat => cat.name) || [];
  }

  async getSkills(): Promise<string[]> {
    const { data, error } = await supabase
      .from('freelance_skills')
      .select('name')
      .order('name');

    if (error) {
      return [
        "React", "Node.js", "Python", "TypeScript", "Vue.js", "Angular",
        "Figma", "Adobe XD", "Photoshop", "Illustrator",
        "Content Writing", "SEO", "Social Media Marketing",
        "AWS", "Docker", "Kubernetes", "PostgreSQL", "MongoDB"
      ];
    }

    return data?.map(skill => skill.name) || [];
  }

  // Helper mapping functions
  private mapDatabaseToFreelancerProfile(data: any): FreelancerProfile {
    return {
      id: data.user_id,
      userId: data.user_id,
      name: data.profile?.full_name || 'Unknown',
      email: data.email,
      avatar: data.profile?.avatar_url,
      location: data.location,
      timezone: data.timezone,
      verified: data.verified || false,
      joinedDate: data.created_at,
      title: data.title,
      bio: data.bio || data.profile?.bio,
      hourlyRate: data.hourly_rate || 0,
      skills: data.skills || [],
      rating: data.rating || 0,
      totalEarned: data.total_earned || 0,
      completedJobs: data.completed_jobs || 0,
      successRate: data.success_rate || 0,
      languages: data.languages || [],
      education: data.education || [],
      certifications: data.certifications || [],
      portfolio: data.portfolio || [],
      availability: data.availability || 'available',
      responseTime: data.response_time || 'within 24 hours'
    };
  }

  private mapDatabaseToJobPosting(data: any): JobPosting {
    const client: ClientProfile = {
      id: data.client_id,
      name: data.client?.full_name || 'Unknown',
      email: '',
      avatar: data.client?.avatar_url,
      location: '',
      timezone: '',
      verified: data.client?.verified || false,
      joinedDate: data.client?.created_at || new Date().toISOString(),
      companyName: data.company_name,
      totalSpent: data.total_spent || 0,
      jobsPosted: data.jobs_posted || 0,
      hireRate: data.hire_rate || 0,
      rating: data.client_rating || 0,
      paymentVerified: data.payment_verified || false
    };

    return {
      id: data.id,
      clientId: data.client_id,
      title: data.title,
      description: data.description,
      category: data.category,
      subcategory: data.subcategory,
      skills: data.skills || [],
      budget: {
        type: data.budget_type,
        amount: data.budget_amount,
        min: data.budget_min,
        max: data.budget_max
      },
      duration: data.duration,
      experienceLevel: data.experience_level,
      status: data.status,
      postedDate: data.posted_date || data.created_at,
      deadline: data.deadline,
      applicationsCount: data.applications_count || 0,
      proposals: data.proposals?.map(this.mapDatabaseToProposal) || [],
      client,
      visibility: data.visibility || 'public'
    };
  }

  private mapDatabaseToProposal(data: any): Proposal {
    return {
      id: data.id,
      jobId: data.job_id,
      freelancerId: data.freelancer_id,
      coverLetter: data.cover_letter,
      proposedRate: data.proposed_rate,
      proposedDuration: data.proposed_duration,
      attachments: data.attachments || [],
      status: data.status,
      submittedDate: data.submitted_date || data.created_at,
      client: data.job?.client ? {
        id: data.job.client.id,
        name: data.job.client.full_name,
        avatar: data.job.client.avatar_url
      } : undefined
    };
  }

  private mapDatabaseToProject(data: any): Project {
    return {
      id: data.id,
      jobId: data.job_id,
      clientId: data.client_id,
      freelancerId: data.freelancer_id,
      title: data.job?.title || 'Project',
      description: data.job?.description || '',
      budget: data.agreed_budget || 0,
      status: data.status,
      startDate: data.start_date || data.created_at,
      endDate: data.end_date,
      milestones: data.milestones?.map((m: any) => ({
        id: m.id,
        projectId: data.id,
        title: m.title,
        description: m.description,
        amount: m.amount,
        dueDate: m.due_date,
        status: m.status,
        submissionDate: m.submission_date,
        approvalDate: m.approval_date,
        deliverables: m.deliverables || []
      })) || [],
      contractTerms: data.contract_terms,
      escrowAmount: data.escrow_amount,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
}

export const realFreelanceService = new RealFreelanceService();