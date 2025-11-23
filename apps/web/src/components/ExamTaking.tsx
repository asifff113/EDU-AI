'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Flag,
  Timer,
  BookOpen,
  Target,
  Award,
  RotateCcw,
} from 'lucide-react';

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface ExamData {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  totalQuestions: number;
  passingScore: number;
  questions: Question[];
}

interface ExamTakingProps {
  exam: ExamData;
  onExit: () => void;
  onComplete: (results: ExamResults) => void;
}

export interface ExamResults {
  examId: string;
  examTitle: string;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  score: number;
  percentage: number;
  passed: boolean;
  timeSpent: number;
  timeTaken: string;
  answers: { [questionId: string]: number | null };
  questions: Question[];
}

export default function ExamTaking({ exam, onExit, onComplete }: ExamTakingProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: string]: number | null }>({});
  const [timeLeft, setTimeLeft] = useState(exam.duration * 60); // Convert to seconds
  const [startTime] = useState(Date.now());
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());

  const currentQuestion = exam.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / exam.totalQuestions) * 100;
  const answeredCount = Object.values(answers).filter((answer) => answer !== null).length;

  // Timer effect
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmitExam();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Format time display
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    const percentage = (timeLeft / (exam.duration * 60)) * 100;
    if (percentage <= 10) return 'text-red-500';
    if (percentage <= 25) return 'text-orange-500';
    return 'text-white';
  };

  const handleAnswerSelect = (optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionIndex,
    }));
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < exam.totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handleQuestionJump = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const toggleFlag = () => {
    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestion.id)) {
        newSet.delete(currentQuestion.id);
      } else {
        newSet.add(currentQuestion.id);
      }
      return newSet;
    });
  };

  const handleSubmitExam = useCallback(() => {
    const timeSpent = Date.now() - startTime;
    const correctAnswers = exam.questions.reduce((count, question) => {
      const userAnswer = answers[question.id];
      return userAnswer === question.correctAnswer ? count + 1 : count;
    }, 0);

    const score = Math.round((correctAnswers / exam.totalQuestions) * 100);
    const passed = score >= exam.passingScore;

    const results: ExamResults = {
      examId: exam.id,
      examTitle: exam.title,
      totalQuestions: exam.totalQuestions,
      answeredQuestions: answeredCount,
      correctAnswers,
      score: correctAnswers,
      percentage: score,
      passed,
      timeSpent,
      timeTaken: formatTime(Math.floor(timeSpent / 1000)),
      answers,
      questions: exam.questions,
    };

    onComplete(results);
  }, [exam, answers, answeredCount, startTime, onComplete]);

  const getQuestionStatus = (index: number) => {
    const question = exam.questions[index];
    const isAnswered = answers[question.id] !== null && answers[question.id] !== undefined;
    const isFlagged = flaggedQuestions.has(question.id);
    const isCurrent = index === currentQuestionIndex;

    if (isCurrent) return 'current';
    if (isFlagged) return 'flagged';
    if (isAnswered) return 'answered';
    return 'unanswered';
  };

  const getQuestionStatusColor = (status: string) => {
    switch (status) {
      case 'current':
        return 'bg-blue-500 text-white border-blue-400';
      case 'answered':
        return 'bg-green-500 text-white border-green-400';
      case 'flagged':
        return 'bg-yellow-500 text-white border-yellow-400';
      default:
        return 'bg-gray-500/20 text-white border-gray-400/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 bg-black/50 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Exam Info */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowExitDialog(true)}
                className="text-white hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Exit
              </Button>
              <div>
                <h1 className="text-lg font-bold text-white">{exam.title}</h1>
                <p className="text-sm text-white/70">
                  Question {currentQuestionIndex + 1} of {exam.totalQuestions}
                </p>
              </div>
            </div>

            {/* Timer and Progress */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Timer className={`h-5 w-5 ${getTimeColor()}`} />
                <span className={`text-xl font-mono font-bold ${getTimeColor()}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              <div className="w-32">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-white/70 mt-1">{Math.round(progress)}% Complete</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Question Navigation Sidebar */}
        <div className="lg:col-span-1">
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 sticky top-32">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Questions
              </CardTitle>
              <div className="flex items-center gap-4 text-sm text-white/70">
                <span>Answered: {answeredCount}</span>
                <span>Flagged: {flaggedQuestions.size}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2">
                {exam.questions.map((_, index) => {
                  const status = getQuestionStatus(index);
                  return (
                    <button
                      key={index}
                      onClick={() => handleQuestionJump(index)}
                      className={`w-8 h-8 rounded text-xs font-medium border transition-all duration-200 hover:scale-110 ${getQuestionStatusColor(status)}`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-blue-500"></div>
                  <span className="text-white/70">Current</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-green-500"></div>
                  <span className="text-white/70">Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-yellow-500"></div>
                  <span className="text-white/70">Flagged</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-gray-500/20 border border-gray-400/30"></div>
                  <span className="text-white/70">Unanswered</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Question Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Question Card */}
          <Card className="bg-white/10 backdrop-blur-xl border-white/20">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Badge className="bg-blue-500/20 text-blue-200 border-blue-400/30">
                    Question {currentQuestionIndex + 1}
                  </Badge>
                  <Badge
                    className={`${currentQuestion.difficulty === 'easy' ? 'bg-green-500/20 text-green-200 border-green-400/30' : currentQuestion.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-200 border-yellow-400/30' : 'bg-red-500/20 text-red-200 border-red-400/30'}`}
                  >
                    {currentQuestion.difficulty.toUpperCase()}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFlag}
                  className={`${flaggedQuestions.has(currentQuestion.id) ? 'text-yellow-400 bg-yellow-500/20' : 'text-white/70 hover:text-yellow-400'}`}
                >
                  <Flag className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle className="text-xl text-white leading-relaxed">
                {currentQuestion.question}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Answer Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = answers[currentQuestion.id] === index;
                  const optionLetter = String.fromCharCode(65 + index); // A, B, C, D

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-300 hover:scale-[1.02] ${
                        isSelected
                          ? 'bg-blue-500/30 border-blue-400 text-white shadow-lg shadow-blue-500/20'
                          : 'bg-white/5 border-white/20 text-white/90 hover:bg-white/10 hover:border-white/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            isSelected ? 'bg-blue-500 text-white' : 'bg-white/20 text-white/70'
                          }`}
                        >
                          {optionLetter}
                        </div>
                        <span className="text-lg">{option}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex items-center gap-4">
              {currentQuestionIndex === exam.totalQuestions - 1 ? (
                <Button
                  onClick={handleSubmitExam}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg shadow-green-500/25"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Submit Exam
                </Button>
              ) : (
                <Button
                  onClick={handleNextQuestion}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-white/5 backdrop-blur-xl border-white/10">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{answeredCount}</div>
                <p className="text-xs text-white/70">Answered</p>
              </CardContent>
            </Card>
            <Card className="bg-white/5 backdrop-blur-xl border-white/10">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">{flaggedQuestions.size}</div>
                <p className="text-xs text-white/70">Flagged</p>
              </CardContent>
            </Card>
            <Card className="bg-white/5 backdrop-blur-xl border-white/10">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-400">
                  {exam.totalQuestions - answeredCount}
                </div>
                <p className="text-xs text-white/70">Remaining</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Exit Confirmation Dialog */}
      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <DialogContent className="bg-slate-900/95 backdrop-blur-xl border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              Exit Exam?
            </DialogTitle>
            <DialogDescription className="text-white/70">
              Are you sure you want to exit this exam? Your progress will be lost and you'll need to
              start over.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowExitDialog(false)}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Cancel
            </Button>
            <Button onClick={onExit} className="bg-red-500 hover:bg-red-600 text-white">
              Exit Exam
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
