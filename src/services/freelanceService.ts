import {
  FreelancerProfile,
  ClientProfile,
  JobPosting,
  Proposal,
  Project,
  SearchFilters,
  FreelanceStats,
} from "@/types/freelance";

// Mock data for development
const mockFreelancers: FreelancerProfile[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b5c5?w=100&h=100&fit=crop&crop=face",
    location: "Seattle, WA",
    timezone: "PST",
    verified: true,
    joinedDate: "2023-01-15",
    title: "Full-Stack Developer & DevOps Engineer",
    bio: "Experienced full-stack developer with 8+ years building scalable web applications. Specialized in React, Node.js, and cloud architecture.",
    hourlyRate: 85,
    skills: [
      "React",
      "Node.js",
      "Python",
      "AWS",
      "Docker",
      "PostgreSQL",
      "TypeScript",
      "GraphQL",
    ],
    rating: 4.9,
    totalEarned: 247650,
    completedJobs: 147,
    successRate: 98.5,
    languages: ["English (Native)", "Spanish (Conversational)"],
    education: [
      {
        id: "1",
        institution: "University of Washington",
        degree: "Bachelor of Science",
        field: "Computer Science",
        startYear: 2012,
        endYear: 2016,
      },
    ],
    certifications: [
      {
        id: "1",
        name: "AWS Solutions Architect",
        issuer: "Amazon Web Services",
        issueDate: "2023-03-15",
        expiryDate: "2026-03-15",
      },
    ],
    portfolio: [
      {
        id: "1",
        title: "E-commerce Platform",
        description: "Modern e-commerce platform built with React and Node.js",
        images: [
          "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop",
        ],
        technologies: ["React", "Node.js", "MongoDB", "Stripe"],
        liveUrl: "https://example-ecommerce.com",
        category: "Web Development",
      },
    ],
    availability: "available",
    responseTime: "within 1 hour",
  },
  {
    id: "2",
    name: "Alex Chen",
    email: "alex@example.com",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    location: "Los Angeles, CA",
    timezone: "PST",
    verified: true,
    joinedDate: "2022-08-20",
    title: "Senior UI/UX Designer",
    bio: "Creative designer focused on user-centered design and modern interfaces. Expert in Figma, user research, and design systems.",
    hourlyRate: 70,
    skills: [
      "Figma",
      "Adobe XD",
      "Prototyping",
      "User Research",
      "Design Systems",
      "Webflow",
    ],
    rating: 4.8,
    totalEarned: 156780,
    completedJobs: 89,
    successRate: 97.2,
    languages: ["English (Native)", "Mandarin (Native)"],
    education: [
      {
        id: "1",
        institution: "Art Center College of Design",
        degree: "Bachelor of Fine Arts",
        field: "Graphic Design",
        startYear: 2016,
        endYear: 2020,
      },
    ],
    certifications: [
      {
        id: "1",
        name: "Google UX Design Certificate",
        issuer: "Google",
        issueDate: "2022-06-10",
      },
    ],
    portfolio: [
      {
        id: "1",
        title: "Mobile Banking App",
        description: "Complete UI/UX design for a modern banking application",
        images: [
          "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop",
        ],
        technologies: ["Figma", "Principle", "InVision"],
        category: "UI/UX Design",
      },
    ],
    availability: "available",
    responseTime: "within 2 hours",
  },
];

