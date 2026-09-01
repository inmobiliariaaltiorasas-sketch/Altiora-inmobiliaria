import type { SupportedLocale } from '@altiora/shared-types';

const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL ?? 'http://localhost:3000';

export function WebsiteJsonLd({ locale }: { locale: SupportedLocale }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ALTiora',
    url: `${WEB_URL}/${locale}`,
    inLanguage: locale,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
