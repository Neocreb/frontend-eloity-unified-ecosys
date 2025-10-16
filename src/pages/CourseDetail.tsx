import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Play,
  CheckCircle2,
  Clock,
  Users,
  Star,
  BookOpen,
  Target,
  Award,
  Video,
  FileText,
  ListChecks,
  Lock,
  Download,
  Share2,
  Gift,
  Coins,
  Trophy
} from "lucide-react";
import { courseService, Course, Lesson } from "@/services/courseService";

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access courses.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (courseId) {
      loadCourse();
    }
  }, [courseId, user, navigate, toast]);

  const loadCourse = () => {
    try {
      const courseData = courseService.getCourseById(courseId!);
      if (!courseData) {
        toast({
          title: "Course Not Found",
          description: "The requested course could not be found.",
          variant: "destructive",
        });
        navigate("/app/crypto-learn");
        return;
      }

      // Load user progress if enrolled
      if (user) {
        const userProgress = courseService.getUserProgressForCourse(user.id, courseId!);
        if (userProgress) {
          courseData.enrolled = true;
          courseData.progress = userProgress.progress;
          courseData.completedLessons = userProgress.completedLessons.length;
          
          // Update lesson completion status
          courseData.lessons.forEach(lesson => {
            lesson.completed = userProgress.completedLessons.includes(lesson.id);
          });
        }
      }

      setCourse(courseData);
    } catch (error) {
      console.error("Error loading course:", error);
      toast({
        title: "Error",
        description: "Failed to load course details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user || !course) return;

    setEnrolling(true);
    try {
      const success = await courseService.enrollInCourse(user.id, course.id);
      if (success) {
        toast({
          title: "🎉 Enrollment Successful!",
          description: `You've been enrolled and earned ${course.rewardPoints.enrollment} points! Start learning now!`,
        });
        loadCourse(); // Refresh course data
      } else {
        toast({
          title: "Enrollment Failed",
          description: "There was an error enrolling in the course.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Enrollment error:", error);
      toast({
        title: "Error",
        description: "Failed to enroll in course.",
        variant: "destructive",
      });
    } finally {
      setEnrolling(false);
    }
  };

  const handleStartLesson = (lessonId: string) => {
    if (!course?.enrolled) {
      toast({
        title: "Enrollment Required",
        description: "Please enroll in the course to access lessons.",
        variant: "destructive",
      });
      return;
    }
    navigate(`/app/course/${courseId}/lesson/${lessonId}`);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "Intermediate": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "Advanced": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'text': return FileText;
      case 'quiz': return ListChecks;
      case 'interactive': return Target;
      default: return BookOpen;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-platform flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-platform flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Course Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested course could not be found.</p>
          <Button onClick={() => navigate("/app/crypto-learn")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{course.title} - Crypto Education | Eloity</title>
        <meta name="description" content={course.description} />
      </Helmet>

      <div className="min-h-screen bg-platform">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Back Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/app/crypto-learn")}
            className="flex items-center gap-2 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Courses
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Course Header */}
              <Card className="overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${course.color}`}></div>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg bg-gradient-to-r ${course.color}`}>
                        <course.icon className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
                        <Badge className={getLevelColor(course.level)}>
                          {course.level}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>

                  <p className="text-muted-foreground text-lg mb-6">{course.description}</p>

                  {/* Course Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-yellow-500 mb-1">
                        <Star className="h-4 w-4" />
                        <span className="font-semibold">{course.rating}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Rating</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">{course.students.toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Students</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">{course.duration}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Duration</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">{course.totalLessons}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Lessons</p>
                    </div>
                  </div>

                  {/* Progress Bar (if enrolled) */}
                  {course.enrolled && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Course Progress</span>
                        <span className="text-sm text-muted-foreground">
                          {course.completedLessons}/{course.totalLessons} lessons completed
                        </span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        {Math.round(course.progress)}% complete
                      </p>
                    </div>
                  )}

                  {/* Reward Points Section */}
                  <Card className="mb-6 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                          <Gift className="h-4 w-4 text-amber-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-amber-800 dark:text-amber-200">Course Rewards</h4>
                          <p className="text-xs text-amber-700 dark:text-amber-300">Complete lessons to earn learning points</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Coins className="h-3 w-3 text-blue-600" />
                          </div>
                          <span className="text-gray-700 dark:text-gray-300">
                            Enrollment: {course.rewardPoints.enrollment} pts
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                          </div>
                          <span className="text-gray-700 dark:text-gray-300">
                            Completion: {course.rewardPoints.completion} pts
                          </span>
                        </div>

                        {course.certificate && (
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                              <Trophy className="h-3 w-3 text-purple-600" />
                            </div>
                            <span className="text-gray-700 dark:text-gray-300">
                              Certificate: {course.rewardPoints.certificate} pts
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Enrollment Button */}
                  {!course.enrolled ? (
                    <Button 
                      onClick={handleEnroll}
                      disabled={enrolling}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      size="lg"
                    >
                      {enrolling ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Enrolling...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Enroll Now - Free
                        </>
                      )}
                    </Button>
                  ) : (
                    <div className="flex gap-3">
                      <Button 
                        onClick={() => {
                          const nextLesson = course.lessons.find(lesson => !lesson.completed);
                          if (nextLesson) {
                            handleStartLesson(nextLesson.id);
                          }
                        }}
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                        size="lg"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        {course.progress > 0 ? 'Continue Learning' : 'Start Learning'}
                      </Button>
                      {course.progress === 100 && course.certificate && (
                        <Button variant="outline" size="lg">
                          <Download className="h-4 w-4 mr-2" />
                          Certificate
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Course Tabs */}
              <Tabs defaultValue="lessons" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="lessons">Lessons</TabsTrigger>
                  <TabsTrigger value="about">About</TabsTrigger>
                  <TabsTrigger value="instructor">Instructor</TabsTrigger>
                </TabsList>

                {/* Lessons Tab */}
                <TabsContent value="lessons" className="mt-6">
                  <div className="space-y-4">
                    {course.lessons.map((lesson, index) => {
                      const TypeIcon = getTypeIcon(lesson.type);
                      const isLocked = !course.enrolled || (index > 0 && !course.lessons[index - 1].completed);
                      
                      return (
                        <Card 
                          key={lesson.id} 
                          className={`cursor-pointer transition-all duration-200 ${
                            isLocked 
                              ? 'opacity-60 cursor-not-allowed' 
                              : 'hover:shadow-lg hover:scale-[1.02]'
                          }`}
                          onClick={() => !isLocked && handleStartLesson(lesson.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                              <div className="flex-shrink-0">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                  lesson.completed 
                                    ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
                                    : isLocked
                                    ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                                    : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                }`}>
                                  {lesson.completed ? (
                                    <CheckCircle2 className="h-6 w-6" />
                                  ) : isLocked ? (
                                    <Lock className="h-6 w-6" />
                                  ) : (
                                    <TypeIcon className="h-6 w-6" />
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex-grow">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold">{lesson.title}</h3>
                                  <Badge variant="outline" className="text-xs">
                                    {lesson.type}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {lesson.description}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {lesson.duration} min
                                  </div>
                                  <span>Lesson {lesson.order}</span>
                                </div>
                              </div>

                              <div className="flex-shrink-0">
                                {lesson.completed && (
                                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                    Complete
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </TabsContent>

                {/* About Tab */}
                <TabsContent value="about" className="mt-6">
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5" />
                          Learning Objectives
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {course.objectives.map((objective, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{objective}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5" />
                          Requirements
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {course.requirements.map((requirement, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
                              <span className="text-sm">{requirement}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    {course.certificate && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5" />
                            Certificate of Completion
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            Upon successful completion of this course, you will receive a certificate 
                            that you can share on your professional profiles.
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                {/* Instructor Tab */}
                <TabsContent value="instructor" className="mt-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={course.instructor.avatar} alt={course.instructor.name} />
                          <AvatarFallback>{course.instructor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-grow">
                          <h3 className="text-xl font-bold mb-1">{course.instructor.name}</h3>
                          <p className="text-muted-foreground mb-3">{course.instructor.title}</p>
                          <p className="text-sm">{course.instructor.bio}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Course Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Course Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Level</span>
                    <Badge className={getLevelColor(course.level)}>
                      {course.level}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Duration</span>
                    <span className="text-sm font-medium">{course.duration}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Lessons</span>
                    <span className="text-sm font-medium">{course.totalLessons}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Students</span>
                    <span className="text-sm font-medium">{course.students.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Certificate</span>
                    <Badge variant={course.certificate ? "default" : "secondary"}>
                      {course.certificate ? "Included" : "Not included"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Tags */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {course.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseDetail;
