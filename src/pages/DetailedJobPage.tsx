// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  MapPin,
  DollarSign,
  Clock,
  Briefcase,
  Star,
  AlertCircle,
  ArrowLeft,
  Send,
  FileText,
  Calendar,
  Users,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/hooks/use-notification';
import { UnifiedActivityService } from '@/services/unifiedActivityService';

interface JobDetails {
  id: string;
  title: string;
  description: string;
  company: {
    name: string;
    logo: string;
    verified: boolean;
    rating: number;
    employeesHired: number;
  };
  type: string;
  location: string;
  salary: string;
  skills: string[];
  postedDate: string;
  deadline: string;
  applicants: number;
  status: 'active' | 'closed' | 'paused';
  requirements: string[];
  benefits: string[];
  isAvailable: boolean;
}

interface SuggestedJob {
  id: string;
  title: string;
  company: string;
  salary: string;
  location: string;
  type: string;
}

const DetailedJobPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const notification = useNotification();
  
  const [job, setJob] = useState<JobDetails | null>(null);
  const [suggestedJobs, setSuggestedJobs] = useState<SuggestedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationData, setApplicationData] = useState({
    coverLetter: '',
    expectedSalary: '',
    availableDate: '',
    portfolioUrl: '',
    resume: null as File | null
  });

  useEffect(() => {
    loadJobDetails();
  }, [jobId]);

  const loadJobDetails = async () => {
    setLoading(true);
    
    // Simulate API call - replace with actual API
    try {
      // Mock data based on jobId
      if (jobId === 'job1') {
        setJob({
          id: 'job1',
          title: 'Full-Stack Developer',
          description: 'We are looking for a talented Full-Stack Developer to join our growing startup. Work remotely with a competitive salary and equity options. Experience with React, Node.js, and cloud platforms required.',
          company: {
            name: 'TechStartup Inc',
            logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150',
            verified: true,
            rating: 4.8,
            employeesHired: 23
          },
          type: 'Full-time Remote',
          location: 'Remote',
          salary: '$80K - $120K + Equity',
          skills: ['React', 'Node.js', 'AWS', 'TypeScript', 'MongoDB', 'Docker'],
          postedDate: '2024-01-15',
          deadline: '2024-02-15',
          applicants: 45,
          status: 'active',
          requirements: [
            '3+ years of experience with React and Node.js',
            'Experience with cloud platforms (AWS, Azure, or GCP)',
            'Knowledge of TypeScript and modern development practices',
            'Experience with database design and optimization',
            'Strong problem-solving and communication skills'
          ],
          benefits: [
            'Competitive salary with equity options',
            'Full health insurance coverage',
            'Flexible working hours',
            'Professional development budget',
            'Remote work allowance'
          ],
          isAvailable: true
        });

        setSuggestedJobs([
          { id: 'job2', title: 'React Developer', company: 'DevCorp', salary: '$70K - $90K', location: 'Remote', type: 'Full-time' },
          { id: 'job3', title: 'Backend Developer', company: 'ApiTech', salary: '$75K - $95K', location: 'Hybrid', type: 'Full-time' },
          { id: 'job4', title: 'Frontend Lead', company: 'UXStudio', salary: '$90K - $110K', location: 'Remote', type: 'Full-time' }
        ]);
      } else {
        // Job not found or unavailable
        setJob({
          id: jobId || '',
          title: 'Job Not Available',
          description: 'This job posting is no longer available or has been removed.',
          company: {
            name: 'Unknown',
            logo: '',
            verified: false,
            rating: 0,
            employeesHired: 0
          },
          type: '',
          location: '',
          salary: '',
          skills: [],
          postedDate: '',
          deadline: '',
          applicants: 0,
          status: 'closed',
          requirements: [],
          benefits: [],
          isAvailable: false
        });

        setSuggestedJobs([
          { id: 'job5', title: 'Senior Developer', company: 'TechCorp', salary: '$85K - $115K', location: 'Remote', type: 'Full-time' },
          { id: 'job6', title: 'Software Engineer', company: 'InnovateLab', salary: '$70K - $100K', location: 'Hybrid', type: 'Full-time' },
          { id: 'job7', title: 'Full-Stack Engineer', company: 'StartupX', salary: '$80K - $110K', location: 'Remote', type: 'Contract' }
        ]);
      }
    } catch (error) {
      console.error('Failed to load job details:', error);
      notification.error('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyClick = () => {
    if (!user) {
      notification.error('Please log in to apply for jobs');
      navigate('/auth');
      return;
    }
    setShowApplicationForm(true);
  };

  const handleSubmitApplication = async () => {
    if (!user || !job) return;

    try {
      const reward = await UnifiedActivityService.trackJobApplication(
        user.id,
        job.id,
        {
          jobTitle: job.title,
          company: job.company.name,
          salary: job.salary,
          applicationData,
          source: 'detailed_page'
        }
      );

      if (reward.success && reward.eloityPoints > 0) {
        notification.success(`Application submitted! +${reward.eloityPoints} Eloity Points earned`, {
          description: 'Your application has been sent to the employer'
        });
      } else {
        notification.success('Application submitted successfully!');
      }

      setShowApplicationForm(false);
      setApplicationData({
        coverLetter: '',
        expectedSalary: '',
        availableDate: '',
        portfolioUrl: '',
        resume: null
      });
    } catch (error) {
      notification.error('Failed to submit application');
    }
  };

  const handleSuggestedJobClick = (suggestedJobId: string) => {
    navigate(`/app/freelance/job/${suggestedJobId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Job Not Found</h2>
          <p className="text-muted-foreground mb-4">The job you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/app/freelance/browse-jobs')}>
            Browse Other Jobs
          </Button>
        </div>
      </div>
    );
  }

  if (!job.isAvailable) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <Card className="border-red-200 bg-red-50 mb-8">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-red-800 mb-2">Job No Longer Available</h2>
              <p className="text-red-600 mb-4">
                This job posting has been closed or is no longer accepting applications.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Similar Jobs You Might Like
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {suggestedJobs.map((suggestedJob) => (
                  <Card key={suggestedJob.id} className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleSuggestedJobClick(suggestedJob.id)}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{suggestedJob.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{suggestedJob.company}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              {suggestedJob.salary}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {suggestedJob.location}
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {suggestedJob.type}
                            </Badge>
                          </div>
                        </div>
                        <Button size="sm">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-6">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={job.company.logo} alt={job.company.name} />
                    <AvatarFallback>{job.company.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold mb-2">{job.title}</h1>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{job.company.name}</span>
                      {job.company.verified && (
                        <Badge className="bg-blue-500 text-white">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        {job.company.rating} ({job.company.employeesHired} hired)
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {job.applicants} applicants
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600 mb-1">{job.salary}</div>
                    <Badge variant="outline">{job.type}</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Posted: {new Date(job.postedDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {job.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>

                <Button
                  onClick={handleApplyClick}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Apply for This Job
                </Button>
              </CardContent>
            </Card>

            {/* Job Description */}
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {job.description}
                </p>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3">Requirements</h3>
                    <ul className="space-y-2">
                      {job.requirements.map((req, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-3">Benefits</h3>
                    <ul className="space-y-2">
                      {job.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Application Form */}
            {showApplicationForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Apply for {job.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="coverLetter">Cover Letter *</Label>
                    <Textarea
                      id="coverLetter"
                      placeholder="Tell us why you're perfect for this role..."
                      value={applicationData.coverLetter}
                      onChange={(e) => setApplicationData(prev => ({ ...prev, coverLetter: e.target.value }))}
                      className="min-h-[120px]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expectedSalary">Expected Salary</Label>
                      <Input
                        id="expectedSalary"
                        placeholder="e.g., $90K"
                        value={applicationData.expectedSalary}
                        onChange={(e) => setApplicationData(prev => ({ ...prev, expectedSalary: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="availableDate">Available Start Date</Label>
                      <Input
                        id="availableDate"
                        type="date"
                        value={applicationData.availableDate}
                        onChange={(e) => setApplicationData(prev => ({ ...prev, availableDate: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="portfolioUrl">Portfolio/LinkedIn URL</Label>
                    <Input
                      id="portfolioUrl"
                      placeholder="https://your-portfolio.com"
                      value={applicationData.portfolioUrl}
                      onChange={(e) => setApplicationData(prev => ({ ...prev, portfolioUrl: e.target.value }))}
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button
                      onClick={handleSubmitApplication}
                      disabled={!applicationData.coverLetter.trim()}
                      className="flex-1"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Submit Application
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowApplicationForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Similar Jobs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {suggestedJobs.map((suggestedJob) => (
                  <Card key={suggestedJob.id} className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleSuggestedJobClick(suggestedJob.id)}>
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-1">{suggestedJob.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{suggestedJob.company}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-green-600 font-medium">{suggestedJob.salary}</span>
                        <Badge variant="outline" className="text-xs">{suggestedJob.type}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailedJobPage;
