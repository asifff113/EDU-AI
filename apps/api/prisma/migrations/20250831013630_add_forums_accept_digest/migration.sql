-- AlterTable
ALTER TABLE "public"."ForumPost" ADD COLUMN     "accepted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."ForumSubscription" ADD COLUMN     "emailDigest" BOOLEAN NOT NULL DEFAULT false;
