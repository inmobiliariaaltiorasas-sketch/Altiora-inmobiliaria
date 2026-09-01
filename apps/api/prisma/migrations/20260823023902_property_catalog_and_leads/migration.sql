-- CreateEnum
CREATE TYPE "PropertyPublicationStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'PAUSED', 'SOLD', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "OperationType" AS ENUM ('SALE', 'RENT');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('COP', 'USD');

-- CreateEnum
CREATE TYPE "PropertyMediaType" AS ENUM ('PHOTO', 'VIDEO', 'TOUR', 'FLOORPLAN');

-- CreateEnum
CREATE TYPE "PropertyDocumentType" AS ENUM ('LEGAL', 'CERTIFICATE', 'ADMINISTRATIVE', 'OTHER');

-- CreateEnum
CREATE TYPE "PreferredChannel" AS ENUM ('WHATSAPP', 'PHONE', 'EMAIL');

-- CreateEnum
CREATE TYPE "LeadSourceChannel" AS ENUM ('ORGANIC', 'GOOGLE', 'GOOGLE_ADS', 'FACEBOOK', 'INSTAGRAM', 'META_ADS', 'TIKTOK', 'WHATSAPP', 'DIRECT', 'REFERRAL', 'WEBSITE', 'AI_AGENT', 'OTHER');

-- CreateEnum
CREATE TYPE "LeadFunnelStage" AS ENUM ('VISITOR', 'ENGAGED', 'CONTACT', 'LEAD', 'QUALIFIED', 'APPOINTMENT', 'VISIT', 'NEGOTIATION', 'OFFER', 'WON', 'LOST');

-- CreateEnum
CREATE TYPE "LeadLostReason" AS ENUM ('BUDGET', 'NO_RESPONSE', 'CHOSE_ANOTHER_PROPERTY', 'FINANCING', 'NOT_THE_RIGHT_TIME', 'PROPERTY_SOLD', 'OTHER');

-- CreateEnum
CREATE TYPE "InquiryType" AS ENUM ('GENERAL_INFO', 'WHATSAPP_CONTACT', 'ADVISOR_REQUEST', 'VISIT_REQUEST');

-- CreateEnum
CREATE TYPE "InterestLevel" AS ENUM ('HIGH', 'MEDIUM', 'DISCARDED');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'PUBLISH', 'PAUSE', 'MARK_SOLD', 'ARCHIVE', 'DELETE');

-- CreateTable
CREATE TABLE "cities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'Colombia',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "neighborhoods" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "neighborhoods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_features" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_features_on_properties" (
    "propertyId" TEXT NOT NULL,
    "featureId" TEXT NOT NULL,

    CONSTRAINT "property_features_on_properties_pkey" PRIMARY KEY ("propertyId","featureId")
);

-- CreateTable
CREATE TABLE "properties" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "operationType" "OperationType" NOT NULL,
    "price" DECIMAL(14,2) NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'COP',
    "bedrooms" INTEGER NOT NULL,
    "bathrooms" INTEGER NOT NULL,
    "parkingSpots" INTEGER NOT NULL DEFAULT 0,
    "builtAreaM2" DECIMAL(10,2) NOT NULL,
    "landAreaM2" DECIMAL(10,2),
    "yearBuilt" INTEGER,
    "addressLine" TEXT,
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "status" "PropertyPublicationStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "cityId" TEXT NOT NULL,
    "neighborhoodId" TEXT,
    "propertyTypeId" TEXT NOT NULL,
    "agentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_translations" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "shortDescription" TEXT NOT NULL,
    "fullDescription" TEXT NOT NULL,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "seoCanonicalOverride" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_media" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "type" "PropertyMediaType" NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_documents" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "type" "PropertyDocumentType" NOT NULL,
    "fileName" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "whatsapp" TEXT,
    "email" TEXT,
    "preferredChannel" "PreferredChannel" NOT NULL,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "source" "LeadSourceChannel" NOT NULL,
    "funnelStage" "LeadFunnelStage" NOT NULL DEFAULT 'LEAD',
    "budget" DECIMAL(14,2),
    "cityInterestId" TEXT,
    "propertyTypeInterestId" TEXT,
    "assignedAgentId" TEXT,
    "notes" TEXT,
    "lostReason" "LeadLostReason",
    "lostAt" TIMESTAMP(3),
    "firstTouchId" TEXT,
    "lastTouchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_inquiries" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "inquiryType" "InquiryType" NOT NULL,
    "interestLevel" "InterestLevel" NOT NULL DEFAULT 'MEDIUM',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_inquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketing_touches" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmContent" TEXT,
    "utmTerm" TEXT,
    "gclid" TEXT,
    "fbclid" TEXT,
    "referrer" TEXT,
    "landingPage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "marketing_touches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_events" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "propertyId" TEXT,
    "leadId" TEXT,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "diff" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cities_slug_key" ON "cities"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "neighborhoods_cityId_slug_key" ON "neighborhoods"("cityId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "property_types_slug_key" ON "property_types"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "property_features_slug_key" ON "property_features"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "properties_slug_key" ON "properties"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "property_translations_propertyId_locale_key" ON "property_translations"("propertyId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "leads_contactId_key" ON "leads"("contactId");

-- CreateIndex
CREATE UNIQUE INDEX "leads_firstTouchId_key" ON "leads"("firstTouchId");

-- CreateIndex
CREATE UNIQUE INDEX "leads_lastTouchId_key" ON "leads"("lastTouchId");

-- CreateIndex
CREATE INDEX "marketing_touches_sessionId_idx" ON "marketing_touches"("sessionId");

-- CreateIndex
CREATE INDEX "analytics_events_type_createdAt_idx" ON "analytics_events"("type", "createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_entity_entityId_idx" ON "audit_logs"("entity", "entityId");

-- AddForeignKey
ALTER TABLE "neighborhoods" ADD CONSTRAINT "neighborhoods_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_features_on_properties" ADD CONSTRAINT "property_features_on_properties_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_features_on_properties" ADD CONSTRAINT "property_features_on_properties_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "property_features"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_neighborhoodId_fkey" FOREIGN KEY ("neighborhoodId") REFERENCES "neighborhoods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_propertyTypeId_fkey" FOREIGN KEY ("propertyTypeId") REFERENCES "property_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_translations" ADD CONSTRAINT "property_translations_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_media" ADD CONSTRAINT "property_media_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_documents" ADD CONSTRAINT "property_documents_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_documents" ADD CONSTRAINT "property_documents_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_assignedAgentId_fkey" FOREIGN KEY ("assignedAgentId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_firstTouchId_fkey" FOREIGN KEY ("firstTouchId") REFERENCES "marketing_touches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_lastTouchId_fkey" FOREIGN KEY ("lastTouchId") REFERENCES "marketing_touches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_inquiries" ADD CONSTRAINT "property_inquiries_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_inquiries" ADD CONSTRAINT "property_inquiries_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
