import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { CitiesModule } from './modules/cities/cities.module';
import { NeighborhoodsModule } from './modules/neighborhoods/neighborhoods.module';
import { LocationsModule } from './modules/locations/locations.module';
import { PropertyTypesModule } from './modules/property-types/property-types.module';
import { PropertyFeaturesModule } from './modules/property-features/property-features.module';
import { PropertyStatusModule } from './modules/property-status/property-status.module';
import { PropertiesModule } from './modules/properties/properties.module';
import { PropertyMediaModule } from './modules/property-media/property-media.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { LeadSourcesModule } from './modules/lead-sources/lead-sources.module';
import { LeadsModule } from './modules/leads/leads.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';
import { BlogModule } from './modules/blog/blog.module';
import { ContentModule } from './modules/content/content.module';
import { SettingsModule } from './modules/settings/settings.module';

// Fase 2: WhatsApp trae ai-assistant, lead-scoring, appointments y lead-activities importados
// transitivamente (ver whatsapp.module.ts y leads.module.ts) — no hace falta listarlos acá.
// seo, notifications siguen fuera de alcance (Fase 5+).

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    CitiesModule,
    NeighborhoodsModule,
    LocationsModule,
    PropertyTypesModule,
    PropertyFeaturesModule,
    PropertyStatusModule,
    PropertiesModule,
    PropertyMediaModule,
    ContactsModule,
    LeadSourcesModule,
    LeadsModule,
    AnalyticsModule,
    AuditLogsModule,
    WhatsappModule,
    BlogModule,
    ContentModule,
    SettingsModule,
  ],
})
export class AppModule {}
