import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  RefreshCw,
  BookOpen,
  GraduationCap,
  Trophy,
  Play,
  Clock,
  Users,
  Star,
  TrendingUp,
  Shield,
  Brain,
  Target
} from "lucide-react";
import { blogService } from "@/services/blogService";
import { BlogPost } from "@/types/blog";
import { courseService, Course } from "@/services/courseService";
import { educationalArticleService, EducationalArticle } from "@/services/educationalArticleService";
import LearningProgressDashboard from "@/components/rewards/LearningProgressDashboard";

const CryptoLearn = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [educationalArticles, setEducationalArticles] = useState<EducationalArticle[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseStats, setCourseStats] = useState({
    totalCourses: 0,
    enrolledCourses: 0,
    completedCourses: 0,
    totalTimeSpent: 0,
    averageProgress: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access the learning center.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    loadData();
  }, [user, navigate, toast]);

  const loadData = async () => {
    try {
      // Load courses
      const allCourses = courseService.getAllCourses();

      // Load user progress for each course
      if (user) {
        const userProgress = courseService.getUserProgress(user.id);
        const enrolledCourseIds = userProgress.map(p => p.courseId);

        // Update course enrollment and progress status
        allCourses.forEach(course => {
          const progress = userProgress.find(p => p.courseId === course.id);
          if (progress) {
            course.enrolled = true;
            course.progress = progress.progress;
            course.completedLessons = progress.completedLessons.length;
          }
        });

        // Get course statistics
        const stats = courseService.getCourseStats(user.id);
        setCourseStats(stats);
      }

      setCourses(allCourses);

      // Load blog posts
      const result = await blogService.getBlogPosts({ limit: 12 });
      setBlogPosts(result?.posts || []);

      // Load educational articles
      const articles = educationalArticleService.getAllArticles();
      setEducationalArticles(articles);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast({
        title: "Error",
        description: "Failed to load course data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToCrypto = () => {
    navigate("/app/crypto");
  };

  const handleCourseClick = (courseId: string) => {
    navigate(`/app/course/${courseId}`);
  };

  const handleArticleClick = (articleId: string) => {
    navigate(`/app/article/${articleId}`);
  };

  if (!user) {
    return null; // Will redirect to auth
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "Intermediate": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "Advanced": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  return (
    <>
      <Helmet>
        <title>Crypto Education Center - Learn Trading & Blockchain | Softchat</title>
        <meta name="description" content="Comprehensive cryptocurrency education with courses, tutorials, and expert insights on trading, blockchain, and DeFi." />
      </Helmet>

      <div className="min-h-screen bg-platform">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackToCrypto}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Crypto
              </Button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Learn
                </h1>
                <p className="text-muted-foreground">
                  Crypto education and tutorials
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <GraduationCap className="h-4 w-4 text-orange-600" />
              </div>
              <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                Learn & Earn
              </span>
            </div>
          </div>

          {/* Progress Banner */}
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-full">
                    <Trophy className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Welcome to Crypto Academy</h3>
                    <p className="text-white font-medium">
                      {courseStats.enrolledCourses > 0
                        ? `Continue your crypto education journey`
                        : `Start your journey to becoming a crypto expert`
                      }
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {courseStats.completedCourses}/{courseStats.totalCourses}
                  </div>
                  <div className="text-sm text-white font-medium">Courses Completed</div>
                  {courseStats.enrolledCourses > 0 && (
                    <div className="text-xs text-white/80 mt-1">
                      {Math.round(courseStats.averageProgress)}% avg progress
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Tabs */}
          <Tabs defaultValue="courses" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="courses" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Courses
              </TabsTrigger>
              <TabsTrigger value="articles" className="flex items-center gap-2">
                <Play className="h-4 w-4" />
                Articles
              </TabsTrigger>
              <TabsTrigger value="progress" className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Progress
              </TabsTrigger>
              <TabsTrigger value="community" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Community
              </TabsTrigger>
            </TabsList>

            {/* Courses Tab */}
            <TabsContent value="courses" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course, index) => (
                  <Card
                    key={course.id}
                    className="cursor-pointer hover:shadow-xl transition-all duration-300 group content-card overflow-hidden hover:scale-[1.02]"
                    onClick={() => handleCourseClick(course.id)}
                  >
                    <div className={`h-2 bg-gradient-to-r ${course.color}`}></div>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className={`p-3 rounded-lg bg-gradient-to-r ${course.color}`}>
                            <course.icon className="h-6 w-6 text-white" />
                          </div>
                          <Badge className={getLevelColor(course.level)}>
                            {course.level}
                          </Badge>
                        </div>

                        <div>
                          <h3 className="font-bold text-lg mb-2 group-hover:text-blue-600 transition-colors">
                            {course.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {course.description}
                          </p>
                        </div>

                        {/* Progress bar for enrolled courses */}
                        {course.enrolled && course.progress > 0 && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Progress</span>
                              <span>{Math.round(course.progress)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                              <div
                                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${course.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {course.duration}
                          </div>
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            {course.totalLessons} lessons
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {course.students.toLocaleString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            {course.rating}
                          </div>
                        </div>

                        <Button
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCourseClick(course.id);
                          }}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          {course.enrolled
                            ? course.progress > 0
                              ? 'Continue Learning'
                              : 'Start Learning'
                            : 'View Course'
                          }
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Articles Tab */}
            <TabsContent value="articles" className="mt-6">
              <div className="space-y-8">
                {/* Educational Articles Section */}
                {educationalArticles && educationalArticles.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold">Educational Articles</h3>
                        <p className="text-sm text-muted-foreground">
                          In-depth articles with quizzes to test your knowledge
                        </p>
                      </div>
                      <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                        Interactive Learning
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {educationalArticles.map((article) => (
                        <Card
                          key={article.id}
                          className="cursor-pointer hover:shadow-xl transition-all duration-300 group border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm overflow-hidden hover:scale-[1.02]"
                          onClick={() => handleArticleClick(article.id)}
                        >
                          {article.featuredImage && (
                            <div className="relative h-48 overflow-hidden">
                              <img
                                src={article.featuredImage}
                                alt={article.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                              <div className="absolute top-3 right-3">
                                <Badge className={`bg-gradient-to-r ${article.category.color} text-white`}>
                                  {article.category.name}
                                </Badge>
                              </div>
                              <div className="absolute top-3 left-3">
                                <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Quiz
                                </Badge>
                              </div>
                            </div>
                          )}
                          <CardContent className="p-6">
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={`text-xs ${
                                  article.difficulty === 'Beginner'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                    : article.difficulty === 'Intermediate'
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                }`}>
                                  {article.difficulty}
                                </Badge>
                              </div>

                              <h3 className="font-bold text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
                                {article.title}
                              </h3>
                              <p className="text-sm text-muted-foreground line-clamp-3">
                                {article.excerpt}
                              </p>
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {article.readingTime}m read
                                </div>
                                <div className="flex items-center gap-2">
                                  <span>{article.quiz.questions.length} questions</span>
                                  <span>{article.stats.views.toLocaleString()} views</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Blog Posts Section */}
                {blogPosts && blogPosts.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold">Latest Blog Posts</h3>
                        <p className="text-sm text-muted-foreground">
                          Stay updated with the latest crypto news and insights
                        </p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        News & Updates
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {blogPosts.slice(0, 6).map((post, index) => (
                        <Card
                          key={post.id}
                          className="cursor-pointer hover:shadow-xl transition-all duration-300 group border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm overflow-hidden hover:scale-[1.02]"
                          onClick={() => window.open(`/blog/${post.slug}`, "_blank")}
                        >
                          {post.featuredImage && (
                            <div className="relative h-48 overflow-hidden">
                              <img
                                src={post.featuredImage}
                                alt={post.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                              <div className="absolute top-3 right-3">
                                <Badge className="bg-white/90 text-black">
                                  {post.category.name}
                                </Badge>
                              </div>
                            </div>
                          )}
                          <CardContent className="p-6">
                            <div className="space-y-3">
                              <h3 className="font-bold text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
                                {post.title}
                              </h3>
                              <p className="text-sm text-muted-foreground line-clamp-3">
                                {post.excerpt}
                              </p>
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {post.readingTime}m read
                                </div>
                                <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {(!educationalArticles || educationalArticles.length === 0) && (!blogPosts || blogPosts.length === 0) && (
                  <div className="col-span-full text-center py-12">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading educational content...</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Progress Tab */}
            <TabsContent value="progress" className="mt-6">
              <LearningProgressDashboard />
            </TabsContent>

            {/* Community Tab */}
            <TabsContent value="community" className="mt-6">
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Join Our Learning Community</h3>
                <p className="text-muted-foreground mb-6">
                  Connect with fellow crypto enthusiasts, share insights, and learn together
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  <Card className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-blue-500 flex items-center justify-center">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-semibold mb-2">Discussion Forums</h4>
                    <p className="text-sm text-muted-foreground">Ask questions and share knowledge</p>
                  </Card>
                  <Card className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-green-500 flex items-center justify-center">
                      <Trophy className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-semibold mb-2">Challenges</h4>
                    <p className="text-sm text-muted-foreground">Complete trading challenges</p>
                  </Card>
                  <Card className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-purple-500 flex items-center justify-center">
                      <Star className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-semibold mb-2">Leaderboard</h4>
                    <p className="text-sm text-muted-foreground">Track your learning progress</p>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default CryptoLearn;
