import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, AlertCircle, CheckCircle, Trophy, ArrowRight, ArrowLeft } from "lucide-react";

import Markdown from "react-markdown";

export default function TranslatorTraining() {
  const { t, language } = useLanguage();
  const [selectedMaterial, setSelectedMaterial] = useState<number | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<number | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState<any>(null);

  const { data: materials, isLoading: loadingMaterials } = trpc.translatorTraining.getMaterials.useQuery({});
  const { data: quizzes, isLoading: loadingQuizzes } = trpc.translatorTraining.getQuizzes.useQuery();
  const { data: quizDetails } = trpc.translatorTraining.getQuizDetails.useQuery(
    { quizId: selectedQuiz! },
    { enabled: !!selectedQuiz && !quizSubmitted }
  );
  const { data: attempts } = trpc.translatorTraining.getMyAttempts.useQuery(undefined);
  
  const submitQuizMutation = trpc.translatorTraining.submitQuiz.useMutation({
    onSuccess: (result) => {
      setQuizResult(result);
      setQuizSubmitted(true);
    },
  });

  const handleSubmitQuiz = () => {
    if (!selectedQuiz || !quizDetails) return;

    submitQuizMutation.mutate({
      quizId: selectedQuiz,
      answers: quizAnswers,
    });
  };

  const renderMaterialBrowser = (category: string) => {
    const categoryMaterials = materials?.filter((m: any) => m.category === category) || [];
    
    if (loadingMaterials) {
      return <div className="text-center py-8">Loading...</div>;
    }

    if (categoryMaterials.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No materials available in this category yet.
        </div>
      );
    }

    if (selectedMaterial) {
      const material = categoryMaterials.find((m: any) => m.id === selectedMaterial);
      if (!material) return null;

      return (
        <div className="space-y-4">
          <Button
            variant="ghost"
            onClick={() => setSelectedMaterial(null)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("common.back")}
          </Button>
          
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">
              {language === "ar" ? material.titleAr : material.title}
            </h2>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <Markdown>
                {language === "ar" ? material.contentAr : material.content}
              </Markdown>
            </div>
          </Card>
        </div>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2">
        {categoryMaterials.map((material: any) => (
          <Card
            key={material.id}
            className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedMaterial(material.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">
                  {language === "ar" ? material.titleAr : material.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {language === "ar" ? material.contentAr?.substring(0, 150) : material.content?.substring(0, 150)}...
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-4" />
            </div>
          </Card>
        ))}
      </div>
    );
  };

  const renderQuizInterface = () => {
    if (loadingQuizzes) {
      return <div className="text-center py-8">Loading quizzes...</div>;
    }

    if (!selectedQuiz) {
      return (
        <div className="space-y-6">
          {/* Progress Dashboard */}
          {attempts && attempts.length > 0 && (
            <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
              <div className="flex items-center gap-4 mb-4">
                <Trophy className="h-8 w-8 text-yellow-500" />
                <div>
                  <h3 className="text-lg font-semibold">Your Progress</h3>
                  <p className="text-sm text-muted-foreground">
                    {attempts.length} quiz{attempts.length > 1 ? "zes" : ""} completed
                  </p>
                </div>
              </div>
              <div className="grid gap-2">
                {attempts.slice(0, 3).map((attempt: any) => (
                  <div key={attempt.id} className="flex items-center justify-between text-sm">
                    <span>{attempt.quiz_title}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{attempt.score}%</span>
                      {attempt.passed ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Quiz List */}
          <div className="grid gap-4 md:grid-cols-2">
            {quizzes?.map((quiz: any) => {
              const latestAttempt = attempts?.find((a: any) => a.quiz_id === quiz.id);
              
              return (
                <Card key={quiz.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">
                        {language === "ar" ? quiz.titleAr : quiz.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {language === "ar" ? quiz.descriptionAr : quiz.description}
                      </p>
                    </div>
                    
                    {latestAttempt && (
                      <div className="flex items-center gap-2">
                        <Badge variant={latestAttempt.passed ? "default" : "secondary"}>
                          Last Score: {latestAttempt.score}%
                        </Badge>
                        {latestAttempt.passed && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Passing Score: {quiz.passing_score}%</span>
                      <span>{quiz.question_count} questions</span>
                    </div>
                    
                    <Button
                      onClick={() => {
                        setSelectedQuiz(quiz.id);
                        setQuizAnswers({});
                        setCurrentQuestion(0);
                        setQuizSubmitted(false);
                        setQuizResult(null);
                      }}
                      className="w-full"
                    >
                      {latestAttempt ? "Retake Quiz" : "Start Quiz"}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      );
    }

    // Quiz Taking Interface
    if (quizSubmitted && quizResult) {
      return (
        <Card className="p-8">
          <div className="text-center space-y-6">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${
              quizResult.passed ? "bg-green-100 dark:bg-green-900" : "bg-red-100 dark:bg-red-900"
            }`}>
              {quizResult.passed ? (
                <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
              ) : (
                <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
              )}
            </div>
            
            <div>
              <h2 className="text-3xl font-bold mb-2">
                {quizResult.passed ? "Congratulations! 🎉" : "Keep Practicing"}
              </h2>
              <p className="text-lg text-muted-foreground">
                You scored {quizResult.score}% ({quizResult.correctAnswers}/{quizResult.totalQuestions} correct)
              </p>
            </div>
            
            <div className="max-w-md mx-auto">
              <Progress value={quizResult.score} className="h-3" />
            </div>
            
            <div className="space-y-4 text-left max-w-2xl mx-auto">
              <h3 className="font-semibold text-lg">Review Your Answers:</h3>
              {quizDetails?.questions.map((q: any, idx: number) => {
                const userAnswer = quizAnswers[q.id];
                const selectedOption = q.options?.find((opt: any) => opt.id === userAnswer);
                const correctOption = q.options?.find((opt: any) => opt.optionText === q.correctAnswer);
                const isCorrect = selectedOption?.optionText === q.correctAnswer;
                
                return (
                  <Card key={q.id} className={`p-4 ${isCorrect ? "border-green-500" : "border-red-500"}`}>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        {isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium">
                            {idx + 1}. {language === "ar" ? q.questionAr : q.question}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Your answer: <span className={isCorrect ? "text-green-600" : "text-red-600"}>{selectedOption?.optionText || "Not answered"}</span>
                          </p>
                          {!isCorrect && correctOption && (
                            <p className="text-sm text-green-600 mt-1">
                              Correct answer: {correctOption.optionText}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground mt-2 italic">
                            {language === "ar" ? q.explanationAr : q.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
            
            <div className="flex gap-4 justify-center">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedQuiz(null);
                  setQuizSubmitted(false);
                  setQuizResult(null);
                }}
              >
                Back to Quizzes
              </Button>
              <Button
                onClick={() => {
                  setQuizAnswers({});
                  setCurrentQuestion(0);
                  setQuizSubmitted(false);
                  setQuizResult(null);
                }}
              >
                Retake Quiz
              </Button>
            </div>
          </div>
        </Card>
      );
    }

    if (!quizDetails) {
      return <div className="text-center py-8">Loading quiz...</div>;
    }

    const currentQ = quizDetails.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / quizDetails.questions.length) * 100;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => {
              setSelectedQuiz(null);
              setQuizAnswers({});
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Quizzes
          </Button>
          <div className="text-sm text-muted-foreground">
            Question {currentQuestion + 1} of {quizDetails.questions.length}
          </div>
        </div>

        <div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="p-8">
          <h3 className="text-xl font-semibold mb-6">
            {language === "ar" ? currentQ.questionAr : currentQ.question}
          </h3>

          <div className="space-y-3">
            {currentQ.options.map((option: any) => (
              <button
                key={option.id}
                onClick={() => setQuizAnswers({ ...quizAnswers, [currentQ.id]: option.id })}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  quizAnswers[currentQ.id] === option.id
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {language === "ar" ? option.optionTextAr : option.optionText}
              </button>
            ))}
          </div>

          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {currentQuestion === quizDetails.questions.length - 1 ? (
              <Button
                onClick={handleSubmitQuiz}
                disabled={Object.keys(quizAnswers).length !== quizDetails.questions.length}
              >
                Submit Quiz
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentQuestion(currentQuestion + 1)}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Translator Training</h1>
        <p className="text-muted-foreground">
          Improve your translation skills with guidelines, best practices, and interactive quizzes
        </p>
      </div>

      <Tabs defaultValue="guidelines" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="guidelines">
            <BookOpen className="h-4 w-4 mr-2" />
            Guidelines
          </TabsTrigger>
          <TabsTrigger value="mistakes">
            <AlertCircle className="h-4 w-4 mr-2" />
            Common Mistakes
          </TabsTrigger>
          <TabsTrigger value="best-practices">
            <CheckCircle className="h-4 w-4 mr-2" />
            Best Practices
          </TabsTrigger>
          <TabsTrigger value="quizzes">
            <Trophy className="h-4 w-4 mr-2" />
            Quizzes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="guidelines" className="space-y-4">
          {renderMaterialBrowser("guidelines")}
        </TabsContent>

        <TabsContent value="mistakes" className="space-y-4">
          {renderMaterialBrowser("common_mistakes")}
        </TabsContent>

        <TabsContent value="best-practices" className="space-y-4">
          {renderMaterialBrowser("best_practices")}
        </TabsContent>

        <TabsContent value="quizzes" className="space-y-4">
          {renderQuizInterface()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
