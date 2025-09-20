import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Briefcase,
  Users,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  Eye,
  FileText,
  TrendingUp,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { AdminService } from "@/services/adminService";

// Define TypeScript interfaces for our data
interface Job {
  id: string;
  title: string;
  client: string;
  freelancer: string | null;
  budget: number;
  status: string;
  category: string;
  deadline: string;
  postedDate?: string;
  applications?: number;
}

interface Freelancer {
  id: string;
  name: string;
  username: string;
  skills: string[];
  rating: number;
  completedJobs: number;
  earnings: number;
  status: string;
  joinDate?: string;
}

interface Dispute {
  id: string;
  jobTitle: string;
  client: string;
  freelancer: string;
  amount: number;
  reason: string;
  status: string;
  created: string;
}

const AdminFreelance = () => {
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeFreelancers: 0,
    totalEarnings: 0,
    pendingDisputes: 0,
  });
  const [jobs, setJobs] = useState<Job[]>([]);
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState({
    stats: true,
    jobs: true,
    freelancers: true,
    disputes: true,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
    fetchJobs();
    fetchFreelancers();
    fetchDisputes();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(prev => ({ ...prev, stats: true }));
      const response = await AdminService.getFreelanceStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      setError("Failed to fetch freelance stats");
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  };

  const fetchJobs = async () => {
    try {
      setLoading(prev => ({ ...prev, jobs: true }));
      const response = await AdminService.getFreelanceJobs({ limit: 10 });
      if (response.success) {
        setJobs(response.data.jobs);
      }
    } catch (err) {
      setError("Failed to fetch jobs");
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(prev => ({ ...prev, jobs: false }));
    }
  };

  const fetchFreelancers = async () => {
    try {
      setLoading(prev => ({ ...prev, freelancers: true }));
      const response = await AdminService.getFreelancers({ limit: 10 });
      if (response.success) {
        setFreelancers(response.data.freelancers);
      }
    } catch (err) {
      setError("Failed to fetch freelancers");
      console.error("Error fetching freelancers:", err);
    } finally {
      setLoading(prev => ({ ...prev, freelancers: false }));
    }
  };

  const fetchDisputes = async () => {
    try {
      setLoading(prev => ({ ...prev, disputes: true }));
      const response = await AdminService.getFreelanceDisputes({ limit: 10 });
      if (response.success) {
        setDisputes(response.data.disputes);
      }
    } catch (err) {
      setError("Failed to fetch disputes");
      console.error("Error fetching disputes:", err);
    } finally {
      setLoading(prev => ({ ...prev, disputes: false }));
    }
  };

  const handleJobStatusUpdate = async (jobId: string, status: string) => {
    try {
      await AdminService.updateFreelanceJobStatus(jobId, status);
      fetchJobs(); // Refresh the job list
    } catch (err) {
      setError("Failed to update job status");
      console.error("Error updating job status:", err);
    }
  };

  const handleFreelancerStatusUpdate = async (freelancerId: string, status: string) => {
    try {
      await AdminService.updateFreelancerStatus(freelancerId, status);
      fetchFreelancers(); // Refresh the freelancer list
    } catch (err) {
      setError("Failed to update freelancer status");
      console.error("Error updating freelancer status:", err);
    }
  };

  const handleResolveDispute = async (disputeId: string, resolution: string) => {
    try {
      await AdminService.resolveDispute(disputeId, resolution);
      fetchDisputes(); // Refresh the dispute list
    } catch (err) {
      setError("Failed to resolve dispute");
      console.error("Error resolving dispute:", err);
    }
  };

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center py-12">
          <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-xl w-16 h-16 mx-auto mb-6 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Error Loading Data
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Freelance Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage freelance jobs, freelancers, and platform operations
          </p>
        </div>
        <Button onClick={fetchStats}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="bg-blue-500/10 p-3 rounded-full mb-4">
              <Briefcase className="h-6 w-6 text-blue-600" />
            </div>
            {loading.stats ? (
              <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
            ) : (
              <>
                <CardTitle className="text-2xl font-bold">
                  {stats.totalJobs.toLocaleString()}
                </CardTitle>
                <CardDescription>Total Jobs</CardDescription>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="bg-green-500/10 p-3 rounded-full mb-4">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            {loading.stats ? (
              <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
            ) : (
              <>
                <CardTitle className="text-2xl font-bold">
                  {stats.activeFreelancers}
                </CardTitle>
                <CardDescription>Active Freelancers</CardDescription>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="bg-yellow-500/10 p-3 rounded-full mb-4">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
            {loading.stats ? (
              <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
            ) : (
              <>
                <CardTitle className="text-2xl font-bold">
                  ${stats.totalEarnings.toLocaleString()}
                </CardTitle>
                <CardDescription>Total Earnings</CardDescription>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="bg-red-500/10 p-3 rounded-full mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            {loading.stats ? (
              <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
            ) : (
              <>
                <CardTitle className="text-2xl font-bold">
                  {stats.pendingDisputes}
                </CardTitle>
                <CardDescription>Pending Disputes</CardDescription>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="jobs" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="freelancers">Freelancers</TabsTrigger>
          <TabsTrigger value="disputes">Disputes</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Management</CardTitle>
              <CardDescription>
                Monitor and manage all freelance job postings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading.jobs ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white">
                          <Briefcase className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-medium">{job.title}</h3>
                          <p className="text-sm text-gray-600">
                            {job.client} • {job.category}
                          </p>
                          {job.freelancer && (
                            <p className="text-sm text-blue-600">
                              Assigned to: {job.freelancer}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium">${job.budget}</p>
                          <p className="text-sm text-gray-600">
                            Due: {job.deadline}
                          </p>
                        </div>
                        <Badge
                          variant={
                            job.status === "completed"
                              ? "default"
                              : job.status === "in_progress"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {job.status.replace("_", " ")}
                        </Badge>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="freelancers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Freelancer Management</CardTitle>
              <CardDescription>
                View and manage freelancer profiles and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading.freelancers ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </div>
              ) : (
                <div className="space-y-4">
                  {freelancers.map((freelancer) => (
                    <div
                      key={freelancer.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                          {freelancer.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-medium">{freelancer.name}</h3>
                          <p className="text-sm text-gray-600">
                            @{freelancer.username} • ⭐ {freelancer.rating}
                          </p>
                          <div className="flex gap-1 mt-1">
                            {freelancer.skills.slice(0, 3).map((skill) => (
                              <Badge
                                key={skill}
                                variant="outline"
                                className="text-xs"
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium">
                            ${freelancer.earnings.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            {freelancer.completedJobs} jobs completed
                          </p>
                        </div>
                        <Badge
                          variant={
                            freelancer.status === "active"
                              ? "default"
                              : "destructive"
                          }
                        >
                          {freelancer.status}
                        </Badge>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="disputes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dispute Resolution</CardTitle>
              <CardDescription>
                Manage and resolve freelance job disputes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading.disputes ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </div>
              ) : (
                <div className="space-y-4">
                  {disputes.map((dispute) => (
                    <div
                      key={dispute.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white">
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-medium">{dispute.jobTitle}</h3>
                          <p className="text-sm text-gray-600">
                            {dispute.client} vs {dispute.freelancer}
                          </p>
                          <p className="text-sm text-gray-600">
                            {dispute.reason}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium">
                            ${dispute.amount.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            {dispute.created}
                          </p>
                        </div>
                        <Badge
                          variant={
                            dispute.status === "investigating"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {dispute.status}
                        </Badge>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Freelance Analytics</CardTitle>
              <CardDescription>
                Performance metrics and trends analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Analytics Dashboard
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Detailed freelance analytics and insights coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminFreelance;