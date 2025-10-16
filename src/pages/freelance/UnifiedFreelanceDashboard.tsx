// @ts-nocheck
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useFreelance } from "@/hooks/use-freelance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  UserCheck,
  Briefcase,
  TrendingUp,
  Loader2,
  ArrowRight,
  Star,
  CheckCircle,
  Target,
  Zap,
  AlertTriangle
} from "lucide-react";
import FreelanceDashboard from "./FreelanceDashboard";
import ClientDashboard from "./ClientDashboard";
import { Project } from "@/types/freelance";
import { cn } from "@/lib/utils";

interface UserRole {
  hasFreelancerProfile: boolean;
  hasClientProjects: boolean;
  activeFreelanceProjects: number;
  activeClientProjects: number;
  preferredRole?: "freelancer" | "client";
}

const UnifiedFreelanceDashboard: React.FC = () => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<"freelancer" | "client" | "both">("freelancer");
  const { user } = useAuth();
  const { getProjects } = useFreelance();

  useEffect(() => {
    const detectUserRole = async () => {
      if (!user) return;

      setLoading(true);
      try {
        // Get projects where user is freelancer
        const freelancerProjects = await getProjects(user.id, "freelancer").catch(() => []);

        // Get projects where user is client
        const clientProjects = await getProjects(user.id, "client").catch(() => []);

        const role: UserRole = {
          hasFreelancerProfile: (freelancerProjects || []).length > 0,
          hasClientProjects: (clientProjects || []).length > 0,
          activeFreelanceProjects: (freelancerProjects || []).filter((p: Project) => p.status === "active").length,
          activeClientProjects: (clientProjects || []).filter((p: Project) => p.status === "active").length,
        };

        // Set preferred role but always start with role selection
        if (role.hasClientProjects && !role.hasFreelancerProfile) {
          role.preferredRole = "client";
          setSelectedView("client");
        } else if (role.hasFreelancerProfile && role.hasClientProjects) {
          role.preferredRole = role.activeFreelanceProjects >= role.activeClientProjects ? "freelancer" : "client";
          setSelectedView(role.preferredRole);
        } else {
          role.preferredRole = "freelancer";
          setSelectedView("freelancer");
        }

        setUserRole(role);
      } catch (error) {
        console.error("Error detecting user role:", error);
        // Default setup
        setUserRole({
          hasFreelancerProfile: false,
          hasClientProjects: false,
          activeFreelanceProjects: 0,
          activeClientProjects: 0,
          preferredRole: "freelancer",
        });
        setSelectedView("freelancer");
      } finally {
        setLoading(false);
      }
    };

    detectUserRole();
  }, [user, getProjects]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-center">
        <div className="text-center">
          <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl w-16 h-16 mx-auto mb-6 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Loading your dashboard...</h3>
          <p className="text-gray-600 dark:text-gray-400">Detecting your role and projects</p>
        </div>
      </div>
    );
  }

  if (!userRole) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-center">
        <div className="text-center">
          <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-xl w-16 h-16 mx-auto mb-6 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Unable to load dashboard</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Please try refreshing the page</p>
          <Button onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  // If user is new or needs to choose role, show role selector
  if (selectedView === "both") {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Briefcase className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Welcome to Your Freelance Hub!
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                You're active as both a freelancer and a client. Choose your view to get started:
              </p>
            </div>

            {/* Role Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Freelancer Role */}
              <Card className="border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 cursor-pointer hover:shadow-xl bg-white dark:bg-gray-800">
                <CardHeader className="text-center pb-6">
                  <div className="p-6 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/50 rounded-2xl w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                    <Users className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-2xl mb-3 text-gray-900 dark:text-white">Freelancer Dashboard</CardTitle>
                  <p className="text-gray-600 dark:text-gray-400 text-lg">Manage your freelance projects and find new opportunities</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center">
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                        {userRole.activeFreelanceProjects}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Active Projects</div>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl text-center">
                      <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                        {userRole.hasFreelancerProfile ? "✓" : "Setup"}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Profile Status</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>Find and apply to jobs</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>Manage client projects</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>Track earnings & analytics</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full h-12 text-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                    onClick={() => setSelectedView("freelancer")}
                  >
                    <Users className="w-5 h-5 mr-2" />
                    Open Freelancer Dashboard
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              {/* Client Role */}
              <Card className="border-2 border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 transition-all duration-300 cursor-pointer hover:shadow-xl bg-white dark:bg-gray-800">
                <CardHeader className="text-center pb-6">
                  <div className="p-6 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/50 rounded-2xl w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                    <UserCheck className="w-12 h-12 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle className="text-2xl mb-3 text-gray-900 dark:text-white">Client Dashboard</CardTitle>
                  <p className="text-gray-600 dark:text-gray-400 text-lg">Hire talented freelancers and manage your projects</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl text-center">
                      <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                        {userRole.activeClientProjects}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Active Projects</div>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center">
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                        {userRole.hasClientProjects ? "Active" : "Ready"}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Client Status</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>Post jobs & hire talent</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>Manage freelancer projects</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>Review proposals & payments</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full h-12 text-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                    onClick={() => setSelectedView("client")}
                  >
                    <UserCheck className="w-5 h-5 mr-2" />
                    Open Client Dashboard
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <Card className="max-w-4xl mx-auto border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2 text-xl">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                  Your Activity Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {userRole.activeFreelanceProjects}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Freelance Projects</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {userRole.activeClientProjects}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Client Projects</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {userRole.activeFreelanceProjects + userRole.activeClientProjects}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Active</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">2</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Roles Available</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommended Role */}
            {userRole.preferredRole && (
              <Card className="max-w-2xl mx-auto border-2 border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
                <CardContent className="p-8 text-center">
                  <div className="p-4 bg-amber-100 dark:bg-amber-900/30 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Zap className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Recommended for you</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Based on your recent activity, we recommend starting with your{" "}
                    <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 mx-1">
                      {userRole.preferredRole}
                    </Badge>{" "}
                    dashboard
                  </p>
                  <Button 
                    onClick={() => setSelectedView(userRole.preferredRole!)}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3"
                  >
                    <Target className="w-5 h-5 mr-2" />
                    Go to {userRole.preferredRole} dashboard
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show the selected dashboard with updated role switcher
  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
      {/* Enhanced Role Switcher */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Freelance Platform</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedView === "freelancer" ? (
                    "Manage your freelance projects and find work"
                  ) : (
                    "Hire freelancers and manage your projects"
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setSelectedView("freelancer")}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                    selectedView === "freelancer"
                      ? "bg-blue-500 text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">Freelancer</span>
                  <span className="sm:hidden">Work</span>
                  {userRole && userRole.activeFreelanceProjects > 0 && (
                    <Badge className="ml-1 bg-blue-600 text-white text-xs px-1.5 py-0.5">
                      {userRole.activeFreelanceProjects}
                    </Badge>
                  )}
                </button>
                <button
                  onClick={() => setSelectedView("client")}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                    selectedView === "client"
                      ? "bg-green-500 text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  <UserCheck className="w-4 h-4" />
                  <span className="hidden sm:inline">Client</span>
                  <span className="sm:hidden">Hire</span>
                  {userRole && userRole.activeClientProjects > 0 && (
                    <Badge className="ml-1 bg-green-600 text-white text-xs px-1.5 py-0.5">
                      {userRole.activeClientProjects}
                    </Badge>
                  )}
                </button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedView("both")}
                className="hidden md:flex"
              >
                <Star className="w-4 h-4 mr-2" />
                Switch View
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      {selectedView === "freelancer" && <FreelanceDashboard />}
      {selectedView === "client" && <ClientDashboard />}
    </div>
  );
};

export default UnifiedFreelanceDashboard;
