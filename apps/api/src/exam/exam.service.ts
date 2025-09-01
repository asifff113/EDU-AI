import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExamService {
  constructor(private prisma: PrismaService) {}

  async getAllExams(filters?: {
    category?: string;
    subject?: string;
    difficulty?: string;
    search?: string;
  }) {
    const where: any = {
      isActive: true,
      isPublic: true,
    };

    if (filters?.category && filters.category !== 'all') {
      where.category = filters.category;
    }

    if (filters?.subject && filters.subject !== 'all') {
      where.subject = filters.subject;
    }

    if (filters?.difficulty && filters.difficulty !== 'all') {
      where.difficulty = filters.difficulty;
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { subject: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const exams = await this.prisma.exam.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
          },
        },
        _count: {
          select: {
            questions: true,
            attempts: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return exams.map((exam) => ({
      ...exam,
      createdByName: exam.createdBy.firstName
        ? `${exam.createdBy.firstName} ${exam.createdBy.lastName}`
        : exam.createdBy.username,
    }));
  }

  async getExamById(id: string, includeQuestions = false) {
    const exam = await this.prisma.exam.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
          },
        },
        questions: includeQuestions
          ? {
              orderBy: { order: 'asc' },
              select: {
                id: true,
                question: true,
                type: true,
                options: true,
                points: true,
                order: true,
                // Don't include correctAnswer and explanation for security
              },
            }
          : false,
        _count: {
          select: {
            questions: true,
            attempts: true,
          },
        },
      },
    });

    if (!exam) {
      throw new Error('Exam not found');
    }

    return {
      ...exam,
      createdByName: exam.createdBy.firstName
        ? `${exam.createdBy.firstName} ${exam.createdBy.lastName}`
        : exam.createdBy.username,
    };
  }

  async createExam(data: any, createdById: string) {
    const exam = await this.prisma.exam.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        subject: data.subject,
        difficulty: data.difficulty,
        duration: data.duration,
        totalQuestions: data.totalQuestions,
        passingScore: data.passingScore,
        isPublic: data.isPublic ?? true,
        createdById,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
          },
        },
      },
    });

    return {
      ...exam,
      createdByName: exam.createdBy.firstName
        ? `${exam.createdBy.firstName} ${exam.createdBy.lastName}`
        : exam.createdBy.username,
    };
  }

  async addQuestionsToExam(
    examId: string,
    questions: any[],
    createdById: string,
  ) {
    const exam = await this.prisma.exam.findUnique({
      where: { id: examId },
      include: { _count: { select: { questions: true } } },
    });

    if (!exam) {
      throw new Error('Exam not found');
    }

    if (exam.createdById !== createdById) {
      // Check if user is admin
      const user = await this.prisma.user.findUnique({
        where: { id: createdById },
      });
      if (user?.role !== 'admin') {
        throw new Error('Unauthorized to add questions to this exam');
      }
    }

    const questionsData = questions.map((q, index) => ({
      examId,
      question: q.question,
      type: q.type,
      options: q.options || null,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      points: q.points || 1,
      order: exam._count.questions + index + 1,
      createdById,
    }));

    const createdQuestions = await this.prisma.examQuestion.createMany({
      data: questionsData,
    });

    // Update exam total questions count
    await this.prisma.exam.update({
      where: { id: examId },
      data: {
        totalQuestions: exam._count.questions + questions.length,
      },
    });

    return createdQuestions;
  }

  async startExamAttempt(examId: string, userId: string) {
    const exam = await this.prisma.exam.findUnique({
      where: { id: examId },
      include: { questions: true },
    });

    if (!exam || !exam.isActive) {
      throw new Error('Exam not found or inactive');
    }

    // Check if user has an active attempt
    const activeAttempt = await this.prisma.examAttempt.findFirst({
      where: {
        examId,
        userId,
        status: 'in_progress',
      },
    });

    if (activeAttempt) {
      return activeAttempt;
    }

    const attempt = await this.prisma.examAttempt.create({
      data: {
        examId,
        userId,
        startTime: new Date(),
        totalScore: exam.questions.reduce((sum, q) => sum + q.points, 0),
      },
    });

    return attempt;
  }

  async submitAnswer(
    attemptId: string,
    questionId: string,
    answer: string,
    timeSpent?: number,
  ) {
    const attempt = await this.prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: { exam: true },
    });

    if (!attempt || attempt.status !== 'in_progress') {
      throw new Error('Invalid or completed exam attempt');
    }

    const question = await this.prisma.examQuestion.findUnique({
      where: { id: questionId },
    });

    if (!question || question.examId !== attempt.examId) {
      throw new Error('Invalid question for this exam');
    }

    const isCorrect =
      question.correctAnswer.toLowerCase() === answer.toLowerCase();
    const points = isCorrect ? question.points : 0;

    const examAnswer = await this.prisma.examAnswer.upsert({
      where: {
        attemptId_questionId: {
          attemptId,
          questionId,
        },
      },
      update: {
        answer,
        isCorrect,
        points,
        timeSpent,
      },
      create: {
        attemptId,
        questionId,
        answer,
        isCorrect,
        points,
        timeSpent,
      },
    });

    return examAnswer;
  }

  async finishExamAttempt(attemptId: string) {
    const attempt = await this.prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: true,
        answers: true,
      },
    });

    if (!attempt || attempt.status !== 'in_progress') {
      throw new Error('Invalid or already completed exam attempt');
    }

    const score = attempt.answers.reduce(
      (sum, answer) => sum + answer.points,
      0,
    );
    const percentage = (score / attempt.totalScore) * 100;
    const passed = percentage >= attempt.exam.passingScore;
    const duration = Math.round(
      (new Date().getTime() - attempt.startTime.getTime()) / (1000 * 60),
    );

    const updatedAttempt = await this.prisma.examAttempt.update({
      where: { id: attemptId },
      data: {
        endTime: new Date(),
        duration,
        score,
        percentage,
        passed,
        status: 'completed',
      },
      include: {
        exam: true,
        answers: {
          include: {
            question: {
              select: {
                id: true,
                question: true,
                correctAnswer: true,
                explanation: true,
                points: true,
              },
            },
          },
        },
      },
    });

    // Scholarship micro-awards based on performance
    try {
      const attemptFull = await this.prisma.examAttempt.findUnique({
        where: { id: attemptId },
        include: { user: true, exam: true },
      });
      const userId = attemptFull?.userId as string;
      if (userId) {
        const basePoints = Math.round(percentage);
        // Record earn event
        const db: any = this.prisma as any;
        await db.earnEvent.create({
          data: {
            userId,
            type: passed ? 'exam_pass' : 'exam_complete',
            points: basePoints,
            data: { examId: attemptFull?.examId, percentage, score },
          },
        });
        // Trigger achievement for high score
        if (passed && percentage >= 85) {
          try {
            // Soft-call to GamificationController via direct Prisma writes
            const ach = await db.achievement.findUnique({
              where: { code: 'exam_ace' },
            });
            if (ach) {
              await db.userAchievement.upsert({
                where: {
                  userId_achievementId: { userId, achievementId: ach.id },
                },
                update: {},
                create: { userId, achievementId: ach.id },
              });
            }
          } catch {}
        }
        // Award merit scholarship if high score
        if (
          passed &&
          percentage >= (attemptFull?.exam?.passingScore ?? 60) + 20
        ) {
          await db.scholarship.create({
            data: {
              userId,
              kind: 'merit',
              points: 100,
              amount: 0,
              benefitType: 'subscription',
              benefitValue: 'month_free',
              reason: `High score in ${attemptFull?.exam?.title ?? 'exam'}`,
              metadata: { attemptId },
            },
          });
        }
      }
    } catch {}

    return updatedAttempt;
  }

  async getUserExamHistory(userId: string) {
    const attempts = await this.prisma.examAttempt.findMany({
      where: {
        userId,
        status: 'completed',
      },
      include: {
        exam: {
          select: {
            id: true,
            title: true,
            category: true,
            subject: true,
            difficulty: true,
            duration: true,
            passingScore: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return attempts;
  }

  async getUserStats(userId: string) {
    const stats = await this.prisma.examAttempt.groupBy({
      by: ['passed'],
      where: {
        userId,
        status: 'completed',
      },
      _count: {
        id: true,
      },
      _avg: {
        percentage: true,
      },
    });

    const totalAttempts = stats.reduce((sum, stat) => sum + stat._count.id, 0);
    const passedAttempts = stats.find((stat) => stat.passed)?._count.id || 0;
    const averageScore =
      stats.reduce((sum, stat) => sum + (stat._avg.percentage || 0), 0) /
        stats.length || 0;

    const categoryStats = await this.prisma.examAttempt.groupBy({
      by: ['examId'],
      where: {
        userId,
        status: 'completed',
      },
      _count: {
        id: true,
      },
      _avg: {
        percentage: true,
      },
    });

    return {
      totalAttempts,
      passedAttempts,
      failedAttempts: totalAttempts - passedAttempts,
      successRate:
        totalAttempts > 0 ? (passedAttempts / totalAttempts) * 100 : 0,
      averageScore,
      totalExamsTaken: new Set(categoryStats.map((stat) => stat.examId)).size,
    };
  }

  async generateAIQuestions(
    topic: string,
    difficulty: string,
    count: number,
    questionType: string,
  ) {
    try {
      // Create a comprehensive prompt for the AI
      const difficultyDescriptions = {
        easy: 'basic, introductory level',
        medium: 'intermediate level with some complexity',
        hard: 'advanced level requiring deep understanding',
      };

      const prompt = `Generate ${count} ${difficulty} (${difficultyDescriptions[difficulty as keyof typeof difficultyDescriptions]}) ${questionType === 'mcq' ? 'multiple choice questions with 4 options' : questionType === 'true_false' ? 'true/false questions' : 'short answer questions'} about ${topic}. 

For each question, provide:
1. A clear, well-formed question
2. ${questionType === 'mcq' ? 'Four distinct options (A, B, C, D)' : questionType === 'true_false' ? 'True or false answer' : 'Expected answer'}
3. The correct answer
4. A brief explanation of why the answer is correct

Format the response as JSON array with objects containing: question, type, options (array for MCQ, null for others), correctAnswer, explanation, points (1-3 based on difficulty).`;

      // For now, return enhanced mock data that looks more realistic
      const topicQuestions = this.generateTopicSpecificQuestions(
        topic,
        difficulty,
        count,
        questionType,
      );
      return topicQuestions;
    } catch (error) {
      console.error('Error generating AI questions:', error);
      // Fallback to basic mock questions
      return this.generateFallbackQuestions(
        topic,
        difficulty,
        count,
        questionType,
      );
    }
  }

  private generateTopicSpecificQuestions(
    topic: string,
    difficulty: string,
    count: number,
    questionType: string,
  ) {
    const questions = [];
    const difficultyPoints = { easy: 1, medium: 2, hard: 3 };

    for (let i = 0; i < count; i++) {
      const questionData = this.createTopicQuestion(
        topic,
        difficulty,
        questionType,
        i + 1,
      );
      questions.push({
        ...questionData,
        points:
          difficultyPoints[difficulty as keyof typeof difficultyPoints] || 1,
      });
    }

    return questions;
  }

  private createTopicQuestion(
    topic: string,
    difficulty: string,
    questionType: string,
    index: number,
  ) {
    const topicLower = topic.toLowerCase();

    // JavaScript questions
    if (topicLower.includes('javascript') || topicLower.includes('js')) {
      return this.generateJavaScriptQuestion(difficulty, questionType, index);
    }

    // Mathematics questions
    if (
      topicLower.includes('math') ||
      topicLower.includes('calculus') ||
      topicLower.includes('algebra')
    ) {
      return this.generateMathQuestion(difficulty, questionType, index);
    }

    // Physics questions
    if (topicLower.includes('physics')) {
      return this.generatePhysicsQuestion(difficulty, questionType, index);
    }

    // Default generic questions
    return this.generateGenericQuestion(topic, difficulty, questionType, index);
  }

  private generateJavaScriptQuestion(
    difficulty: string,
    questionType: string,
    index: number,
  ) {
    const jsQuestions = {
      easy: [
        {
          question:
            'Which keyword is used to declare a variable in JavaScript?',
          mcqOptions: ['var', 'let', 'const', 'All of the above'],
          correctAnswer: questionType === 'mcq' ? 'All of the above' : 'true',
          explanation:
            'JavaScript supports var, let, and const for variable declarations.',
        },
        {
          question: 'What does the === operator do in JavaScript?',
          mcqOptions: [
            'Assignment',
            'Strict equality comparison',
            'Loose equality',
            'Not equal',
          ],
          correctAnswer:
            questionType === 'mcq' ? 'Strict equality comparison' : 'true',
          explanation:
            'The === operator performs strict equality comparison without type coercion.',
        },
      ],
      medium: [
        {
          question: 'What is the output of: console.log(typeof null)?',
          mcqOptions: ['null', 'undefined', 'object', 'boolean'],
          correctAnswer: questionType === 'mcq' ? 'object' : 'object',
          explanation:
            'In JavaScript, typeof null returns "object" due to a historical bug.',
        },
        {
          question:
            'Which method is used to add an element to the end of an array?',
          mcqOptions: ['push()', 'pop()', 'shift()', 'unshift()'],
          correctAnswer: questionType === 'mcq' ? 'push()' : 'push',
          explanation:
            'The push() method adds one or more elements to the end of an array.',
        },
      ],
      hard: [
        {
          question: 'What is a closure in JavaScript?',
          mcqOptions: [
            'A function that has access to variables in its outer scope',
            'A method to close browser windows',
            'A way to hide variables',
            'A type of loop',
          ],
          correctAnswer:
            questionType === 'mcq'
              ? 'A function that has access to variables in its outer scope'
              : 'true',
          explanation:
            'A closure is a function that retains access to variables from its outer/enclosing scope even after the outer function has returned.',
        },
      ],
    };

    const questionSet =
      jsQuestions[difficulty as keyof typeof jsQuestions] || jsQuestions.easy;
    const q = questionSet[index % questionSet.length];

    return {
      question: q.question,
      type: questionType,
      options: questionType === 'mcq' ? q.mcqOptions : undefined,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
    };
  }

  private generateMathQuestion(
    difficulty: string,
    questionType: string,
    index: number,
  ) {
    const mathQuestions = {
      easy: [
        {
          question: 'What is the derivative of x²?',
          mcqOptions: ['2x', 'x²', '2', 'x'],
          correctAnswer: questionType === 'mcq' ? '2x' : '2x',
          explanation: 'Using the power rule: d/dx(x²) = 2x¹ = 2x',
        },
        {
          question: 'What is 5! (5 factorial)?',
          mcqOptions: ['120', '25', '15', '100'],
          correctAnswer: questionType === 'mcq' ? '120' : '120',
          explanation: '5! = 5 × 4 × 3 × 2 × 1 = 120',
        },
      ],
      medium: [
        {
          question: 'What is the integral of 2x?',
          mcqOptions: ['x² + C', '2x² + C', 'x²', '2'],
          correctAnswer: questionType === 'mcq' ? 'x² + C' : 'x² + C',
          explanation:
            '∫2x dx = x² + C, where C is the constant of integration',
        },
      ],
      hard: [
        {
          question: 'What is the limit of (sin x)/x as x approaches 0?',
          mcqOptions: ['0', '1', '∞', 'undefined'],
          correctAnswer: questionType === 'mcq' ? '1' : '1',
          explanation: 'This is a fundamental limit: lim(x→0) (sin x)/x = 1',
        },
      ],
    };

    const questionSet =
      mathQuestions[difficulty as keyof typeof mathQuestions] ||
      mathQuestions.easy;
    const q = questionSet[index % questionSet.length];

    return {
      question: q.question,
      type: questionType,
      options: questionType === 'mcq' ? q.mcqOptions : undefined,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
    };
  }

  private generatePhysicsQuestion(
    difficulty: string,
    questionType: string,
    index: number,
  ) {
    const physicsQuestions = {
      easy: [
        {
          question: 'What is the unit of force?',
          mcqOptions: ['Newton', 'Joule', 'Watt', 'Pascal'],
          correctAnswer: questionType === 'mcq' ? 'Newton' : 'Newton',
          explanation:
            'The SI unit of force is Newton (N), named after Sir Isaac Newton.',
        },
      ],
      medium: [
        {
          question: 'What is the acceleration due to gravity on Earth?',
          mcqOptions: ['9.8 m/s²', '9.8 m/s', '10 m/s²', '8.9 m/s²'],
          correctAnswer: questionType === 'mcq' ? '9.8 m/s²' : '9.8 m/s²',
          explanation:
            'The standard acceleration due to gravity on Earth is approximately 9.8 m/s².',
        },
      ],
      hard: [
        {
          question: 'What is the speed of light in vacuum?',
          mcqOptions: [
            '3 × 10⁸ m/s',
            '3 × 10⁶ m/s',
            '3 × 10¹⁰ m/s',
            '3 × 10⁴ m/s',
          ],
          correctAnswer: questionType === 'mcq' ? '3 × 10⁸ m/s' : '3 × 10⁸ m/s',
          explanation:
            'The speed of light in vacuum is exactly 299,792,458 m/s, approximately 3 × 10⁸ m/s.',
        },
      ],
    };

    const questionSet =
      physicsQuestions[difficulty as keyof typeof physicsQuestions] ||
      physicsQuestions.easy;
    const q = questionSet[index % questionSet.length];

    return {
      question: q.question,
      type: questionType,
      options: questionType === 'mcq' ? q.mcqOptions : undefined,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
    };
  }

  private generateGenericQuestion(
    topic: string,
    difficulty: string,
    questionType: string,
    index: number,
  ) {
    return {
      question: `What is a key concept in ${topic}? (Question ${index})`,
      type: questionType,
      options:
        questionType === 'mcq'
          ? [
              `Basic concept of ${topic}`,
              `Advanced principle in ${topic}`,
              `Common misconception about ${topic}`,
              `All of the above`,
            ]
          : undefined,
      correctAnswer: questionType === 'mcq' ? 'All of the above' : 'true',
      explanation: `This question tests understanding of fundamental concepts in ${topic}.`,
    };
  }

  private generateFallbackQuestions(
    topic: string,
    difficulty: string,
    count: number,
    questionType: string,
  ) {
    const mockQuestions = Array.from({ length: count }, (_, index) => ({
      question: `Sample question ${index + 1} about ${topic}`,
      type: questionType,
      options:
        questionType === 'mcq'
          ? ['Option A', 'Option B', 'Option C', 'Option D']
          : undefined,
      correctAnswer: questionType === 'mcq' ? 'Option A' : 'true',
      explanation: `This is a sample explanation for question ${index + 1} about ${topic}.`,
      points: 1,
    }));

    return mockQuestions;
  }

  async getExamCategories() {
    const categories = await this.prisma.exam.groupBy({
      by: ['category'],
      where: {
        isActive: true,
        isPublic: true,
      },
      _count: {
        category: true,
      },
    });

    return categories.map((cat) => ({
      name: cat.category,
      count: cat._count.category,
    }));
  }

  async getExamSubjects(category?: string) {
    const where: any = {
      isActive: true,
      isPublic: true,
    };

    if (category && category !== 'all') {
      where.category = category;
    }

    const subjects = await this.prisma.exam.groupBy({
      by: ['subject'],
      where,
      _count: {
        subject: true,
      },
    });

    return subjects.map((sub) => ({
      name: sub.subject,
      count: sub._count.subject,
    }));
  }
}
