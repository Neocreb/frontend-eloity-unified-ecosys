import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Star,
  MapPin,
  MessageSquare,
  Heart,
  ExternalLink,
  Github,
  Globe,
  ArrowLeft,
  Share2,
  Award,
  Verified,
  Calendar,
  Play,
  Image as ImageIcon,
  FileText,
  Link as LinkIcon,
  Plus,
  AlertCircle,
  User,
} from "lucide-react";
import { UserProfile } from "@/types/user";
import { profileService } from "@/services/profileService";
import { apiClient } from "@/lib/api";

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  images: string[];
  external_link?: string;
  github_link?: string;
  live_demo?: string;
  client?: string;
  duration: string;
  budget?: number;
  rating?: number;
  completed_at: string;
  type: "platform" | "external";
  status: "completed" | "in_progress" | "cancelled";
}

interface ExternalWork {
  id: string;
  title: string;
  description: string;
  type: "image" | "video" | "link" | "document";
  url: string;
  thumbnail?: string;
  category: string;
  tags: string[];
  created_at: string;
}

const UserProjects: React.FC = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("portfolio");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [externalWorks, setExternalWorks] = useState<ExternalWork[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if this is the user's own profile (in real app, check authentication)
  const isOwnProfile = true; // Mock - in real app: currentUser?.username === username

  // Stats will be fetched from API in real implementation
  const freelanceStats = {
    totalProjects: projects.length,
    completedProjects: projects.filter(p => p.status === "completed").length,
    averageRating: projects.length > 0 
      ? projects.reduce((sum, p) => sum + (p.rating || 0), 0) / projects.length
      : 0,
    totalReviews: 0, // Would be fetched from API
    responseRate: 0, // Would be fetched from API
    responseTime: "", // Would be fetched from API
    memberSince: "", // Would be fetched from API
    totalEarnings: 0, // Would be fetched from API
    repeatClients: 0, // Would be fetched from API
    successRate: projects.length > 0 
      ? Math.round((projects.filter(p => p.status === "completed").length / projects.length) * 100)
      : 0,
  };

  const skills = [
    { name: "React", level: 95, category: "Frontend" },
    { name: "Node.js", level: 90, category: "Backend" },
    { name: "UI/UX Design", level: 88, category: "Design" },
    { name: "TypeScript", level: 92, category: "Frontend" },
    { name: "Python", level: 85, category: "Backend" },
    { name: "Figma", level: 87, category: "Design" },
  ];

  const categories = [
    { id: "all", name: "All Projects", count: 89 },
    { id: "web_development", name: "Web Development", count: 34 },
    { id: "mobile_app", name: "Mobile Apps", count: 22 },
    { id: "ui_ux", name: "UI/UX Design", count: 18 },
    { id: "backend", name: "Backend", count: 15 },
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (!username) {
        setError("Username is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Fetch user profile
        const profile = await profileService.getUserByUsername(username);
        if (!profile) {
          setError("User not found");
          setLoading(false);
          return;
        }
        
        setUserProfile(profile);
        
        // Fetch user projects/services
        try {
          const projectsResponse = await apiClient.getFreelanceJobs({ freelancer_id: profile.id });
          // Type guard to ensure we're working with the right data structure
          let projectsData: Project[] = [];
          if (Array.isArray(projectsResponse)) {
            projectsData = projectsResponse;
          } else if (projectsResponse && typeof projectsResponse === 'object' && 'jobs' in projectsResponse) {
            projectsData = projectsResponse.jobs as Project[];
          }
          setProjects(projectsData);
        } catch (projectError) {
          console.error("Failed to fetch projects:", projectError);
          setError("Failed to load projects");
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username]);

  useEffect(() => {
    // In a real app, fetch external works from API
    // For now, we'll initialize with empty array
    setExternalWorks([]);
  }, []);

  const certifications = [
    {
      name: "AWS Certified Solutions Architect",
      issuer: "Amazon Web Services",
      date: "2023-06-15",
      credential: "AWS-CSA-123456",
    },
    {
      name: "Google UX Design Certificate",
      issuer: "Google",
      date: "2023-03-10",
      credential: "GUX-987654",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <AlertCircle className="h-12 w-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button 
            className="mt-4" 
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-muted-foreground mb-4">
            <User className="h-12 w-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold mb-2">User Not Found</h2>
          <p className="text-muted-foreground">The requested user profile could not be found.</p>
          <Button 
            className="mt-4" 
            asChild
          >
            <Link to="/app/profile">Back to Profile</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                to={`/app/profile/${username}`}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Profile</span>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share Portfolio
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <Card className="mb-6">
              <CardContent className="p-6">
                {/* Profile Info */}
                <div className="text-center mb-6">
                  <Avatar className="h-20 w-20 mx-auto mb-4">
                    <AvatarImage src={userProfile.avatar_url || "/placeholder.svg"} alt={userProfile.full_name || userProfile.username || "User"} />
                    <AvatarFallback className="text-lg">
                      {userProfile.full_name ? userProfile.full_name.split(" ").map(n => n[0]).join("") : (userProfile.username ? userProfile.username.substring(0, 2).toUpperCase() : "U")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <h1 className="text-xl font-bold">{userProfile.full_name || userProfile.username}</h1>
                    {userProfile.is_verified && (
                      <Verified className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm mb-2">@{userProfile.username || "unknown"}</p>
                  <div className="flex items-center justify-center gap-1 mb-4">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="font-medium">{freelanceStats.averageRating}</span>
                    <span className="text-muted-foreground text-sm">
                      ({freelanceStats.totalReviews} reviews)
                    </span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Projects</span>
                    <span className="font-semibold">{projects.length || freelanceStats.totalProjects}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Success Rate</span>
                    <span className="font-semibold">{freelanceStats.successRate}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Response Time</span>
                    <span className="font-semibold">{freelanceStats.responseTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Earnings</span>
                    <span className="font-semibold">${freelanceStats.totalEarnings.toLocaleString()}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 mb-6">
                  <Button className="w-full">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Hire Now
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Heart className="h-4 w-4 mr-2" />
                    Follow
                  </Button>
                </div>

                {/* External Links */}
                <div className="space-y-3 pt-6 border-t">
                  {userProfile.website && (
                    <a 
                      href={userProfile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-500 hover:underline"
                    >
                      <Globe className="h-4 w-4" />
                      <span>Portfolio Website</span>
                    </a>
                  )}
                  <a 
                    href="https://github.com/alexrivera"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-500 hover:underline"
                  >
                    <Github className="h-4 w-4" />
                    <span>GitHub Profile</span>
                  </a>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{userProfile.location || "Location not specified"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Member since {freelanceStats.memberSince}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Skills</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="space-y-4">
                  {skills.map((skill, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{skill.name}</span>
                        <span className="text-xs text-muted-foreground">{skill.level}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${skill.level}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">{userProfile.full_name || userProfile.username}'s Portfolio</h2>
              <p className="text-muted-foreground">{userProfile.bio || "No bio available"}</p>
              {isOwnProfile && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="secondary">
                    <Link to="/app/freelance/post-skill">Post a Skill</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link to="/app/freelance/post-job">Post a Job</Link>
                  </Button>
                </div>
              )}
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                <TabsTrigger value="external">External Work</TabsTrigger>
                <TabsTrigger value="experience">Experience</TabsTrigger>
                <TabsTrigger value="certifications">Certifications</TabsTrigger>
              </TabsList>

              {/* Portfolio Tab */}
              <TabsContent value="portfolio" className="mt-6">
                {/* Category Filter */}
                <div className="mb-6 flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                      className="capitalize"
                    >
                      {category.name}
                      <span className="ml-2 bg-background/20 px-2 py-0.5 rounded-full text-xs">
                        {category.count}
                      </span>
                    </Button>
                  ))}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {projects
                    .filter(project => selectedCategory === "all" || project.category === selectedCategory)
                    .map((project) => (
                      <Card key={project.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-0">
                          <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
                            <img 
                              src={project.images[0]} 
                              alt={project.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="p-6">
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant="secondary">{project.category.replace('_', ' ')}</Badge>
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                <span className="text-sm font-medium">{project.rating}</span>
                              </div>
                            </div>
                            <h3 className="font-semibold text-lg mb-2">{project.title}</h3>
                            <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                              {project.description}
                            </p>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {project.tags.slice(0, 3).map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                              <span>{project.duration}</span>
                              {project.budget && (
                                <span className="font-medium text-green-600">
                                  ${project.budget.toLocaleString()}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {project.live_demo && (
                                <Button size="sm" variant="outline" asChild>
                                  <a href={project.live_demo} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4 mr-1" />
                                    Demo
                                  </a>
                                </Button>
                              )}
                              {project.github_link && (
                                <Button size="sm" variant="outline" asChild>
                                  <a href={project.github_link} target="_blank" rel="noopener noreferrer">
                                    <Github className="h-4 w-4 mr-1" />
                                    Code
                                  </a>
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>

              {/* External Work Tab */}
              <TabsContent value="external" className="mt-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold">External Work</h3>
                    <p className="text-sm text-muted-foreground">
                      Showcase your work from other platforms and projects
                    </p>
                  </div>
                  {isOwnProfile && (
                    <Button onClick={() => navigate("/app/profile/add-work")}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Work
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {externalWorks.map((work) => (
                    <Card key={work.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            {work.type === "link" && <LinkIcon className="h-5 w-5 text-blue-600" />}
                            {work.type === "image" && <ImageIcon className="h-5 w-5 text-blue-600" />}
                            {work.type === "video" && <Play className="h-5 w-5 text-blue-600" />}
                            {work.type === "document" && <FileText className="h-5 w-5 text-blue-600" />}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{work.title}</h3>
                            <p className="text-sm text-muted-foreground">{work.category.replace('_', ' ')}</p>
                          </div>
                        </div>
                        <p className="text-muted-foreground text-sm mb-4">
                          {work.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {work.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <Button size="sm" className="w-full" asChild>
                          <a href={work.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Work
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Experience Tab */}
              <TabsContent value="experience" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Professional Experience</h3>
                    <div className="space-y-6">
                      <div className="border-l-2 border-blue-200 pl-6 relative">
                        <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-2 top-2"></div>
                        <div className="mb-2">
                          <h4 className="font-semibold">Senior Full Stack Developer</h4>
                          <p className="text-muted-foreground text-sm">TechCorp Inc. • 2022 - Present</p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Leading development of scalable web applications using React, Node.js, and cloud technologies.
                        </p>
                      </div>
                      <div className="border-l-2 border-gray-200 pl-6 relative">
                        <div className="absolute w-3 h-3 bg-gray-400 rounded-full -left-2 top-2"></div>
                        <div className="mb-2">
                          <h4 className="font-semibold">Frontend Developer</h4>
                          <p className="text-muted-foreground text-sm">StartupXYZ • 2020 - 2022</p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Developed responsive web applications and improved user experience across multiple platforms.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Certifications Tab */}
              <TabsContent value="certifications" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {certifications.map((cert, index) => (
                    <Card key={index}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-blue-100 rounded-lg">
                            <Award className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1">{cert.name}</h3>
                            <p className="text-muted-foreground text-sm mb-2">{cert.issuer}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Issued: {cert.date}</span>
                              <span>ID: {cert.credential}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Add External Work Modal */}
      {isOwnProfile && (
        <AddExternalWorkModal
          open={showAddWorkModal}
          onClose={() => setShowAddWorkModal(false)}
          onAddWork={(newWork) => {
            setExternalWorks(prev => [...prev, newWork]);
            setShowAddWorkModal(false);
          }}
        />
      )}
    </div>
  );
};

export default UserProjects;
