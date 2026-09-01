import type { ReactNode } from 'react';
import { Fraunces, IBM_Plex_Mono, Public_Sans } from 'next/font/google';
import { getLocale } from 'next-intl/server';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-fraunces',
});
const publicSans = Public_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-public-sans',
});
const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
});

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Resuelto por el middleware de next-intl para rutas públicas; /admin cae al default (es-CO).
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className={`${fraunces.variable} ${publicSans.variable} ${plexMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
