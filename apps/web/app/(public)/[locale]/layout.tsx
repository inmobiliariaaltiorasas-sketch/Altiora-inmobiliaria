import type { ReactNode } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { SUPPORTED_LOCALES, type SupportedLocale } from '@/lib/locales';
import { Header } from '@/components/sections/Header';
import { Footer } from '@/components/sections/Footer';
import { SessionTracker } from '@/components/sections/SessionTracker';
import { OrganizationJsonLd } from '@/components/sections/OrganizationJsonLd';
import { WebsiteJsonLd } from '@/components/sections/WebsiteJsonLd';
import { WhatsAppButton } from '@/components/sections/WhatsAppButton';

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export default async function PublicLocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = (await params) as { locale: SupportedLocale };
  setRequestLocale(locale);

  return (
    <>
      <OrganizationJsonLd />
      <WebsiteJsonLd locale={locale} />
      <SessionTracker />
      <Header locale={locale} />
      {children}
      <Footer locale={locale} />
      {/* AiAssistantWidget desmontado a pedido del negocio (2026-10): el asistente todavía no
          está listo. El componente sigue en components/sections para volver a montarlo. */}
      <WhatsAppButton locale={locale} />
    </>
  );
}
