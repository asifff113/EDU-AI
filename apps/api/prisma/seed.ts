import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const alice = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      email: 'alice@example.com',
      username: 'alice_admin',
      firstName: 'Alice',
      lastName: 'Johnson',
      password: await bcrypt.hash('password123', 10),
      role: 'admin',
      bio: 'Platform administrator with a passion for education technology.',
      location: 'Dhaka, Bangladesh',
      phone: '+8801234567890',
      isProfilePublic: false,
      rating: 5.0,
      reviewCount: 0,
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      email: 'bob@example.com',
      username: 'bob_student',
      firstName: 'Bob',
      lastName: 'Smith',
      password: await bcrypt.hash('password123', 10),
      role: 'student',
      bio: 'Computer Science student passionate about programming and AI.',
      location: 'Chittagong, Bangladesh',
      phone: '+8801234567891',
      studyLevel: 'university-3',
      interests: ['Programming', 'Mathematics', 'AI', 'Web Development'],
      coursesCompleted: 5,
      rating: 4.2,
      reviewCount: 8,
      isProfilePublic: true,
    },
  });

  const instructor = await prisma.user.upsert({
    where: { email: 'instructor@example.com' },
    update: {},
    create: {
      email: 'instructor@example.com',
      username: 'prof_jane',
      firstName: 'Jane',
      lastName: 'Doe',
      password: await bcrypt.hash('password123', 10),
      role: 'teacher',
      bio: 'Experienced mathematics teacher with 12+ years in education. Specializing in calculus and algebra.',
      location: 'Sylhet, Bangladesh',
      phone: '+8801234567892',
      subjects: ['Mathematics', 'Calculus', 'Algebra', 'Statistics'],
      hourlyRate: 1800,
      experience: 12,
      qualifications: [
        'PhD in Mathematics',
        'M.Ed in Education',
        'B.Sc in Mathematics',
      ],
      rating: 4.8,
      reviewCount: 45,
      isProfilePublic: true,
    },
  });

  const qaSolver = await prisma.user.upsert({
    where: { email: 'qa@example.com' },
    update: {},
    create: {
      email: 'qa@example.com',
      username: 'qa_expert',
      firstName: 'Rahman',
      lastName: 'Ahmed',
      password: await bcrypt.hash('password123', 10),
      role: 'qa_solver',
      bio: 'Expert problem solver specializing in programming and mathematics. Always ready to help!',
      location: 'Rajshahi, Bangladesh',
      phone: '+8801234567893',
      expertise: [
        'Programming',
        'Data Structures',
        'Algorithms',
        'Mathematics',
      ],
      solvedQuestions: 234,
      rating: 4.7,
      reviewCount: 89,
      isProfilePublic: true,
    },
  });

  // Additional students
  const student2 = await prisma.user.upsert({
    where: { email: 'sarah@example.com' },
    update: {},
    create: {
      email: 'sarah@example.com',
      username: 'sarah_student',
      firstName: 'Sarah',
      lastName: 'Khan',
      password: await bcrypt.hash('password123', 10),
      role: 'student',
      bio: 'Medical student interested in biology and chemistry.',
      location: 'Khulna, Bangladesh',
      studyLevel: 'university-2',
      interests: ['Biology', 'Chemistry', 'Medicine', 'Research'],
      coursesCompleted: 3,
      rating: 4.0,
      reviewCount: 5,
      isProfilePublic: true,
    },
  });

  // Additional teacher
  const teacher2 = await prisma.user.upsert({
    where: { email: 'physics@example.com' },
    update: {},
    create: {
      email: 'physics@example.com',
      username: 'prof_physics',
      firstName: 'Michael',
      lastName: 'Hassan',
      password: await bcrypt.hash('password123', 10),
      role: 'teacher',
      bio: 'Physics professor with expertise in quantum mechanics and thermodynamics.',
      location: 'Barisal, Bangladesh',
      subjects: ['Physics', 'Quantum Mechanics', 'Thermodynamics'],
      hourlyRate: 2000,
      experience: 8,
      qualifications: ['PhD in Physics', 'M.Sc in Theoretical Physics'],
      rating: 4.9,
      reviewCount: 32,
      isProfilePublic: true,
    },
  });

  // User with the requested email
  const user = await prisma.user.upsert({
    where: { email: 'howeverok45@gmail.com' },
    update: {},
    create: {
      email: 'howeverok45@gmail.com',
      username: 'howeverok45',
      firstName: 'User',
      lastName: 'Test',
      password: await bcrypt.hash('password123', 10),
      role: 'student',
      bio: 'Test user for the application.',
      location: 'Bangladesh',
      studyLevel: 'university-1',
      interests: ['Programming', 'AI', 'Technology'],
      coursesCompleted: 0,
      rating: 4.0,
      reviewCount: 0,
      isProfilePublic: true,
    },
  });

  const course = await prisma.course.upsert({
    where: { id: 'seed-course' },
    update: {},
    create: {
      id: 'seed-course',
      title: 'Intro to Edu AI',
      description: 'Getting started',
    },
  });
  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: bob.id, courseId: course.id } },
    update: {},
    create: { userId: bob.id, courseId: course.id },
  });

  // Seed certificate templates
  const completionTpl = await prisma.certificateTemplate.upsert({
    where: { id: 'tpl-completion' },
    update: {},
    create: {
      id: 'tpl-completion',
      name: 'Course Completion',
      description: 'Awarded upon completing a course',
      kind: 'completion',
      isPaid: false,
      bgUrl: '/uploads/certificates/completion-bg.png',
    },
  });
  const verifiedTpl = await prisma.certificateTemplate.upsert({
    where: { id: 'tpl-verified' },
    update: {},
    create: {
      id: 'tpl-verified',
      name: 'Verified Credential',
      description: 'Identity and skill verified',
      kind: 'verified',
      isPaid: true,
      price: 9.99,
      bgUrl: '/uploads/certificates/verified-bg.png',
    },
  });
  const chainTpl = await prisma.certificateTemplate.upsert({
    where: { id: 'tpl-chain' },
    update: {},
    create: {
      id: 'tpl-chain',
      name: 'Blockchain Record',
      description: 'Immutable on-chain proof of achievement',
      kind: 'blockchain',
      isPaid: true,
      price: 4.99,
      bgUrl: '/uploads/certificates/blockchain-bg.png',
    },
  });

  // Add many more templates with varied gating
  const extraTemplates = [
    {
      id: 'tpl-math-beginner',
      name: 'Math Fundamentals (Completion)',
      description: 'Finish Math 101 course',
      kind: 'completion',
      isPaid: false,
    },
    {
      id: 'tpl-math-exam',
      name: 'Math Aptitude (Exam)',
      description: 'Pass any Mathematics exam',
      kind: 'verified',
      isPaid: false,
      requiresExam: true,
      examCategory: 'mathematics',
      minPercentage: 60,
    },
    {
      id: 'tpl-english-exam',
      name: 'English Proficiency (Exam)',
      description: 'Pass English exam',
      kind: 'verified',
      isPaid: false,
      requiresExam: true,
      examCategory: 'language',
      minPercentage: 55,
    },
    {
      id: 'tpl-cs-exam-advanced',
      name: 'CS Advanced (Exam)',
      description: 'Pass CS exam >= 70%',
      kind: 'verified',
      isPaid: true,
      price: 3.99,
      requiresExam: true,
      examCategory: 'programming',
      minPercentage: 70,
    },
    {
      id: 'tpl-science-completion',
      name: 'Science Explorer',
      description: 'Completion certificate for Science track',
      kind: 'completion',
      isPaid: false,
    },
    {
      id: 'tpl-research-blockchain',
      name: 'Research Publication (Blockchain)',
      description: 'On-chain proof for research milestone',
      kind: 'blockchain',
      isPaid: true,
      price: 6.99,
    },
  ];
  for (const t of extraTemplates) {
    await prisma.certificateTemplate.upsert({
      where: { id: t.id },
      update: {},
      create: t as any,
    });
  }

  // Seed gamification ranks
  const ranks = [
    { name: 'Bronze', minXp: 0, order: 1, icon: '🥉' },
    { name: 'Silver', minXp: 300, order: 2, icon: '🥈' },
    { name: 'Gold', minXp: 900, order: 3, icon: '🥇' },
    { name: 'Platinum', minXp: 2000, order: 4, icon: '💎' },
    { name: 'Diamond', minXp: 4000, order: 5, icon: '🔷' },
  ];
  for (const r of ranks) {
    await prisma.rank.upsert({
      where: { name: r.name },
      update: { minXp: r.minXp, order: r.order, icon: r.icon },
      create: r,
    });
  }

  // Seed achievements
  const achievements = [
    {
      code: 'first_login',
      name: 'First Login',
      description: 'Logged in for the first time',
      icon: '🔑',
      xpReward: 50,
      pointsReward: 10,
    },
    {
      code: 'exam_ace',
      name: 'Exam Ace',
      description: 'Scored ≥ 85% on any exam',
      icon: '🎯',
      xpReward: 150,
      pointsReward: 50,
    },
    {
      code: 'study_streak_7',
      name: '7-Day Streak',
      description: 'Studied 7 days in a row',
      icon: '🔥',
      xpReward: 120,
      pointsReward: 30,
    },
    {
      code: 'helper',
      name: 'Helper',
      description: 'Posted a helpful answer',
      icon: '🙌',
      xpReward: 80,
      pointsReward: 20,
    },
  ];
  for (const a of achievements) {
    await prisma.achievement.upsert({
      where: { code: a.code },
      update: {
        name: a.name,
        description: a.description,
        icon: a.icon,
        xpReward: a.xpReward,
        pointsReward: a.pointsReward,
      },
      create: a,
    });
  }

  // Award some certificates to howeverok45 user for dashboard showcase
  await prisma.certificate.create({
    data: {
      userId: user.id,
      templateId: completionTpl.id,
      courseId: course.id,
      title: 'Intro to Edu AI — Completion',
      serial: 'EDU-SEED-0001',
      verificationCode: 'seed-verify-0001',
      metadata: { score: '92%', instructor: 'Jane Doe' },
    },
  });
  await prisma.certificate.create({
    data: {
      userId: user.id,
      templateId: verifiedTpl.id,
      title: 'Verified JavaScript Developer',
      serial: 'EDU-SEED-0002',
      verificationCode: 'seed-verify-0002',
      metadata: { level: 'Intermediate' },
    },
  });

  // Study groups
  const groups = [
    {
      id: 'seed-group-dsa',
      name: 'DSA Night Owls',
      description:
        'Daily data structures & algorithms practice and mock interviews.',
      isPublic: true,
      createdById: bob.id,
      members: [bob.id, alice.id, qaSolver.id],
    },
    {
      id: 'seed-group-quantum',
      name: 'Quantum Study Circle',
      description: 'Graduate-level quantum mechanics problem solving sessions.',
      isPublic: false,
      createdById: teacher2.id,
      members: [teacher2.id, instructor.id],
    },
    {
      id: 'seed-group-ielts',
      name: 'IELTS Speaking Practice',
      description: 'Fluency drills and topic cards. Pair up and practice!',
      isPublic: true,
      createdById: user.id,
      members: [user.id, student2.id],
    },
    {
      id: 'seed-group-calculus',
      name: 'Calculus Help Desk',
      description: 'Limits, derivatives, integrals, and series. Ask anything.',
      isPublic: true,
      createdById: instructor.id,
      members: [instructor.id, bob.id, alice.id],
    },
    {
      id: 'seed-group-organic-chem',
      name: 'Organic Chem Crash Group',
      description:
        'SN1/SN2, E1/E2, mechanisms, synthesis. Exam crunch sessions.',
      isPublic: false,
      createdById: student2.id,
      members: [student2.id, alice.id],
    },
  ];

  for (const g of groups) {
    const created = await prisma.studyGroup.upsert({
      where: { id: g.id },
      update: {},
      create: {
        id: g.id,
        name: g.name,
        description: g.description,
        isPublic: g.isPublic,
        createdById: g.createdById,
      },
    });
    // members
    for (const uid of g.members) {
      await prisma.groupMember.upsert({
        where: { groupId_userId: { groupId: created.id, userId: uid } },
        update: {},
        create: {
          groupId: created.id,
          userId: uid,
          role: uid === g.createdById ? 'admin' : 'member',
        },
      });
    }
  }

  // Seed a few example messages in DSA group
  await prisma.groupMessage.create({
    data: {
      groupId: 'seed-group-dsa',
      senderId: bob.id,
      content: 'Welcome to DSA Night Owls! Share daily problems here.',
      type: 'text',
    },
  });
  await prisma.groupMessage.create({
    data: {
      groupId: 'seed-group-dsa',
      senderId: qaSolver.id,
      content: 'Here is a great cheatsheet for common patterns.',
      type: 'pdf',
      fileUrl: '/uploads/groups/dsa-cheatsheet.pdf',
    },
  });
  // Seed a direct conversation between Bob and instructor
  const convo = await prisma.directConversation.create({
    data: {
      participants: { create: [{ userId: bob.id }, { userId: instructor.id }] },
      messages: {
        create: [
          { senderId: bob.id, content: 'Hello professor!', type: 'text' },
          {
            senderId: instructor.id,
            content: 'Hi Bob, how can I help?',
            type: 'text',
          },
        ],
      },
    },
  });
  console.log({
    alice,
    bob,
    instructor,
    qaSolver,
    student2,
    teacher2,
    user,
    course,
    directConvo: convo.id,
  });

  // Seed companies and jobs
  const companies = await prisma.$transaction([
    prisma.company.upsert({
      where: { id: 'comp-datahub' },
      update: {},
      create: {
        id: 'comp-datahub',
        name: 'DataHub Ltd',
        website: 'https://datahub.example',
        description: 'Analytics and BI firm',
      },
    }),
    prisma.company.upsert({
      where: { id: 'comp-cloudnine' },
      update: {},
      create: {
        id: 'comp-cloudnine',
        name: 'CloudNine',
        website: 'https://cloudnine.example',
        description: 'Cloud platform startup',
      },
    }),
    prisma.company.upsert({
      where: { id: 'comp-securify' },
      update: {},
      create: {
        id: 'comp-securify',
        name: 'Securify',
        website: 'https://securify.example',
        description: 'Cybersecurity services',
      },
    }),
  ]);
  await prisma.$transaction([
    prisma.job.create({
      data: {
        title: 'Data Analyst Intern',
        type: 'internship',
        location: 'Dhaka',
        remote: true,
        description: 'Assist BI team with dashboards.',
        requirements: 'SQL, Excel, basic Python',
        companyId: 'comp-datahub',
        salaryMin: 10000,
        salaryMax: 15000,
      },
    }),
    prisma.job.create({
      data: {
        title: 'Junior Data Scientist',
        type: 'full-time',
        location: 'Remote',
        remote: true,
        description: 'Work on ML models.',
        requirements: 'Python, Pandas, scikit-learn',
        companyId: 'comp-datahub',
        salaryMin: 60000,
        salaryMax: 90000,
      },
    }),
    prisma.job.create({
      data: {
        title: 'Cloud Engineer (Intern)',
        type: 'internship',
        location: 'Remote',
        remote: true,
        description: 'Support cloud ops.',
        requirements: 'Linux, Docker basics',
        companyId: 'comp-cloudnine',
        salaryMin: 12000,
        salaryMax: 18000,
      },
    }),
    prisma.job.create({
      data: {
        title: 'Cybersecurity Analyst',
        type: 'full-time',
        location: 'Dhaka',
        remote: false,
        description: 'Monitor and respond to security alerts.',
        requirements: 'SIEM, networking',
        companyId: 'comp-securify',
        salaryMin: 70000,
        salaryMax: 110000,
      },
    }),
  ]);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
