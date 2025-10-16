// @ts-nocheck
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  UserCheck, 
  Briefcase,
  ArrowRight,
  Star,
  DollarSign,
  Plus,
  Search,
  MessageCircle,
  Eye,
  CheckCircle2,
  Clock,
  Target
} from "lucide-react";
import FreelanceDashboard from "./FreelanceDashboard";
import ClientDashboard from "./ClientDashboard";

const RoleSwitcherDashboard: React.FC = () => {
  const [activeRole, setActiveRole] = useState<"freelancer" | "client">("freelancer");

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
      {/* Role Switcher Header */}
      <div className="bg-white dark:bg-gray-800 border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Freelance Platform</h1>
                <p className="text-sm text-muted-foreground">
                  Choose your role to get started
                </p>
              </div>
            </div>
            
            <Tabs value={activeRole} onValueChange={(value) => setActiveRole(value as "freelancer" | "client")}>
              <TabsList className="grid w-full grid-cols-2 max-w-sm bg-gray-100 dark:bg-gray-700">
                <TabsTrigger 
                  value="freelancer" 
                  className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all"
                >
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">I'm a Freelancer</span>
                  <span className="sm:hidden">Work</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="client" 
                  className="flex items-center gap-2 data-[state=active]:bg-green-500 data-[state=active]:text-white transition-all"
                >
                  <UserCheck className="w-4 h-4" />
                  <span className="hidden sm:inline">I'm a Client</span>
                  <span className="sm:hidden">Hire</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {/* Role Description */}
          <div className={`mt-4 p-4 rounded-lg border-2 ${
            activeRole === "freelancer"
              ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
              : "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
          }`}>
            <div className="text-center">
              <h3 className="font-semibold text-lg mb-2">
                {activeRole === "freelancer" ? (
                  <>
                    <Users className="w-5 h-5 inline mr-2 text-blue-600" />
                    Freelancer Dashboard
                  </>
                ) : (
                  <>
                    <UserCheck className="w-5 h-5 inline mr-2 text-green-600" />
                    Client Dashboard
                  </>
                )}
              </h3>
              <p className="text-muted-foreground">
                {activeRole === "freelancer" ? (
                  "Find work, manage projects, and grow your freelance career"
                ) : (
                  "Post jobs, hire talented freelancers, and manage your projects"
                )}
              </p>
              <div className="mt-3 flex justify-center">
                <Badge
                  className={`${
                    activeRole === "freelancer"
                      ? "bg-blue-500 text-white"
                      : "bg-green-500 text-white"
                  } px-3 py-1`}
                >
                  Active: {activeRole === "freelancer" ? "Freelancer Mode" : "Client Mode"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Bar */}
      <div className="bg-white dark:bg-gray-800 border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-wrap justify-center gap-2">
            {activeRole === "freelancer" ? (
              <>
                <Button size="sm" variant="outline" className="text-xs" asChild>
                  <Link to="/app/freelance/browse-jobs">
                    <Search className="w-3 h-3 mr-1" />
                    Browse Jobs
                  </Link>
                </Button>
                <Button size="sm" variant="outline" className="text-xs" asChild>
                  <Link to="/app/freelance/update-profile">
                    <Star className="w-3 h-3 mr-1" />
                    Update Profile
                  </Link>
                </Button>
                <Button size="sm" variant="outline" className="text-xs" asChild>
                  <Link to="/app/chat">
                    <MessageCircle className="w-3 h-3 mr-1" />
                    Messages
                  </Link>
                </Button>
                <Button size="sm" variant="outline" className="text-xs" asChild>
                  <Link to="/app/freelance/earnings">
                    <DollarSign className="w-3 h-3 mr-1" />
                    Earnings
                  </Link>
                </Button>
                <Button size="sm" variant="outline" className="text-xs" asChild>
                  <Link to="/app/freelance/freelancer-projects">
                    <Eye className="w-3 h-3 mr-1" />
                    Manage Projects
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" variant="outline" className="text-xs" asChild>
                  <Link to="/app/freelance/post-job">
                    <Plus className="w-3 h-3 mr-1" />
                    Post Job
                  </Link>
                </Button>
                <Button size="sm" variant="outline" className="text-xs" asChild>
                  <Link to="/app/freelance/find-freelancers">
                    <Users className="w-3 h-3 mr-1" />
                    Find Freelancers
                  </Link>
                </Button>
                <Button size="sm" variant="outline" className="text-xs" asChild>
                  <Link to="/app/freelance/manage-projects">
                    <Eye className="w-3 h-3 mr-1" />
                    Manage Projects
                  </Link>
                </Button>
                <Button size="sm" variant="outline" className="text-xs" asChild>
                  <Link to="/app/freelance/approve-work">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Approve Work
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="container mx-auto">
        {activeRole === "freelancer" && <FreelanceDashboard />}
        {activeRole === "client" && <ClientDashboard />}
      </div>

      {/* Quick Role Preview Cards - shown only when switching */}
      {false && (
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Freelancer Preview */}
            <Card 
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                activeRole === "freelancer" 
                  ? "ring-2 ring-blue-500 border-blue-200" 
                  : "hover:border-blue-300"
              }`}
              onClick={() => setActiveRole("freelancer")}
            >
              <CardHeader className="text-center">
                <div className="p-4 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4">
                  <Users className="w-8 h-8 text-blue-600 mx-auto" />
                </div>
                <CardTitle className="text-xl">Freelancer</CardTitle>
                <p className="text-muted-foreground">I want to find work and offer my services</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-blue-500" />
                    <span>Browse Jobs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-blue-500" />
                    <span>Build Profile</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-blue-500" />
                    <span>Apply to Projects</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-blue-500" />
                    <span>Earn Money</span>
                  </div>
                </div>
                <Button 
                  className="w-full"
                  variant={activeRole === "freelancer" ? "default" : "outline"}
                >
                  {activeRole === "freelancer" ? "Current View" : "Switch to Freelancer"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Client Preview */}
            <Card 
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                activeRole === "client" 
                  ? "ring-2 ring-green-500 border-green-200" 
                  : "hover:border-green-300"
              }`}
              onClick={() => setActiveRole("client")}
            >
              <CardHeader className="text-center">
                <div className="p-4 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4">
                  <UserCheck className="w-8 h-8 text-green-600 mx-auto" />
                </div>
                <CardTitle className="text-xl">Client</CardTitle>
                <p className="text-muted-foreground">I need to hire freelancers for my projects</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4 text-green-500" />
                    <span>Post Jobs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-500" />
                    <span>Hire Talent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-green-500" />
                    <span>Manage Projects</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Get Results</span>
                  </div>
                </div>
                <Button 
                  className="w-full"
                  variant={activeRole === "client" ? "default" : "outline"}
                >
                  {activeRole === "client" ? "Current View" : "Switch to Client"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleSwitcherDashboard;