const mockJobs: JobPosting[] = [
  {
    id: "1",
    title: "Full-Stack Web Application Development",
    description:
      "Looking for an experienced developer to build a comprehensive e-commerce platform with React, Node.js, and MongoDB. Must have experience with payment integration and user authentication.",
    category: "Web Development",
    subcategory: "Full-Stack Development",
    budget: {
      type: "fixed",
      amount: 5000,
    },
    deadline: "2024-02-15",
    duration: "2-3 months",
    experienceLevel: "expert",
    skills: ["React", "Node.js", "MongoDB", "Payment Integration"],
    client: {
      id: "1",
      name: "TechCorp Solutions",
      email: "contact@techcorp.com",
      avatar:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop",
      location: "San Francisco, CA",
      timezone: "PST",
      verified: true,
      joinedDate: "2023-01-01",
      companyName: "TechCorp Solutions",
      totalSpent: 47500,
      jobsPosted: 12,
      hireRate: 85.5,
      rating: 4.8,
      paymentVerified: true,
    },
    proposals: [],
    status: "open",
    postedDate: "2024-01-10T10:00:00Z",
    applicationsCount: 12,
    visibility: "public",
  },
  {
    id: "2",
    title: "Mobile App UI/UX Design",
    description:
      "Need a talented designer to create a modern, user-friendly mobile app interface for a fitness tracking application.",
    category: "Design",
    subcategory: "Mobile Design",
    budget: {
      type: "hourly",
      min: 60,
      max: 80,
    },
    deadline: "2024-01-30",
    duration: "3-4 weeks",
    experienceLevel: "intermediate",
    skills: ["UI/UX Design", "Figma", "Mobile Design", "Prototyping"],
    client: {
      id: "2",
      name: "FitLife Startup",
      email: "hello@fitlife.com",
      avatar:
        "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=100&h=100&fit=crop",
      location: "New York, NY",
      timezone: "EST",
      verified: true,
      joinedDate: "2023-06-15",
      companyName: "FitLife Inc.",
      totalSpent: 23400,
      jobsPosted: 8,
      hireRate: 90.2,
      rating: 4.6,
      paymentVerified: true,
    },
    proposals: [],
    status: "open",
    postedDate: "2024-01-08T14:30:00Z",
    applicationsCount: 8,
    visibility: "public",
  },
];

const mockProjects: Project[] = [
  {
    id: "1",
    job: mockJobs[0],
    freelancer: mockFreelancers[0],
    client: mockJobs[0].client,
    status: "active",
    startDate: "2024-01-15T00:00:00Z",
    budget: {
      agreed: 5000,
      paid: 1500,
      remaining: 3500,
    },
    milestones: [
      {
        id: "1",
        title: "Project Setup & Architecture",
        description: "Set up development environment and project architecture",
        amount: 1500,
        dueDate: "2024-01-22",
        status: "approved",
      },
      {
        id: "2",
        title: "Frontend Development",
        description: "Build React frontend with responsive design",
        amount: 2000,
        dueDate: "2024-02-05",
        status: "in-progress",
      },
      {
        id: "3",
        title: "Backend & Integration",
        description: "Complete backend API and third-party integrations",
        amount: 1500,
        dueDate: "2024-02-15",
        status: "pending",
      },
    ],
    timeline: [],
    files: [],
    messages: [],
  },
];

