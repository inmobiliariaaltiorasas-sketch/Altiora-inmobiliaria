import type { ReactNode } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { SUPPORTED_LOCALES, type SupportedLocale } from '@/lib/locales';
import { Header } from '@/components/sections/Header';
import { Footer } from '@/components/sections/Footer';
import { SessionTracker } from '@/components/sections/SessionTracker';
import { OrganizationJsonLd } from '@/components/sections/OrganizationJsonLd';
import { WebsiteJsonLd } from '@/components/sections/WebsiteJsonLd';
import { WhatsAppButton } from '@/components/sections/WhatsAppButton';
import { AiAssistantWidget } from '@/components/sections/AiAssistantWidget';

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
      <AiAssistantWidget locale={locale} />
      <WhatsAppButton locale={locale} />
    </>
  );
}
