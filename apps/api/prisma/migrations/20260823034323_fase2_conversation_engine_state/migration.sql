-- AlterTable
ALTER TABLE "ai_conversations" ADD COLUMN     "awaitingContactChoice" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastDiscussedPropertySlug" TEXT,
ADD COLUMN     "lastSearchResults" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "propertyInterestCounts" JSONB NOT NULL DEFAULT '{}';
