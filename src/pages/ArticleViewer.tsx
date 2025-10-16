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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Heart,
  Bookmark,
  Share2,
  Eye,
  ThumbsUp,
  ListChecks,
  Trophy,
  RotateCcw,
  Star,
  Gift
} from "lucide-react";
import { 
  educationalArticleService, 
  EducationalArticle, 
  ArticleQuizQuestion,
  UserArticleProgress 
} from "@/services/educationalArticleService";

interface QuizState {
  currentQuestion: number;
  answers: { [questionId: string]: number };
  showResults: boolean;
  score: number;
  startTime: Date;
}

const ArticleViewer = () => {
  const { articleId } = useParams<{ articleId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [article, setArticle] = useState<EducationalArticle | null>(null);
  const [userProgress, setUserProgress] = useState<UserArticleProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestion: 0,
    answers: {},
    showResults: false,
    score: 0,
    startTime: new Date()
  });
  const [showQuiz, setShowQuiz] = useState(false);
  const [readingStartTime] = useState(new Date());

  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to read articles.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (articleId) {
      loadArticle();
    }
  }, [articleId, user, navigate, toast]);

  useEffect(() => {
    // Track reading time when component unmounts
    return () => {
      if (user && articleId && readingStartTime) {
        const timeSpent = Math.round((Date.now() - readingStartTime.getTime()) / 60000); // in minutes
        if (timeSpent > 0) {
          educationalArticleService.updateReadingProgress(user.id, articleId, timeSpent);
        }
      }
    };
  }, [user, articleId, readingStartTime]);

  // Track reading progress periodically
  useEffect(() => {
    if (!user || !articleId) return;

    const interval = setInterval(() => {
      const timeSpent = Math.round((Date.now() - readingStartTime.getTime()) / 60000); // in minutes
      if (timeSpent > 0) {
        educationalArticleService.updateReadingProgress(user.id, articleId, timeSpent);
      }
    }, 30000); // Track every 30 seconds

    return () => clearInterval(interval);
  }, [user, articleId, readingStartTime]);

  const loadArticle = () => {
    try {
      const articleData = educationalArticleService.getArticleById(articleId!);
      if (!articleData) {
        toast({
          title: "Article Not Found",
          description: "The requested article could not be found.",
          variant: "destructive",
        });
        navigate("/app/crypto-learn");
        return;
      }

      const progress = user ? educationalArticleService.getUserArticleProgress(user.id, articleId!) : null;
      
      setArticle(articleData);
      setUserProgress(progress);
    } catch (error) {
      console.error("Error loading article:", error);
      toast({
        title: "Error",
        description: "Failed to load article content.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = () => {
    setShowQuiz(true);
    setQuizState({
      currentQuestion: 0,
      answers: {},
      showResults: false,
      score: 0,
      startTime: new Date()
    });
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
    if (!article?.quiz.questions) return;

    if (quizState.currentQuestion < article.quiz.questions.length - 1) {
      setQuizState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1
      }));
    } else {
      // Calculate score and show results
      const totalQuestions = article.quiz.questions.length;
      const correctAnswers = article.quiz.questions.reduce((count, question) => {
        const userAnswer = quizState.answers[question.id];
        return count + (userAnswer === question.correctAnswer ? 1 : 0);
      }, 0);
      
      const score = Math.round((correctAnswers / totalQuestions) * 100);
      
      setQuizState(prev => ({
        ...prev,
        showResults: true,
        score
      }));

      // Save quiz score and handle rewards
      if (user && articleId) {
        educationalArticleService.saveQuizScore(user.id, articleId, score).then(() => {
          // Refresh progress to get updated rewards
          const updatedProgress = educationalArticleService.getUserArticleProgress(user.id, articleId);
          setUserProgress(updatedProgress);
        });

        if (score >= article.quiz.passingScore) {
          // Calculate total rewards earned
          let rewardMessage = `Congratulations! You scored ${score}% and completed the article.`;
          let totalPoints = 0;

          if (article.rewardPoints.quizCompletion) {
            totalPoints += article.rewardPoints.quizCompletion;
          }

          if (score === 100 && article.rewardPoints.perfectScore) {
            totalPoints += article.rewardPoints.perfectScore;
            rewardMessage += ` Perfect score bonus included!`;
          }

          toast({
            title: "🎉 Quiz Passed!",
            description: `${rewardMessage} You earned ${totalPoints} points!`,
          });
        } else {
          toast({
            title: "Quiz Failed",
            description: `You scored ${score}%. You need ${article.quiz.passingScore}% or higher to complete the article.`,
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
      score: 0,
      startTime: new Date()
    });
  };

  const handleToggleBookmark = () => {
    if (!user || !articleId) return;
    
    const isBookmarked = educationalArticleService.toggleBookmark(user.id, articleId);
    toast({
      title: isBookmarked ? "Article Bookmarked" : "Bookmark Removed",
      description: isBookmarked ? "Article saved to your bookmarks" : "Article removed from bookmarks",
    });
    
    // Refresh progress
    const progress = educationalArticleService.getUserArticleProgress(user.id, articleId);
    setUserProgress(progress);
  };

  const handleToggleLike = async () => {
    if (!user || !articleId) return;

    const isLiked = await educationalArticleService.toggleLike(user.id, articleId);
    toast({
      title: isLiked ? "❤️ Article Liked" : "Like Removed",
      description: isLiked ? "Thanks for the feedback! You earned engagement points." : "Like removed",
    });

    // Refresh progress
    const progress = educationalArticleService.getUserArticleProgress(user.id, articleId);
    setUserProgress(progress);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "Intermediate": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "Advanced": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-platform flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-platform flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Article Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested article could not be found.</p>
          <Button onClick={() => navigate("/app/crypto-learn")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Learn
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{article.title} | Eloity</title>
        <meta name="description" content={article.excerpt} />
      </Helmet>

      <div className="min-h-screen bg-platform">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/app/crypto-learn")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Learn
            </Button>
            
            <div className="flex items-center gap-2">
              <Badge className={getLevelColor(article.difficulty)}>
                {article.difficulty}
              </Badge>
              {userProgress?.completed && (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              )}
            </div>
          </div>

          {/* Article Header */}
          <Card className="mb-6">
            <CardContent className="p-8">
              <div className="space-y-6">
                {/* Featured Image */}
                {article.featuredImage && (
                  <div className="relative h-64 overflow-hidden rounded-lg">
                    <img
                      src={article.featuredImage}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <div className="absolute top-4 right-4">
                      <Badge className={`bg-gradient-to-r ${article.category.color} text-white`}>
                        {article.category.name}
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Article Meta */}
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-4">{article.title}</h1>
                  <p className="text-lg text-muted-foreground mb-6">{article.excerpt}</p>
                  
                  {/* Author and Meta */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={article.author.avatar} alt={article.author.name} />
                        <AvatarFallback>{article.author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{article.author.name}</p>
                        <p className="text-sm text-muted-foreground">{article.author.title}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {article.readingTime} min read
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {article.stats.views.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleLike}
                    className={userProgress?.liked ? "bg-red-50 border-red-200 text-red-600" : ""}
                  >
                    <Heart className={`h-4 w-4 mr-2 ${userProgress?.liked ? "fill-current" : ""}`} />
                    {userProgress?.liked ? "Liked" : "Like"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleBookmark}
                    className={userProgress?.bookmarked ? "bg-blue-50 border-blue-200 text-blue-600" : ""}
                  >
                    <Bookmark className={`h-4 w-4 mr-2 ${userProgress?.bookmarked ? "fill-current" : ""}`} />
                    {userProgress?.bookmarked ? "Saved" : "Save"}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reward Points Info */}
          <Card className="mb-6 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Gift className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-amber-800 dark:text-amber-200">Earn Rewards</h3>
                  <p className="text-sm text-amber-700 dark:text-amber-300">Complete this article to earn learning points</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    userProgress?.rewardsEarned.reading ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}>
                    {userProgress?.rewardsEarned.reading ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                  </div>
                  <span className={userProgress?.rewardsEarned.reading ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}>
                    Reading: {article.rewardPoints.reading} pts
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    userProgress?.rewardsEarned.quizCompletion ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}>
                    {userProgress?.rewardsEarned.quizCompletion ? <CheckCircle2 className="h-3 w-3" /> : <ListChecks className="h-3 w-3" />}
                  </div>
                  <span className={userProgress?.rewardsEarned.quizCompletion ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}>
                    Quiz Pass: {article.rewardPoints.quizCompletion} pts
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    userProgress?.rewardsEarned.perfectScore ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}>
                    {userProgress?.rewardsEarned.perfectScore ? <CheckCircle2 className="h-3 w-3" /> : <Star className="h-3 w-3" />}
                  </div>
                  <span className={userProgress?.rewardsEarned.perfectScore ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}>
                    Perfect Score: {article.rewardPoints.perfectScore} pts
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-amber-200 dark:border-amber-800">
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  💡 Tip: Spend at least 80% of the reading time and pass the quiz to earn all rewards!
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Article Content */}
          <Card className="mb-6">
            <CardContent className="p-8">
              <div className="prose dark:prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br />') }} />
              </div>
            </CardContent>
          </Card>

          {/* Quiz Section */}
          {!showQuiz ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 mx-auto rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-4">
                    <ListChecks className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Test Your Knowledge</h3>
                  <p className="text-muted-foreground mb-2">{article.quiz.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {article.quiz.questions.length} questions • {article.quiz.passingScore}% to pass
                  </p>
                </div>
                
                <Button onClick={handleStartQuiz} size="lg" className="bg-orange-600 hover:bg-orange-700">
                  <ListChecks className="h-4 w-4 mr-2" />
                  Start Quiz
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8">
                {!quizState.showResults ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold">
                        {article.quiz.title}
                      </h3>
                      <div className="text-sm text-muted-foreground">
                        Question {quizState.currentQuestion + 1} of {article.quiz.questions.length}
                      </div>
                    </div>

                    <Progress 
                      value={((quizState.currentQuestion + 1) / article.quiz.questions.length) * 100}
                      className="h-2"
                    />

                    <Card>
                      <CardContent className="p-6">
                        <h4 className="text-lg font-medium mb-4">
                          {article.quiz.questions[quizState.currentQuestion].question}
                        </h4>
                        
                        <RadioGroup
                          value={quizState.answers[article.quiz.questions[quizState.currentQuestion].id]?.toString()}
                          onValueChange={(value) => 
                            handleQuizAnswer(
                              article.quiz.questions[quizState.currentQuestion].id, 
                              parseInt(value)
                            )
                          }
                        >
                          {article.quiz.questions[quizState.currentQuestion].options.map((option, index) => (
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
                            disabled={quizState.answers[article.quiz.questions[quizState.currentQuestion].id] === undefined}
                          >
                            {quizState.currentQuestion < article.quiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center space-y-6">
                    <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
                      quizState.score >= article.quiz.passingScore 
                        ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {quizState.score >= article.quiz.passingScore ? (
                        <Trophy className="h-10 w-10" />
                      ) : (
                        <RotateCcw className="h-10 w-10" />
                      )}
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold mb-2">
                        {quizState.score >= article.quiz.passingScore ? 'Quiz Completed!' : 'Quiz Failed'}
                      </h3>
                      <p className="text-lg text-muted-foreground mb-4">
                        Your score: {quizState.score}%
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {quizState.score >= article.quiz.passingScore 
                          ? 'Congratulations! You have successfully completed this article.'
                          : `You need ${article.quiz.passingScore}% or higher to complete the article.`
                        }
                      </p>
                    </div>
                    
                    <div className="flex gap-3 justify-center">
                      {quizState.score < article.quiz.passingScore && (
                        <Button onClick={retakeQuiz} variant="outline">
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Retake Quiz
                        </Button>
                      )}
                      <Button onClick={() => navigate("/app/crypto-learn")}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Learn
                      </Button>
                    </div>

                    {/* Quiz Review */}
                    <div className="mt-8 text-left">
                      <h4 className="text-lg font-semibold mb-4">Quiz Review</h4>
                      <div className="space-y-4">
                        {article.quiz.questions.map((question, index) => {
                          const userAnswer = quizState.answers[question.id];
                          const isCorrect = userAnswer === question.correctAnswer;
                          
                          return (
                            <Card key={question.id} className={`border-l-4 ${
                              isCorrect ? 'border-green-500' : 'border-red-500'
                            }`}>
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm ${
                                    isCorrect ? 'bg-green-500' : 'bg-red-500'
                                  }`}>
                                    {index + 1}
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-medium mb-2">{question.question}</p>
                                    <p className="text-sm text-muted-foreground mb-1">
                                      Your answer: {question.options[userAnswer]}
                                    </p>
                                    {!isCorrect && (
                                      <p className="text-sm text-green-600 mb-2">
                                        Correct answer: {question.options[question.correctAnswer]}
                                      </p>
                                    )}
                                    <p className="text-sm text-muted-foreground italic">
                                      {question.explanation}
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default ArticleViewer;
