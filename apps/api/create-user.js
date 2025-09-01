const { PrismaClient } = require('./generated/prisma');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createUser() {
  try {
    await prisma.$connect();
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Try to find existing user first
    const existingUser = await prisma.user.findUnique({
      where: { email: 'howeverok45@gmail.com' },
    });

    if (existingUser) {
      console.log('User already exists:', existingUser.email);
      return;
    }

    const user = await prisma.user.create({
      data: {
        email: 'howeverok45@gmail.com',
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        role: 'student',
      },
    });
    console.log('User created successfully:', user.email);
  } catch (error) {
    console.log('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createUser();
