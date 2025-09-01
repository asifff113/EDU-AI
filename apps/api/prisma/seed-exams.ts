import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedExams() {
  console.log('Seeding exams...');

  // Get existing users to assign as creators
  const users = await prisma.user.findMany();
  if (users.length === 0) {
    console.log('No users found. Please run the main seed first.');
    return;
  }

  const teacher = users.find((u) => u.role === 'teacher') || users[0];
  const admin = users.find((u) => u.role === 'admin') || users[0];

  // Create sample exams
  const exams = await Promise.all([
    prisma.exam.create({
      data: {
        title: 'Advanced Calculus Assessment',
        description:
          'Comprehensive test covering differential and integral calculus, limits, and series',
        category: 'mathematics',
        subject: 'Calculus',
        difficulty: 'hard',
        duration: 120,
        totalQuestions: 25,
        passingScore: 70,
        createdById: teacher.id,
        questions: {
          create: [
            {
              question: 'What is the derivative of x²?',
              type: 'mcq',
              options: ['2x', 'x', '2', 'x²'],
              correctAnswer: '2x',
              explanation: 'The derivative of x² is 2x using the power rule.',
              points: 2,
              order: 1,
              createdById: teacher.id,
            },
            {
              question: 'The limit of (sin x)/x as x approaches 0 is:',
              type: 'mcq',
              options: ['0', '1', '∞', 'undefined'],
              correctAnswer: '1',
              explanation: 'This is a standard limit that equals 1.',
              points: 3,
              order: 2,
              createdById: teacher.id,
            },
            {
              question: 'What is ∫x dx?',
              type: 'mcq',
              options: ['x²/2 + C', 'x²', 'x + C', '1'],
              correctAnswer: 'x²/2 + C',
              explanation:
                'The integral of x is x²/2 plus the constant of integration.',
              points: 2,
              order: 3,
              createdById: teacher.id,
            },
          ],
        },
      },
    }),

    prisma.exam.create({
      data: {
        title: 'JavaScript Fundamentals Quiz',
        description:
          'Test your knowledge of JavaScript basics, ES6 features, and DOM manipulation',
        category: 'programming',
        subject: 'JavaScript',
        difficulty: 'medium',
        duration: 60,
        totalQuestions: 20,
        passingScore: 75,
        createdById: admin.id,
        questions: {
          create: [
            {
              question:
                'Which of the following is used to declare a variable in JavaScript?',
              type: 'mcq',
              options: ['var', 'let', 'const', 'All of the above'],
              correctAnswer: 'All of the above',
              explanation:
                'var, let, and const can all be used to declare variables in JavaScript.',
              points: 1,
              order: 1,
              createdById: admin.id,
            },
            {
              question: 'What does === operator do in JavaScript?',
              type: 'mcq',
              options: [
                'Assignment',
                'Strict equality',
                'Loose equality',
                'Not equal',
              ],
              correctAnswer: 'Strict equality',
              explanation:
                '=== checks for strict equality (same value and type).',
              points: 2,
              order: 2,
              createdById: admin.id,
            },
            {
              question: 'Is JavaScript a statically typed language?',
              type: 'true_false',
              options: undefined,
              correctAnswer: 'false',
              explanation:
                'JavaScript is dynamically typed, not statically typed.',
              points: 1,
              order: 3,
              createdById: admin.id,
            },
          ],
        },
      },
    }),

    prisma.exam.create({
      data: {
        title: 'Basic Physics Concepts',
        description:
          'Fundamental physics concepts including mechanics, thermodynamics, and waves',
        category: 'science',
        subject: 'Physics',
        difficulty: 'easy',
        duration: 45,
        totalQuestions: 15,
        passingScore: 60,
        createdById: teacher.id,
        questions: {
          create: [
            {
              question: 'What is the unit of force?',
              type: 'mcq',
              options: ['Joule', 'Newton', 'Watt', 'Pascal'],
              correctAnswer: 'Newton',
              explanation: 'The SI unit of force is Newton (N).',
              points: 1,
              order: 1,
              createdById: teacher.id,
            },
            {
              question: 'The speed of light in vacuum is approximately:',
              type: 'mcq',
              options: [
                '3 × 10⁸ m/s',
                '3 × 10⁶ m/s',
                '3 × 10¹⁰ m/s',
                '3 × 10⁴ m/s',
              ],
              correctAnswer: '3 × 10⁸ m/s',
              explanation:
                'The speed of light in vacuum is approximately 3 × 10⁸ meters per second.',
              points: 2,
              order: 2,
              createdById: teacher.id,
            },
          ],
        },
      },
    }),

    prisma.exam.create({
      data: {
        title: 'English Grammar Mastery',
        description:
          'Comprehensive grammar test covering tenses, clauses, and sentence structure',
        category: 'language',
        subject: 'English',
        difficulty: 'medium',
        duration: 90,
        totalQuestions: 30,
        passingScore: 80,
        createdById: teacher.id,
        questions: {
          create: [
            {
              question: 'Which sentence is grammatically correct?',
              type: 'mcq',
              options: [
                "She don't like coffee",
                "She doesn't like coffee",
                'She not like coffee',
                'She no like coffee',
              ],
              correctAnswer: "She doesn't like coffee",
              explanation:
                'The correct form uses "doesn\'t" for third person singular.',
              points: 1,
              order: 1,
              createdById: teacher.id,
            },
            {
              question: 'What type of clause is "because it was raining"?',
              type: 'mcq',
              options: [
                'Independent clause',
                'Dependent clause',
                'Noun clause',
                'Relative clause',
              ],
              correctAnswer: 'Dependent clause',
              explanation:
                'This is a dependent clause because it cannot stand alone and starts with "because".',
              points: 2,
              order: 2,
              createdById: teacher.id,
            },
          ],
        },
      },
    }),
  ]);

  console.log(`Created ${exams.length} exams with questions`);

  // Create some sample exam attempts
  const student = users.find((u) => u.role === 'student') || users[0];

  if (student && exams.length > 0) {
    const attempts = await Promise.all([
      prisma.examAttempt.create({
        data: {
          examId: exams[1].id, // JavaScript exam
          userId: student.id,
          startTime: new Date('2024-01-20T10:00:00Z'),
          endTime: new Date('2024-01-20T11:30:00Z'),
          duration: 90,
          score: 17,
          totalScore: 20,
          percentage: 85,
          passed: true,
          status: 'completed',
          // answers will be created separately if needed
        },
      }),

      prisma.examAttempt.create({
        data: {
          examId: exams[0].id, // Calculus exam
          userId: student.id,
          startTime: new Date('2024-01-18T14:00:00Z'),
          endTime: new Date('2024-01-18T15:15:00Z'),
          duration: 75,
          score: 42,
          totalScore: 75,
          percentage: 56,
          passed: false,
          status: 'completed',
        },
      }),
    ]);

    console.log(`Created ${attempts.length} exam attempts`);
  }

  console.log('Exam seeding completed!');
}

seedExams()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
