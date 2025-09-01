#!/usr/bin/env node
// Usage: node scripts/check_user_password.js <email> <password>
// This script connects to your DB using the project's environment and checks
// whether the given email exists and whether the password matches the stored bcrypt hash.

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const path = require('path');

async function main() {
  const [, , email, password] = process.argv;
  if (!email || !password) {
    console.error('Usage: node check_user_password.js <email> <password>');
    process.exit(2);
  }

  // Ensure we run with the project's env (node will inherit shell env if you run from project root)
  const prisma = new PrismaClient();

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log(`User not found: ${email}`);
      process.exit(0);
    }
    console.log(`Found user: id=${user.id} email=${user.email}`);
    const hash = user.password;
    if (!hash) {
      console.log('User has no password hash stored.');
      process.exit(0);
    }

    const valid = await bcrypt.compare(password, hash);
    if (valid) {
      console.log('Password is valid — login should succeed.');
      process.exit(0);
    } else {
      console.log('Password is INVALID — incorrect password.');
      console.log(`Stored hash: ${hash}`);
      process.exit(0);
    }
  } catch (err) {
    console.error('Error checking user:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
