import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Star,
  MapPin,
  DollarSign,
  Users,
  Award,
  Clock,
  Calendar,
  Globe,
  MessageCircle,
  Heart,
  Share2,
  ArrowLeft,
  Verified,
  Download,
  ExternalLink,
  CheckCircle,
  TrendingUp,
  Target,
  Briefcase,
  Mail,
  Phone,
  Linkedin,
  Github,
  Eye,
  ThumbsUp,
} from "lucide-react";
import { useFreelance } from "@/hooks/use-freelance";
import { FreelancerProfile } from "@/types/freelance";

interface TalentProfileProps {
  talentId: string;
  onBack: () => void;
  onHire?: (talentId: string) => void;
}

// Define the Talent interface based on FreelancerProfile
interface Talent {
  id: string;
  name: string;
  avatar: string;
  title: string;
  description: string;
  skills: string[];
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  location: string;
  availability: "available" | "busy" | "offline";
  verified: boolean;
  completedJobs: number;
  responseTime: string;
  successRate: number;
  portfolio: {
    id: string;
    title: string;
    image: string;
    category: string;
  }[];
  badges: string[];
  languages: string[];
  joinedDate: string;
  lastSeen: string;
}

// Mock reviews data - in a real app, this would come from a reviews service
const mockReviews = [
  {
    id: "1",
    clientName: "John Smith",
    clientAvatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face",
    rating: 5,
    review:
      "Sarah delivered exceptional work on our e-commerce platform. Her attention to detail and technical expertise exceeded our expectations. The project was completed ahead of schedule and within budget.",
    projectTitle: "E-commerce Website Redesign",
    date: "2024-01-15",
    verified: true,
  },
  {
    id: "2",
    clientName: "Emily Johnson",
    clientAvatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face",
    rating: 5,
    review:
      "Outstanding developer! Sarah built our mobile app from scratch and it's performing beautifully. Great communication throughout the project and very professional.",
    projectTitle: "Mobile Banking Application",
    date: "2024-01-08",
    verified: true,
  },
  {
    id: "3",
    clientName: "Michael Brown",
    clientAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face",
    rating: 4,
    review:
      "Solid work on our dashboard redesign. Sarah understood our requirements well and delivered a clean, user-friendly interface. Would work with her again.",
    projectTitle: "SaaS Dashboard Development",
    date: "2023-12-22",
    verified: false,
  },
];

// Mock employment history - in a real app, this would come from a profile service
const mockEmploymentHistory = [
  {
    id: "1",
    company: "TechCorp Inc.",
    position: "Senior Frontend Developer",
    duration: "2021 - 2023",
    description:
      "Led frontend development for enterprise applications serving 100k+ users.",
    type: "Full-time",
  },
  {
    id: "2",
    company: "StartupXYZ",
    position: "Full-Stack Developer",
    duration: "2020 - 2021",
    description:
      "Built MVP from scratch and scaled to 10k users in first year.",
    type: "Contract",
  },
];

// Mock certifications - in a real app, this would come from a profile service
const mockCertifications = [
  {
    id: "1",
    name: "AWS Certified Solutions Architect",
    issuer: "Amazon Web Services",
    date: "2023",
    verified: true,
  },
  {
    id: "2",
    name: "React Developer Certification",
    issuer: "Meta",
    date: "2022",
    verified: true,
  },
];

