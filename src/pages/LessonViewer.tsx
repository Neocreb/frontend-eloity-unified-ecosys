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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  FileText,
  ListChecks,
  Target,
  BookOpen,
  Award,
  Gift,
  Star,
  Coins
} from "lucide-react";
import { courseService, Course, Lesson, QuizQuestion } from "@/services/courseService";

interface QuizState {
  currentQuestion: number;
  answers: { [questionId: string]: number };
  showResults: boolean;
  score: number;
}

const LessonViewer = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestion: 0,
    answers: {},
    showResults: false,
    score: 0
  });

  // Video player state
  const [videoState, setVideoState] = useState({
    playing: false,
    muted: false,
    currentTime: 0,
    duration: 0
  });

  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access lessons.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (courseId && lessonId) {
      loadLessonData();
    }
  }, [courseId, lessonId, user, navigate, toast]);

  const loadLessonData = () => {
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

      const lessonData = courseData.lessons.find(l => l.id === lessonId);
      if (!lessonData) {
        toast({
          title: "Lesson Not Found",
          description: "The requested lesson could not be found.",
          variant: "destructive",
        });
        navigate(`/app/course/${courseId}`);
        return;
      }

      // Check if user is enrolled
      const userProgress = courseService.getUserProgressForCourse(user!.id, courseId!);
      if (!userProgress) {
        toast({
          title: "Enrollment Required",
          description: "You must be enrolled in this course to access lessons.",
          variant: "destructive",
        });
        navigate(`/app/course/${courseId}`);
        return;
      }

      // Update completion status
      courseData.lessons.forEach(l => {
        l.completed = userProgress.completedLessons.includes(l.id);
      });

      setCourse(courseData);
      setLesson(lessonData);
      setLessonCompleted(lessonData.completed);

      // Initialize quiz state if it's a quiz lesson
      if (lessonData.type === 'quiz' && lessonData.quizQuestions) {
        setQuizState({
          currentQuestion: 0,
          answers: {},
          showResults: false,
          score: 0
        });
      }
    } catch (error) {
      console.error("Error loading lesson:", error);
      toast({
        title: "Error",
        description: "Failed to load lesson content.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markLessonComplete = async () => {
    if (!user || !courseId || !lessonId || lessonCompleted) return;

    const success = await courseService.markLessonCompleted(user.id, courseId, lessonId);
    if (success) {
      setLessonCompleted(true);

      // Calculate rewards earned
      const rewardPoints = lesson?.rewardPoints?.completion || 10;
      let toastMessage = `Great job! You earned ${rewardPoints} points.`;

      // Check if course is completed
      const userProgress = courseService.getUserProgressForCourse(user.id, courseId);
      if (userProgress && userProgress.progress === 100) {
        const courseRewards = course?.rewardPoints.completion || 0;
        const certificateRewards = course?.certificate ? course.rewardPoints.certificate : 0;
        const totalBonus = courseRewards + certificateRewards;

        if (totalBonus > 0) {
          toastMessage += ` Plus ${totalBonus} bonus points for course completion!`;
        }
      }

      toast({
        title: "🎉 Lesson Completed!",
        description: toastMessage,
      });

      // Update course progress
      const updatedCourse = courseService.getCourseById(courseId);
      if (updatedCourse) {
        const userProgress = courseService.getUserProgressForCourse(user.id, courseId);
        if (userProgress) {
          updatedCourse.progress = userProgress.progress;
          updatedCourse.completedLessons = userProgress.completedLessons.length;
        }
        setCourse(updatedCourse);
      }
    } else {
      toast({
        title: "Error",
        description: "Failed to mark lesson as completed.",
        variant: "destructive",
      });
    }
  };

  const getNextLesson = () => {
    if (!course || !lesson) return null;
    const currentIndex = course.lessons.findIndex(l => l.id === lesson.id);
    return currentIndex < course.lessons.length - 1 ? course.lessons[currentIndex + 1] : null;
  };

  const getPreviousLesson = () => {
    if (!course || !lesson) return null;
    const currentIndex = course.lessons.findIndex(l => l.id === lesson.id);
    return currentIndex > 0 ? course.lessons[currentIndex - 1] : null;
  };

  const handleQuizAnswer = (questionId: string, answerIndex: number) => {
    setQuizState(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: answerIndex
      }
    }));
  };

  const handleNextQuestion = () => {
    if (!lesson?.quizQuestions) return;

    if (quizState.currentQuestion < lesson.quizQuestions.length - 1) {
      setQuizState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1
      }));
    } else {
      // Calculate score and show results
      const totalQuestions = lesson.quizQuestions.length;
      const correctAnswers = lesson.quizQuestions.reduce((count, question) => {
        const userAnswer = quizState.answers[question.id];
        return count + (userAnswer === question.correctAnswer ? 1 : 0);
      }, 0);
      
      const score = Math.round((correctAnswers / totalQuestions) * 100);
      
      setQuizState(prev => ({
        ...prev,
        showResults: true,
        score
      }));

      // Save quiz score
      if (user && courseId) {
        courseService.saveQuizScore(user.id, courseId, lessonId!, score);

        if (score >= 70) {
          // Calculate reward points
          let rewardMessage = `Congratulations! You scored ${score}% and passed the quiz.`;
          let totalPoints = 0;

          if (lesson?.rewardPoints?.completion) {
            totalPoints += lesson.rewardPoints.completion;
          }

          if (score === 100 && lesson?.rewardPoints?.bonus) {
            totalPoints += lesson.rewardPoints.bonus;
            rewardMessage += ` Perfect score bonus included!`;
          }

          toast({
            title: "🏆 Quiz Passed!",
            description: `${rewardMessage} You earned ${totalPoints} points!`,
          });
        } else {
          toast({
            title: "Quiz Failed",
            description: `You scored ${score}%. You need 70% or higher to pass. Try again!`,
            variant: "destructive",
          });
        }
      }
    }
  };

  const retakeQuiz = () => {
    setQuizState({
      currentQuestion: 0,
      answers: {},
      showResults: false,
      score: 0
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-platform flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (!course || !lesson) {
    return (
      <div className="min-h-screen bg-platform flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Lesson Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested lesson could not be found.</p>
          <Button onClick={() => navigate(`/app/course/${courseId}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Course
          </Button>
        </div>
      </div>
    );
  }

  const nextLesson = getNextLesson();
  const previousLesson = getPreviousLesson();

  return (
    <>
      <Helmet>
        <title>{lesson.title} - {course.title} | Eloity</title>
        <meta name="description" content={lesson.description} />
      </Helmet>

      <div className="min-h-screen bg-platform">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/app/course/${courseId}`)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Course
            </Button>
            
            <div className="flex items-center gap-4">
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                Lesson {lesson.order} of {course.totalLessons}
              </Badge>
              {lessonCompleted && (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl mb-2">{lesson.title}</CardTitle>
                      <p className="text-muted-foreground">{lesson.description}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {lesson.duration} min
                      </div>
                      {lesson.rewardPoints?.completion && (
                        <div className="flex items-center gap-1 text-amber-600">
                          <Coins className="h-4 w-4" />
                          {lesson.rewardPoints.completion}
                          {lesson.rewardPoints.bonus && `+${lesson.rewardPoints.bonus}`} pts
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Reward Points Info */}
              {lesson.rewardPoints && !lessonCompleted && (
                <Card className="mb-6 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                        <Gift className="h-4 w-4 text-amber-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-amber-800 dark:text-amber-200">Lesson Rewards</h4>
                        <p className="text-xs text-amber-700 dark:text-amber-300">Complete this lesson to earn points</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                        </div>
                        <span className="text-gray-700 dark:text-gray-300">
                          Completion: {lesson.rewardPoints.completion} pts
                        </span>
                      </div>

                      {lesson.rewardPoints.bonus && lesson.type === 'quiz' && (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                            <Star className="h-3 w-3 text-purple-600" />
                          </div>
                          <span className="text-gray-700 dark:text-gray-300">
                            Perfect Score: +{lesson.rewardPoints.bonus} pts
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Lesson Content */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  {lesson.type === 'video' && (
                    <div className="space-y-4">
                      <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                        <div className="text-center text-white">
                          <Play className="h-16 w-16 mx-auto mb-4 opacity-60" />
                          <p className="text-lg mb-2">Video Lesson</p>
                          <p className="text-sm opacity-80">
                            {lesson.videoUrl ? 'Video content would be loaded here' : 'Video content coming soon'}
                          </p>
                        </div>
                      </div>
                      <div className="prose dark:prose-invert max-w-none">
                        <p>{lesson.content}</p>
                      </div>
                    </div>
                  )}

                  {lesson.type === 'text' && (
                    <div className="prose dark:prose-invert max-w-none">
                      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-start gap-3">
                        <FileText className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="text-blue-900 dark:text-blue-100 font-semibold mb-1">Reading Material</h4>
                          <p className="text-blue-700 dark:text-blue-200 text-sm">
                            Take your time to read through the following content carefully.
                          </p>
                        </div>
                      </div>
                      <div className="whitespace-pre-line">{lesson.content}</div>
                    </div>
                  )}

                  {lesson.type === 'interactive' && (
                    <div className="space-y-4">
                      <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-start gap-3">
                        <Target className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="text-purple-900 dark:text-purple-100 font-semibold mb-1">Interactive Lesson</h4>
                          <p className="text-purple-700 dark:text-purple-200 text-sm">
                            Engage with the interactive content below to enhance your learning.
                          </p>
                        </div>
                      </div>
                      <div className="prose dark:prose-invert max-w-none">
                        <p>{lesson.content}</p>
                      </div>
                      <div className="mt-6 p-6 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg">
                        <p className="text-center text-gray-600 dark:text-gray-300">
                          Interactive content simulation - practice exercises would appear here
                        </p>
                      </div>
                    </div>
                  )}

                  {lesson.type === 'quiz' && lesson.quizQuestions && (
                    <div className="space-y-6">
                      <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg flex items-start gap-3">
                        <ListChecks className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="text-orange-900 dark:text-orange-100 font-semibold mb-1">Knowledge Assessment</h4>
                          <p className="text-orange-700 dark:text-orange-200 text-sm">
                            Test your understanding with this quiz. You need 70% or higher to pass.
                          </p>
                        </div>
                      </div>

                      {!quizState.showResults ? (
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">
                              Question {quizState.currentQuestion + 1} of {lesson.quizQuestions.length}
                            </h3>
                            <Progress 
                              value={((quizState.currentQuestion + 1) / lesson.quizQuestions.length) * 100}
                              className="w-32"
                            />
                          </div>

                          <Card>
                            <CardContent className="p-6">
                              <h4 className="text-lg font-medium mb-4">
                                {lesson.quizQuestions[quizState.currentQuestion].question}
                              </h4>
                              
                              <RadioGroup
                                value={quizState.answers[lesson.quizQuestions[quizState.currentQuestion].id]?.toString()}
                                onValueChange={(value) => 
                                  handleQuizAnswer(
                                    lesson.quizQuestions![quizState.currentQuestion].id, 
                                    parseInt(value)
                                  )
                                }
                              >
                                {lesson.quizQuestions[quizState.currentQuestion].options.map((option, index) => (
                                  <div key={index} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted/50">
                                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                                      {option}
                                    </Label>
                                  </div>
                                ))}
                              </RadioGroup>

                              <div className="flex justify-end mt-6">
                                <Button 
                                  onClick={handleNextQuestion}
                                  disabled={quizState.answers[lesson.quizQuestions[quizState.currentQuestion].id] === undefined}
                                >
                                  {quizState.currentQuestion < lesson.quizQuestions.length - 1 ? 'Next Question' : 'Submit Quiz'}
                                  <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      ) : (
                        <Card>
                          <CardContent className="p-6 text-center">
                            <div className="mb-6">
                              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
                                quizState.score >= 70 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                              }`}>
                                {quizState.score >= 70 ? (
                                  <CheckCircle2 className="h-8 w-8" />
                                ) : (
                                  <ListChecks className="h-8 w-8" />
                                )}
                              </div>
                              <h3 className="text-2xl font-bold mb-2">
                                {quizState.score >= 70 ? 'Quiz Passed!' : 'Quiz Failed'}
                              </h3>
                              <p className="text-lg text-muted-foreground mb-4">
                                Your score: {quizState.score}%
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {quizState.score >= 70 
                                  ? 'Congratulations! You can now proceed to the next lesson.'
                                  : 'You need 70% or higher to pass. Review the material and try again.'
                                }
                              </p>
                            </div>
                            
                            <div className="flex gap-3 justify-center">
                              {quizState.score < 70 && (
                                <Button onClick={retakeQuiz} variant="outline">
                                  Retake Quiz
                                </Button>
                              )}
                              <Button 
                                onClick={() => navigate(`/app/course/${courseId}`)}
                                variant={quizState.score >= 70 ? "default" : "outline"}
                              >
                                Back to Course
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Lesson Completion */}
              {!lessonCompleted && lesson.type !== 'quiz' && (
                <Card>
                  <CardContent className="p-6 text-center">
                    <h3 className="text-lg font-semibold mb-2">Mark as Complete</h3>
                    <p className="text-muted-foreground mb-4">
                      Have you finished this lesson? Mark it as complete to track your progress.
                    </p>
                    <Button onClick={markLessonComplete} className="bg-green-600 hover:bg-green-700">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Complete Lesson
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/app/course/${courseId}/lesson/${previousLesson!.id}`)}
                  disabled={!previousLesson}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous Lesson
                </Button>
                
                <Button
                  onClick={() => navigate(`/app/course/${courseId}/lesson/${nextLesson!.id}`)}
                  disabled={!nextLesson}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Next Lesson
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Course Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Course Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Overall Progress</span>
                        <span>{Math.round(course.progress)}%</span>
                      </div>
                      <Progress value={course.progress} />
                    </div>
                    <div className="text-center text-sm text-muted-foreground">
                      {course.completedLessons} of {course.totalLessons} lessons completed
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lesson List */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Course Lessons</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-96 overflow-y-auto">
                    {course.lessons.map((courseLesson, index) => (
                      <div
                        key={courseLesson.id}
                        className={`p-4 border-l-2 cursor-pointer hover:bg-muted/50 transition-colors ${
                          courseLesson.id === lesson.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : courseLesson.completed
                            ? 'border-green-500'
                            : 'border-transparent'
                        }`}
                        onClick={() => navigate(`/app/course/${courseId}/lesson/${courseLesson.id}`)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                            courseLesson.completed 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                              : courseLesson.id === lesson.id
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                          }`}>
                            {courseLesson.completed ? (
                              <CheckCircle2 className="h-3 w-3" />
                            ) : (
                              index + 1
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${
                              courseLesson.id === lesson.id ? 'text-blue-700 dark:text-blue-300' : ''
                            }`}>
                              {courseLesson.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {courseLesson.duration} min
                            </p>
                          </div>
                        </div>
                      </div>
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

export default LessonViewer;
