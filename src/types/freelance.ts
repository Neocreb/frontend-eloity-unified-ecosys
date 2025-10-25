// Freelance types definition

export interface FreelancerProfile {
  id: string;
  userId: string;
  title: string;
  description: string;
  skills: string[];
  hourlyRate: number;
  experience: string;
  portfolio: string[];
  rating: number;
  reviewCount: number;
  totalEarnings: number;
  completedProjects: number;
  availability: "available" | "busy" | "unavailable";
  languages: string[];
  education: string[];
  certifications: string[];
  createdAt: Date;
  updatedAt: Date;
  // Additional fields from Supabase join with profiles table
  full_name?: string;
  username?: string;
  avatar_url?: string;
  bio?: string;
}

export interface JobPosting {
  id: string;
  clientId: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  skills: string[];
  budget: {
    type: "fixed" | "hourly";
    amount?: number;
    range?: { min: number; max: number };
  };
  duration: string;
  experience: "entry" | "intermediate" | "expert";
  status: "draft" | "active" | "closed" | "in_progress" | "completed";
  postedDate: Date;
  deadline?: Date;
  applicationsCount: number;
  proposals: Proposal[];
  attachments?: string[];
  location?: string;
  isRemote: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Proposal {
  id: string;
  jobId: string;
  freelancerId: string;
  coverLetter: string;
  proposedRate?: number;
  proposedDuration: string;
  attachments?: string[];
  status: "pending" | "accepted" | "rejected" | "withdrawn";
  submittedDate: Date;
  client?: {
    id: string;
    name: string;
    avatar: string;
  };
}

export interface Project {
  id: string;
  jobId: string;
  clientId: string;
  freelancerId: string;
  title: string;
  description: string;
  budget: number;
  status: "pending" | "active" | "completed" | "cancelled" | "disputed";
  startDate: Date;
  endDate?: Date;
  milestones: Milestone[];
  contractTerms: string;
  escrowAmount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  amount: number;
  dueDate: Date;
  status: "pending" | "in_progress" | "completed" | "approved" | "disputed";
  submissionDate?: Date;
  approvalDate?: Date;
  deliverables: string[];
}

export interface SearchFilters {
  query?: string;
  category?: string;
  subcategory?: string;
  skills?: string[];
  budgetMin?: number;
  budgetMax?: number;
  experience?: string;
  location?: string;
  isRemote?: boolean;
  postedWithin?: string;
  sortBy?: "relevance" | "newest" | "budget" | "rating";
}

export interface FreelanceStats {
  totalProjects: number;
  completedProjects: number;
  totalEarnings: number;
  averageRating: number;
  responseTime: number;
  successRate: number;
  repeatClients: number;
}

export interface FreelanceEscrow {
  id: string;
  projectId: string;
  clientId: string;
  freelancerId: string;
  amount: string;
  cryptoType: string;
  contractAddress: string;
  transactionHash: string;
  status: "pending" | "locked" | "released" | "refunded" | "disputed";
  lockedAt: Date | null;
  releasedAt: Date | null;
  disputeId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface FreelanceMessage {
  id: string;
  projectId: string;
  senderId: string;
  content: string;
  attachments: string[];
  messageType: "text" | "file" | "milestone" | "payment";
  read: boolean;
  createdAt: Date;
}

export interface FreelanceDispute {
  id: string;
  projectId: string;
  escrowId?: string;
  raisedBy: string;
  reason: string;
  description: string;
  evidence: string[];
  status: "open" | "investigating" | "resolved" | "closed";
  resolution?: string;
  resolvedBy?: string;
  createdAt: Date;
  resolvedAt?: Date;
}

export interface Profile {
  id: string;
  name: string;
  avatar: string;
  bio?: string;
  role: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}