export const freelanceService = {
  // Freelancer operations
  async searchFreelancers(
    filters: SearchFilters,
  ): Promise<FreelancerProfile[]> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockFreelancers.filter((freelancer) => {
      if (filters.skills && filters.skills.length > 0) {
        return filters.skills.some((skill) =>
          freelancer.skills.some((fs) =>
            fs.toLowerCase().includes(skill.toLowerCase()),
          ),
        );
      }
      return true;
    });
  },

  async getFreelancerProfile(id: string): Promise<FreelancerProfile | null> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockFreelancers.find((f) => f.id === id) || null;
  },

  async updateFreelancerProfile(
    id: string,
    updates: Partial<FreelancerProfile>,
  ): Promise<FreelancerProfile> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const freelancer = mockFreelancers.find((f) => f.id === id);
    if (!freelancer) throw new Error("Freelancer not found");

    Object.assign(freelancer, updates);
    return freelancer;
  },

  // Job operations
  async searchJobs(filters: SearchFilters): Promise<JobPosting[]> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockJobs.filter((job) => {
      if (filters.category && job.category !== filters.category) return false;
      if (filters.experienceLevel && filters.experienceLevel.length > 0) {
        return filters.experienceLevel.includes(job.experienceLevel);
      }
      if (filters.skills && filters.skills.length > 0) {
        return filters.skills.some((skill) =>
          job.skills.some((js) =>
            js.toLowerCase().includes(skill.toLowerCase()),
          ),
        );
      }
      return true;
    });
  },

  async getJobPosting(id: string): Promise<JobPosting | null> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockJobs.find((j) => j.id === id) || null;
  },

  async createJobPosting(
    job: Omit<
      JobPosting,
      "id" | "postedDate" | "applicationsCount" | "proposals"
    >,
  ): Promise<JobPosting> {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const newJob: JobPosting = {
      ...job,
      id: `job_${Date.now()}`,
      postedDate: new Date().toISOString(),
      applicationsCount: 0,
      proposals: [],
    };
    mockJobs.unshift(newJob);
    return newJob;
  },

  // Proposal operations
  async submitProposal(
    proposal: Omit<Proposal, "id" | "submittedDate" | "status">,
  ): Promise<Proposal> {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const newProposal: Proposal = {
      ...proposal,
      id: `proposal_${Date.now()}`,
      submittedDate: new Date().toISOString(),
      status: "pending",
    };

    const job = mockJobs.find((j) => j.id === proposal.jobId);
    if (job) {
      job.proposals.push(newProposal);
      job.applicationsCount++;
    }

    return newProposal;
  },

  async getProposals(freelancerId: string): Promise<Proposal[]> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return mockJobs.flatMap((job) =>
      job.proposals.filter((p) => p.freelancer.id === freelancerId),
    );
  },

  // Project operations
  async getProjects(
    userId: string,
    userType: "freelancer" | "client",
  ): Promise<Project[]> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockProjects.filter((project) => {
      if (userType === "freelancer") {
        return project.freelancer.id === userId;
      } else {
        return project.client.id === userId;
      }
    });
  },

  async getProject(id: string): Promise<Project | null> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockProjects.find((p) => p.id === id) || null;
  },

  async updateProjectStatus(
    id: string,
    status: Project["status"],
  ): Promise<Project> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const project = mockProjects.find((p) => p.id === id);
    if (!project) throw new Error("Project not found");

    project.status = status;
    return project;
  },

  // Stats and analytics
  async getFreelanceStats(freelancerId: string): Promise<FreelanceStats> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const freelancer = mockFreelancers.find((f) => f.id === freelancerId);
    const userProjects = mockProjects.filter(
      (p) => p.freelancer.id === freelancerId,
    );

    // Use centralized freelance balance instead of calculated from projects
    const totalEarnings = 12890.67; // Match centralized freelance balance from walletService.ts
    const activeProjects = userProjects.filter(
      (p) => p.status === "active",
    ).length;
    const completedProjects = userProjects.filter(
      (p) => p.status === "completed",
    ).length;

    return {
      totalEarnings,
      activeProjects,
      completedProjects,
      totalProjects: userProjects.length,
      rating: freelancer?.rating || 4.8,
      successRate: freelancer?.successRate || 95,
      repeatClients: 67,
    };
  },

  // Categories and skills
  async getCategories(): Promise<string[]> {
    return [
      "Web Development",
      "Mobile Development",
      "Design",
      "Writing & Content",
      "Digital Marketing",
      "Data Science",
      "DevOps & Cloud",
      "AI & Machine Learning",
    ];
  },

  async getSkills(): Promise<string[]> {
    return [
      "React",
      "Node.js",
      "Python",
      "TypeScript",
      "Vue.js",
      "Angular",
      "Figma",
      "Adobe XD",
      "Photoshop",
      "Illustrator",
      "Content Writing",
      "SEO",
      "Social Media Marketing",
      "AWS",
      "Docker",
      "Kubernetes",
      "PostgreSQL",
      "MongoDB",
    ];
  },
};