export const TalentProfile: React.FC<TalentProfileProps> = ({
  talentId,
  onBack,
  onHire,
}) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [talent, setTalent] = useState<Talent | null>(null);
  const [loading, setLoading] = useState(true);
  const { getFreelancer } = useFreelance();

  useEffect(() => {
    const fetchTalent = async () => {
      try {
        setLoading(true);
        const freelancerProfile = await getFreelancer(talentId);
        
        if (freelancerProfile) {
          // Transform FreelancerProfile to Talent interface
          const transformedTalent: Talent = {
            id: freelancerProfile.id,
            name: freelancerProfile.userId, // In a real app, this would come from a user profile
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user", // Placeholder
            title: freelancerProfile.title,
            description: freelancerProfile.description,
            skills: freelancerProfile.skills,
            hourlyRate: freelancerProfile.hourlyRate,
            rating: freelancerProfile.rating,
            reviewCount: freelancerProfile.reviewCount,
            location: "San Francisco, CA", // Placeholder
            availability: freelancerProfile.availability === "available" ? "available" : "busy",
            verified: true, // Placeholder
            completedJobs: freelancerProfile.completedProjects,
            responseTime: "1 hour", // Placeholder
            successRate: 95, // Placeholder
            portfolio: freelancerProfile.portfolio.map((url, index) => ({
              id: index.toString(),
              title: `Project ${index + 1}`,
              image: url,
              category: "Web Development"
            })),
            badges: ["Top Rated", "Verified"], // Placeholder
            languages: freelancerProfile.languages,
            joinedDate: freelancerProfile.createdAt.toISOString(), // Placeholder
            lastSeen: "Online now" // Placeholder
          };
          
          setTalent(transformedTalent);
        }
      } catch (error) {
        console.error("Error fetching talent:", error);
      } finally {
        setLoading(false);
      }
    };

    if (talentId) {
      fetchTalent();
    }
  }, [talentId, getFreelancer]);

  const handleHire = () => {
    onHire?.(talentId);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  const getAvailabilityBadge = (availability: string) => {
    switch (availability) {
      case "available":
        return (
          <Badge className="bg-green-100 text-green-800">Available Now</Badge>
        );
      case "busy":
        return <Badge className="bg-yellow-100 text-yellow-800">Busy</Badge>;
      case "offline":
        return <Badge className="bg-gray-100 text-gray-800">Offline</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!talent) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Talent not found
          </h3>
          <p className="text-gray-600 mb-6">
            The requested talent profile could not be found
          </p>
          <Button onClick={onBack}>Back to Talents</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Talents
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              className={isSaved ? "bg-red-50 text-red-600" : ""}
            >
              <Heart
                className={`w-4 h-4 mr-2 ${isSaved ? "fill-current" : ""}`}
              />
              {isSaved ? "Saved" : "Save"}
            </Button>
          </div>
        </div>

        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left side */}
              <div className="flex-1">
                <div className="flex items-start gap-4 mb-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={talent.avatar} alt={talent.name} />
                    <AvatarFallback className="text-xl">
                      {talent.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-2xl font-bold">{talent.name}</h1>
                      {talent.verified && (
                        <Verified className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <p className="text-lg text-muted-foreground mb-2">
                      {talent.title}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {talent.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {talent.lastSeen}
                      </div>
                    </div>
                  </div>
                  {getAvailabilityBadge(talent.availability)}
                </div>

                <p className="text-muted-foreground mb-4">
                  {talent.description}
                </p>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {talent.badges.map((badge) => (
                    <Badge key={badge} className="bg-blue-100 text-blue-800">
                      <Award className="w-3 h-3 mr-1" />
                      {badge}
                    </Badge>
                  ))}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {talent.rating}
                    </div>
                    <div className="text-sm text-muted-foreground">Rating</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {talent.completedJobs}
                    </div>
                    <div className="text-sm text-muted-foreground">Jobs</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {talent.successRate}%
                    </div>
                    <div className="text-sm text-muted-foreground">Success</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {talent.responseTime}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Response
                    </div>
                  </div>
                </div>
              </div>

              {/* Right side - Actions */}
              <div className="lg:w-80">
                <Card>
                  <CardContent className="p-4 space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        ${talent.hourlyRate}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        per hour
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Button className="w-full" size="lg" onClick={handleHire}>
                        <Briefcase className="w-4 h-4 mr-2" />
                        Hire Sarah
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setIsMessageDialogOpen(true)}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Send Message
                      </Button>
                    </div>

                    <Separator />

                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Response time:
                        </span>
                        <span className="font-medium">
                          {talent.responseTime}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Recent delivery:
                        </span>
                        <span className="font-medium">2 days</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Languages:
                        </span>
                        <span className="font-medium">
                          {talent.languages.length}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Options */}
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-lg">Contact</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="ghost" className="w-full justify-start">
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                      <Linkedin className="w-4 h-4 mr-2" />
                      LinkedIn
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                      <Github className="w-4 h-4 mr-2" />
                      GitHub
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle>Skills & Expertise</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {talent.skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="px-3 py-1"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Languages */}
            <Card>
              <CardHeader>
                <CardTitle>Languages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {talent.languages.map((language, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <span>{language}</span>
                      <Badge variant="outline">Verified</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium">
                        Completed "E-commerce Platform" project
                      </p>
                      <p className="text-sm text-muted-foreground">
                        2 days ago
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <div>
                      <p className="font-medium">Received 5-star review</p>
                      <p className="text-sm text-muted-foreground">
                        1 week ago
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">
                        Success rate increased to 98%
                      </p>
                      <p className="text-sm text-muted-foreground">
                        2 weeks ago
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="portfolio" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {talent.portfolio.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <div className="aspect-video relative">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
                      <Button
                        variant="secondary"
                        className="opacity-0 hover:opacity-100 transition-opacity"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.category}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <div className="space-y-6">
              {/* Reviews Summary */}
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-yellow-600 mb-2">
                        {talent.rating}
                      </div>
                      <div className="flex items-center justify-center gap-1 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < Math.floor(talent.rating) ? "text-yellow-500 fill-current" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {talent.reviewCount} reviews
                      </div>
                    </div>
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map((stars) => (
                        <div key={stars} className="flex items-center gap-2">
                          <span className="text-sm w-8">{stars}★</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-yellow-500 rounded-full h-2"
                              style={{
                                width: `${stars === 5 ? 85 : stars === 4 ? 10 : 5}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-8">
                            {stars === 5 ? 85 : stars === 4 ? 10 : 5}%
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {talent.successRate}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Success Rate
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          95%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Recommend Rate
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Individual Reviews */}
              <div className="space-y-4">
                {mockReviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage
                              src={review.clientAvatar}
                              alt={review.clientName}
                            />
                            <AvatarFallback>
                              {review.clientName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">
                                {review.clientName}
                              </h4>
                              {review.verified && (
                                <Verified className="w-4 h-4 text-blue-600" />
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3 h-3 ${i < review.rating ? "text-yellow-500 fill-current" : "text-gray-300"}`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {review.date}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <ThumbsUp className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-sm font-medium mb-2">
                        {review.projectTitle}
                      </p>
                      <p className="text-muted-foreground">{review.review}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="experience" className="mt-6 space-y-6">
            {/* Employment History */}
            <Card>
              <CardHeader>
                <CardTitle>Employment History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockEmploymentHistory.map((job) => (
                    <div
                      key={job.id}
                      className="border-l-2 border-blue-200 pl-4"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{job.position}</h4>
                          <p className="text-sm text-muted-foreground">
                            {job.company}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {job.duration}
                          </p>
                          <p className="text-sm mt-2">{job.description}</p>
                        </div>
                        <Badge
                          variant={
                            job.type === "Full-time" ? "default" : "secondary"
                          }
                        >
                          {job.type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Certifications */}
            <Card>
              <CardHeader>
                <CardTitle>Certifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockCertifications.map((cert) => (
                    <div
                      key={cert.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <h4 className="font-medium">{cert.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {cert.issuer} • {cert.date}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {cert.verified && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Message Dialog */}
      <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Message to {talent.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Start a conversation with {talent.name} to discuss your project
              requirements.
            </p>
            <Button className="w-full">
              <MessageCircle className="w-4 h-4 mr-2" />
              Open Chat
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TalentProfile;