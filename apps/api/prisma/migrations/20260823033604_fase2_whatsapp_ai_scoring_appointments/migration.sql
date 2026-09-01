-- CreateEnum
CREATE TYPE "ConversationChannel" AS ENUM ('WHATSAPP', 'WEB');

-- CreateEnum
CREATE TYPE "ConversationStatus" AS ENUM ('BOT', 'HUMAN');

-- CreateEnum
CREATE TYPE "MessageDirection" AS ENUM ('IN', 'OUT');

-- CreateEnum
CREATE TYPE "AiQualification" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "LeadActivityType" AS ENUM ('CONVERSATION_STARTED', 'PROPERTY_VIEWED', 'CONTACT_OFFERED', 'CONTACT_ACCEPTED', 'CONTACT_DECLINED', 'HANDOFF_TO_HUMAN', 'LEAD_CREATED', 'STAGE_CHANGED', 'APPOINTMENT_PROPOSED', 'APPOINTMENT_CONFIRMED', 'NOTE');

-- CreateEnum
CREATE TYPE "AppointmentType" AS ENUM ('VISIT', 'CALL');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('PROPOSED', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "score" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "scoreBreakdown" JSONB;

-- CreateTable
CREATE TABLE "ai_conversations" (
    "id" TEXT NOT NULL,
    "channel" "ConversationChannel" NOT NULL,
    "sessionKey" TEXT NOT NULL,
    "status" "ConversationStatus" NOT NULL DEFAULT 'BOT',
    "contactId" TEXT,
    "leadId" TEXT,
    "summary" TEXT,
    "suggestedPropertyIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "qualification" "AiQualification",
    "consentToContact" BOOLEAN NOT NULL DEFAULT false,
    "contactOfferMade" BOOLEAN NOT NULL DEFAULT false,
    "contactOfferDeclined" BOOLEAN NOT NULL DEFAULT false,
    "lowConfidenceStreak" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "direction" "MessageDirection" NOT NULL,
    "content" TEXT NOT NULL,
    "milestone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_conversations" (
    "id" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "aiConversationId" TEXT NOT NULL,
    "optInAt" TIMESTAMP(3),
    "lastInboundAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whatsapp_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_activities" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "type" "LeadActivityType" NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lead_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "agentId" TEXT,
    "type" "AppointmentType" NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'PROPOSED',
    "proposedAt" TIMESTAMP(3) NOT NULL,
    "confirmedAt" TIMESTAMP(3),
    "proposedBySystem" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ai_conversations_channel_sessionKey_idx" ON "ai_conversations"("channel", "sessionKey");

-- CreateIndex
CREATE INDEX "ai_messages_conversationId_createdAt_idx" ON "ai_messages"("conversationId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_conversations_phoneNumber_key" ON "whatsapp_conversations"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_conversations_aiConversationId_key" ON "whatsapp_conversations"("aiConversationId");

-- CreateIndex
CREATE INDEX "lead_activities_leadId_occurredAt_idx" ON "lead_activities"("leadId", "occurredAt");

-- CreateIndex
CREATE INDEX "appointments_leadId_idx" ON "appointments"("leadId");

-- AddForeignKey
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_messages" ADD CONSTRAINT "ai_messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "ai_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_conversations" ADD CONSTRAINT "whatsapp_conversations_aiConversationId_fkey" FOREIGN KEY ("aiConversationId") REFERENCES "ai_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_activities" ADD CONSTRAINT "lead_activities_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
