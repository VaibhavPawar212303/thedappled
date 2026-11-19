-- AlterTable
ALTER TABLE "AssignmentEvent" ADD COLUMN     "reason" TEXT,
ADD COLUMN     "signals" JSONB,
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false;
