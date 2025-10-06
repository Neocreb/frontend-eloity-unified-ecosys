import { useState, useEffect, useCallback } from "react";
import { FreelanceService as freelanceService } from "@/services/freelanceService";
import { escrowService } from "@/services/escrowService";
import { freelanceMessagingService } from "@/services/freelanceMessagingService";
import {
  FreelancerProfile,
  JobPosting,
  Proposal,
  Project,
  SearchFilters,
  FreelanceStats,
} from "@/types/freelance";
import { FreelanceEscrow } from "@/types/freelance";
import { useToast } from "@/hooks/use-toast";

export const useFreelance = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAsync = useCallback(
    async <T>(
      operation: () => Promise<T>,
      successMessage?: string,
    ): Promise<T | null> => {
      try {
        setLoading(true);
        setError(null);
        const result = await operation();
        if (successMessage) {
          toast({
            title: "Success",
            description: successMessage,
          });
        }
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        return null;
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  return {
    loading,
    error,

    // Job operations
    searchJobs: useCallback(
      (filters: SearchFilters) =>
        handleAsync(() => freelanceService.searchJobs(filters)),
      [handleAsync],
    ),

    getJob: useCallback(
      (id: string) => handleAsync(() => freelanceService.getJobPosting(id)),
      [handleAsync],
    ),

    createJob: useCallback(
      (
        job: Omit<
          JobPosting,
          "id" | "postedDate" | "applicationsCount" | "proposals"
        >,
      ) =>
        handleAsync(
          () => freelanceService.createJobPosting(job),
          "Job posted successfully",
        ),
      [handleAsync],
    ),

    // Freelancer operations
    searchFreelancers: useCallback(
      (filters: SearchFilters) =>
        handleAsync(() => freelanceService.searchFreelancers(filters)),
      [handleAsync],
    ),

    getFreelancer: useCallback(
      (id: string) =>
        handleAsync(() => freelanceService.getFreelancerProfile(id)),
      [handleAsync],
    ),

    updateFreelancerProfile: useCallback(
      (id: string, updates: Partial<FreelancerProfile>) =>
        handleAsync(
          () => freelanceService.updateFreelancerProfile(id, updates),
          "Profile updated successfully",
        ),
      [handleAsync],
    ),

    // Proposal operations
    submitProposal: useCallback(
      (proposal: Omit<Proposal, "id" | "submittedDate" | "status">) =>
        handleAsync(
          () => freelanceService.submitProposal(proposal),
          "Proposal submitted successfully",
        ),
      [handleAsync],
    ),

    getProposals: useCallback(
      (freelancerId: string) =>
        handleAsync(() => freelanceService.getProposals(freelancerId)),
      [handleAsync],
    ),

    // Project operations
    getProjects: useCallback(
      (userId: string, userType: "freelancer" | "client") =>
        handleAsync(() => freelanceService.getProjects(userId, userType)),
      [handleAsync],
    ),

    getProject: useCallback(
      (id: string) => handleAsync(() => freelanceService.getProject(id)),
      [handleAsync],
    ),

    updateProjectStatus: useCallback(
      (id: string, status: Project["status"]) =>
        handleAsync(
          () => freelanceService.updateProjectStatus(id, status),
          "Project status updated",
        ),
      [handleAsync],
    ),

    // Stats
    getFreelanceStats: useCallback(
      (freelancerId: string) =>
        handleAsync(() => freelanceService.getFreelanceStats(freelancerId)),
      [handleAsync],
    ),

    // Categories and skills
    getCategories: useCallback(
      () => handleAsync(() => freelanceService.getCategories()),
      [handleAsync],
    ),

    getSkills: useCallback(
      () => handleAsync(() => freelanceService.getSkills()),
      [handleAsync],
    ),
  };
};

export const useEscrow = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAsync = useCallback(
    async <T>(
      operation: () => Promise<T>,
      successMessage?: string,
    ): Promise<T | null> => {
      try {
        setLoading(true);
        setError(null);
        const result = await operation();
        if (successMessage) {
          toast({
            title: "Success",
            description: successMessage,
          });
        }
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        return null;
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  return {
    loading,
    error,

    createEscrow: useCallback(
      (request: {
        projectId: string;
        clientId: string;
        freelancerId: string;
        amount: number;
        cryptoType: "USDT" | "BTC" | "ETH";
      }) =>
        handleAsync(
          () => escrowService.createEscrow(request),
          "Escrow contract created",
        ),
      [handleAsync],
    ),

    getEscrowByProject: useCallback(
      (projectId: string) =>
        handleAsync(() => escrowService.getEscrowByProject(projectId)),
      [handleAsync],
    ),

    releaseFunds: useCallback(
      (request: {
        escrowId: string;
        projectId: string;
        clientId: string;
        milestoneId?: string;
      }) => handleAsync(() => escrowService.releaseFunds(request)),
      [handleAsync],
    ),

    createDispute: useCallback(
      (request: {
        projectId: string;
        escrowId?: string;
        reason: string;
        description: string;
        evidence: string[];
      }) => handleAsync(() => escrowService.createDispute(request)),
      [handleAsync],
    ),

    getEscrowTransactions: useCallback(
      (escrowId: string) =>
        handleAsync(() => escrowService.getEscrowTransactions(escrowId)),
      [handleAsync],
    ),

    getUserEscrows: useCallback(
      (userId: string, userType: "client" | "freelancer") =>
        handleAsync(() => escrowService.getUserEscrows(userId, userType)),
      [handleAsync],
    ),

    checkEscrowStatus: useCallback(
      (escrowId: string) =>
        handleAsync(() => escrowService.checkEscrowStatus(escrowId)),
      [handleAsync],
    ),
  };
};

export const useFreelanceMessaging = (projectId: string) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();

  // Load messages
  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result =
        await freelanceMessagingService.getProjectMessages(projectId);
      setMessages(result.messages);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load messages";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [projectId, toast]);

  // Send message
  const sendMessage = useCallback(
    async (content: string, attachments?: string[]) => {
      try {
        const newMessage = await freelanceMessagingService.sendMessage({
          projectId,
          senderId: "current-user-id", // This would come from auth context
          content,
          attachments,
        });
        setMessages((prev) => [...prev, newMessage]);
        return newMessage;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to send message";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        return null;
      }
    },
    [projectId, toast],
  );

  // Mark messages as read
  const markAsRead = useCallback(
    async (userId: string) => {
      try {
        await freelanceMessagingService.markMessagesAsRead(projectId, userId);
        setUnreadCount(0);
      } catch (err) {
        console.error("Failed to mark messages as read:", err);
      }
    },
    [projectId],
  );

  // Load unread count
  const loadUnreadCount = useCallback(
    async (userId: string) => {
      try {
        const count = await freelanceMessagingService.getUnreadCount(
          projectId,
          userId,
        );
        setUnreadCount(count);
      } catch (err) {
        console.error("Failed to load unread count:", err);
      }
    },
    [projectId],
  );

  // Upload attachment
  const uploadAttachment = useCallback(
    async (file: File) => {
      try {
        const attachment = await freelanceMessagingService.uploadAttachment(
          file,
          projectId,
        );
        return attachment;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to upload attachment";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        return null;
      }
    },
    [projectId, toast],
  );

  // Search messages
  const searchMessages = useCallback(
    async (query: string) => {
      try {
        const results = await freelanceMessagingService.searchMessages(
          projectId,
          query,
        );
        return results;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Search failed";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        return [];
      }
    },
    [projectId, toast],
  );

  // Initial load
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Real-time subscription
  useEffect(() => {
    const unsubscribe = freelanceMessagingService.subscribeToProjectMessages(
      projectId,
      (newMessage) => {
        setMessages((prev) => [...prev, newMessage]);
        if (newMessage.senderId !== "current-user-id") {
          setUnreadCount((prev) => prev + 1);
        }
      },
    );

    return unsubscribe;
  }, [projectId]);

  return {
    messages,
    loading,
    error,
    unreadCount,
    sendMessage,
    markAsRead,
    loadUnreadCount,
    uploadAttachment,
    searchMessages,
    refresh: loadMessages,
  };
};

// Hook for freelance project management
export const useFreelanceProject = (projectId: string) => {
  const [project, setProject] = useState<Project | null>(null);
  const [escrow, setEscrow] = useState<FreelanceEscrow | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadProject = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [projectData, escrowData] = await Promise.all([
        freelanceService.getProject(projectId),
        escrowService.getEscrowByProject(projectId),
      ]);

      setProject(projectData);
      setEscrow(escrowData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load project";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [projectId, toast]);

  const updateProjectStatus = useCallback(
    async (status: Project["status"]) => {
      try {
        const success = await freelanceService.updateProjectStatus(
          projectId,
          status,
        );
        if (success) {
          // Reload the project to get the updated status
          const updatedProject = await freelanceService.getProject(projectId);
          if (updatedProject) {
            setProject(updatedProject);
          }
          toast({
            title: "Success",
            description: "Project status updated",
          });
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update project";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    },
    [projectId, toast],
  );

  const releaseFunds = useCallback(
    async (clientId: string, milestoneId?: string) => {
      if (!escrow) return false;

      try {
        const result = await escrowService.releaseFunds({
          escrowId: escrow.id,
          projectId,
          clientId,
          milestoneId,
        });

        if (result?.success) {
          // Reload escrow data
          const updatedEscrow =
            await escrowService.getEscrowByProject(projectId);
          setEscrow(updatedEscrow);
          toast({
            title: "Success",
            description: result.message,
          });
          return true;
        } else {
          toast({
            title: "Error",
            description: result?.message || "Failed to release funds",
            variant: "destructive",
          });
          return false;
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to release funds";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        return false;
      }
    },
    [escrow, projectId, toast],
  );

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  return {
    project,
    escrow,
    loading,
    error,
    updateProjectStatus,
    releaseFunds,
    refresh: loadProject,
  };
};
