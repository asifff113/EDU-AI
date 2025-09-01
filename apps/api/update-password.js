const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function updatePassword() {
  try {
    // First, let's see what user exists with this email
    const existingUser = await prisma.user.findUnique({
      where: { email: 'howeverok45@gmail.com' },
    });

    console.log('Existing user:', existingUser);

    if (existingUser) {
      // Update the password
      const hashedPassword = await bcrypt.hash('password123', 10);
      const updatedUser = await prisma.user.update({
        where: { email: 'howeverok45@gmail.com' },
        data: { password: hashedPassword },
      });

      console.log('Password updated successfully for:', updatedUser.email);
    } else {
      // Create new user
      const hashedPassword = await bcrypt.hash('password123', 10);
      const newUser = await prisma.user.create({
        data: {
          email: 'howeverok45@gmail.com',
          username: 'howeverok45',
          firstName: 'Test',
          lastName: 'User',
          password: hashedPassword,
          role: 'student',
        },
      });

      console.log('New user created:', newUser.email);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updatePassword();
