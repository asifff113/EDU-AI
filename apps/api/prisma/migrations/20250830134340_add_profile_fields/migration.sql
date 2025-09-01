/*
  Warnings:

  - The values [ADMIN,INSTRUCTOR,STUDENT,QA_SOLVER,PARENT] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."Role_new" AS ENUM ('admin', 'teacher', 'student', 'qa_solver');
ALTER TABLE "public"."User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "public"."User" ALTER COLUMN "role" TYPE "public"."Role_new" USING ("role"::text::"public"."Role_new");
ALTER TYPE "public"."Role" RENAME TO "Role_old";
ALTER TYPE "public"."Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "public"."User" ALTER COLUMN "role" SET DEFAULT 'student';
COMMIT;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "coursesCompleted" INTEGER DEFAULT 0,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "experience" INTEGER,
ADD COLUMN     "expertise" TEXT[],
ADD COLUMN     "hourlyRate" DOUBLE PRECISION,
ADD COLUMN     "interests" TEXT[],
ADD COLUMN     "isProfilePublic" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "qualifications" TEXT[],
ADD COLUMN     "rating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "reviewCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "solvedQuestions" INTEGER DEFAULT 0,
ADD COLUMN     "studyLevel" TEXT,
ADD COLUMN     "subjects" TEXT[],
ALTER COLUMN "role" SET DEFAULT 'student';
