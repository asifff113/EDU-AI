'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle,
  XCircle,
  Clock,
  Target,
  Award,
  TrendingUp,
  BookOpen,
  RotateCcw,
  Home,
  Share2,
  Download,
  Eye,
  EyeOff,
} from 'lucide-react';
import { ExamResults } from './ExamTaking';

interface ExamResultsProps {
  results: ExamResults;
  onRetakeExam: () => void;
  onBackToHome: () => void;
}

export default function ExamResultsPage({ results, onRetakeExam, onBackToHome }: ExamResultsProps) {
  const [showAnswers, setShowAnswers] = useState(false);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-400';
    if (percentage >= 80) return 'text-blue-400';
    if (percentage >= 70) return 'text-yellow-400';
    if (percentage >= 60) return 'text-orange-400';
    return 'text-red-400';
  };

  const getPerformanceGradient = (percentage: number) => {
    if (percentage >= 90)
      return 'from-green-500/20 to-emerald-500/20 border-green-400/30 shadow-green-500/20';
    if (percentage >= 80)
      return 'from-blue-500/20 to-cyan-500/20 border-blue-400/30 shadow-blue-500/20';
    if (percentage >= 70)
      return 'from-yellow-500/20 to-amber-500/20 border-yellow-400/30 shadow-yellow-500/20';
    if (percentage >= 60)
      return 'from-orange-500/20 to-red-500/20 border-orange-400/30 shadow-orange-500/20';
    return 'from-red-500/20 to-pink-500/20 border-red-400/30 shadow-red-500/20';
  };

  const getGradeText = (percentage: number) => {
    if (percentage >= 95) return 'A+';
    if (percentage >= 90) return 'A';
    if (percentage >= 85) return 'A-';
    if (percentage >= 80) return 'B+';
    if (percentage >= 75) return 'B';
    if (percentage >= 70) return 'B-';
    if (percentage >= 65) return 'C+';
    if (percentage >= 60) return 'C';
    if (percentage >= 55) return 'C-';
    if (percentage >= 50) return 'D';
    return 'F';
  };

  const getDetailedFeedback = (percentage: number) => {
    if (percentage >= 95) return 'Outstanding performance! You have mastered this topic.';
    if (percentage >= 90) return 'Excellent work! You demonstrate strong understanding.';
    if (percentage >= 80) return 'Great job! You have a solid grasp of the material.';
    if (percentage >= 70) return 'Good work! You understand most concepts well.';
    if (percentage >= 60) return 'Fair performance. Consider reviewing key concepts.';
    return 'Needs improvement. Review the material and practice more.';
  };

  const selectedQuestion = results.questions[selectedQuestionIndex];
  const userAnswer = results.answers[selectedQuestion?.id];
  const isCorrect = userAnswer === selectedQuestion?.correctAnswer;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-6 py-12 max-w-6xl">
        {/* Header Section */}
        <div
          className={`relative group bg-gradient-to-br backdrop-blur-xl border rounded-3xl p-8 mb-8 shadow-2xl ${getPerformanceGradient(results.percentage)}`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl"></div>
          <div className="relative z-10 text-center">
            <div className="flex items-center justify-center mb-6">
              {results.passed ? (
                <div className="p-4 rounded-full bg-green-500/20 border border-green-400/30">
                  <CheckCircle className="h-16 w-16 text-green-400" />
                </div>
              ) : (
                <div className="p-4 rounded-full bg-red-500/20 border border-red-400/30">
                  <XCircle className="h-16 w-16 text-red-400" />
                </div>
              )}
            </div>

            <h1 className="text-4xl font-bold text-white mb-2">
              {results.passed ? 'Congratulations!' : 'Keep Learning!'}
            </h1>

            <p className="text-xl text-white/80 mb-6">
              You {results.passed ? 'passed' : 'completed'} the {results.examTitle}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {/* Score */}
              <div className="text-center">
                <div
                  className={`text-4xl font-bold ${getPerformanceColor(results.percentage)} mb-2`}
                >
                  {results.percentage}%
                </div>
                <p className="text-white/70 text-sm">Score</p>
              </div>

              {/* Grade */}
              <div className="text-center">
                <div
                  className={`text-4xl font-bold ${getPerformanceColor(results.percentage)} mb-2`}
                >
                  {getGradeText(results.percentage)}
                </div>
                <p className="text-white/70 text-sm">Grade</p>
              </div>

              {/* Correct Answers */}
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">
                  {results.correctAnswers}/{results.totalQuestions}
                </div>
                <p className="text-white/70 text-sm">Correct</p>
              </div>

              {/* Time Taken */}
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">{results.timeTaken}</div>
                <p className="text-white/70 text-sm">Time</p>
              </div>
            </div>

            <p className="text-white/80 mt-6 text-lg">{getDetailedFeedback(results.percentage)}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <Button
            onClick={onBackToHome}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg"
          >
            <Home className="h-4 w-4 mr-2" />
            Back to Exams
          </Button>

          <Button
            onClick={onRetakeExam}
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Retake Exam
          </Button>

          <Button
            onClick={() => setShowAnswers(!showAnswers)}
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            {showAnswers ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showAnswers ? 'Hide' : 'Show'} Answers
          </Button>

          <Button
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share Results
          </Button>
        </div>

        {/* Detailed Results */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-xl border-white/20">
            <TabsTrigger value="overview" className="text-white data-[state=active]:bg-white/20">
              Overview
            </TabsTrigger>
            <TabsTrigger value="performance" className="text-white data-[state=active]:bg-white/20">
              Performance
            </TabsTrigger>
            <TabsTrigger value="review" className="text-white data-[state=active]:bg-white/20">
              Review Questions
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Questions */}
              <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-white/70 flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Total Questions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{results.totalQuestions}</div>
                </CardContent>
              </Card>

              {/* Answered */}
              <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-white/70 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Answered
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-400">
                    {results.answeredQuestions}
                  </div>
                </CardContent>
              </Card>

              {/* Correct */}
              <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-white/70 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Correct
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-400">{results.correctAnswers}</div>
                </CardContent>
              </Card>

              {/* Accuracy */}
              <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-white/70 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Accuracy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${getPerformanceColor(results.percentage)}`}>
                    {results.percentage}%
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-xl border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Performance Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Overall Score Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/70">Overall Score</span>
                    <span className="text-white">{results.percentage}%</span>
                  </div>
                  <Progress value={results.percentage} className="h-3" />
                </div>

                {/* Accuracy Rate */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/70">Accuracy Rate</span>
                    <span className="text-white">
                      {Math.round((results.correctAnswers / results.answeredQuestions) * 100)}%
                    </span>
                  </div>
                  <Progress
                    value={(results.correctAnswers / results.answeredQuestions) * 100}
                    className="h-3"
                  />
                </div>

                {/* Completion Rate */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/70">Completion Rate</span>
                    <span className="text-white">
                      {Math.round((results.answeredQuestions / results.totalQuestions) * 100)}%
                    </span>
                  </div>
                  <Progress
                    value={(results.answeredQuestions / results.totalQuestions) * 100}
                    className="h-3"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Review Questions Tab */}
          <TabsContent value="review" className="space-y-6">
            {showAnswers && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Question Navigation */}
                <div className="lg:col-span-1">
                  <Card className="bg-white/10 backdrop-blur-xl border-white/20 sticky top-6">
                    <CardHeader>
                      <CardTitle className="text-white text-sm">Questions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-5 lg:grid-cols-1 gap-2">
                        {results.questions.map((question, index) => {
                          const userAnswer = results.answers[question.id];
                          const isCorrect = userAnswer === question.correctAnswer;
                          const isAnswered = userAnswer !== null && userAnswer !== undefined;

                          return (
                            <button
                              key={question.id}
                              onClick={() => setSelectedQuestionIndex(index)}
                              className={`p-2 rounded text-sm font-medium border transition-all duration-200 hover:scale-105 ${
                                index === selectedQuestionIndex
                                  ? 'bg-blue-500 text-white border-blue-400'
                                  : isAnswered
                                    ? isCorrect
                                      ? 'bg-green-500/20 text-green-200 border-green-400/30'
                                      : 'bg-red-500/20 text-red-200 border-red-400/30'
                                    : 'bg-gray-500/20 text-white border-gray-400/30'
                              }`}
                            >
                              {index + 1}
                            </button>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Question Detail */}
                <div className="lg:col-span-3">
                  {selectedQuestion && (
                    <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                      <CardHeader>
                        <div className="flex items-center justify-between mb-4">
                          <Badge className="bg-blue-500/20 text-blue-200 border-blue-400/30">
                            Question {selectedQuestionIndex + 1}
                          </Badge>
                          <div className="flex items-center gap-2">
                            {isCorrect ? (
                              <CheckCircle className="h-5 w-5 text-green-400" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-400" />
                            )}
                            <span
                              className={`font-medium ${isCorrect ? 'text-green-400' : 'text-red-400'}`}
                            >
                              {isCorrect ? 'Correct' : 'Incorrect'}
                            </span>
                          </div>
                        </div>
                        <CardTitle className="text-lg text-white leading-relaxed">
                          {selectedQuestion.question}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Answer Options */}
                        <div className="space-y-3">
                          {selectedQuestion.options.map((option, index) => {
                            const isUserAnswer = userAnswer === index;
                            const isCorrectAnswer = selectedQuestion.correctAnswer === index;
                            const optionLetter = String.fromCharCode(65 + index);

                            let optionClass = 'bg-white/5 border-white/20 text-white/90';

                            if (isCorrectAnswer) {
                              optionClass = 'bg-green-500/30 border-green-400 text-white';
                            } else if (isUserAnswer && !isCorrectAnswer) {
                              optionClass = 'bg-red-500/30 border-red-400 text-white';
                            }

                            return (
                              <div key={index} className={`p-4 rounded-xl border-2 ${optionClass}`}>
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                                      isCorrectAnswer
                                        ? 'bg-green-500 text-white'
                                        : isUserAnswer
                                          ? 'bg-red-500 text-white'
                                          : 'bg-white/20 text-white/70'
                                    }`}
                                  >
                                    {optionLetter}
                                  </div>
                                  <span className="text-lg">{option}</span>
                                  {isCorrectAnswer && (
                                    <CheckCircle className="h-5 w-5 text-green-400 ml-auto" />
                                  )}
                                  {isUserAnswer && !isCorrectAnswer && (
                                    <XCircle className="h-5 w-5 text-red-400 ml-auto" />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Explanation */}
                        {selectedQuestion.explanation && (
                          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-400/30">
                            <h4 className="font-semibold text-blue-200 mb-2">Explanation:</h4>
                            <p className="text-white/80 leading-relaxed">
                              {selectedQuestion.explanation}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {!showAnswers && (
              <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                <CardContent className="p-16 text-center">
                  <Eye className="h-16 w-16 mx-auto mb-6 text-white/40" />
                  <h3 className="text-2xl font-bold mb-4 text-white">Review Your Answers</h3>
                  <p className="text-white/70 mb-8 max-w-md mx-auto">
                    Click "Show Answers" to review all questions with correct answers and
                    explanations.
                  </p>
                  <Button
                    onClick={() => setShowAnswers(true)}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Show Answers
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
