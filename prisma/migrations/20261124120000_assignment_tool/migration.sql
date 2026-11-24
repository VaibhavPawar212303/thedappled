-- Split automation progress by tool: one assignment per learner, stage and tool.
-- Existing rows start as "playwright" (Manual testing as "none"); run
-- scripts/split-assignment-tools.ts afterwards to move Cypress progress to "cypress" rows.

-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN "tool" TEXT NOT NULL DEFAULT 'playwright';

UPDATE "Assignment" SET "tool" = 'none' WHERE "slug" = 'manual-testing';

-- DropIndex
DROP INDEX "Assignment_userId_slug_key";

-- CreateIndex
CREATE UNIQUE INDEX "Assignment_userId_slug_tool_key" ON "Assignment"("userId", "slug", "tool");
