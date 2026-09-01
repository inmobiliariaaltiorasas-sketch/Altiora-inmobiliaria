import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  transpilePackages: ['@altiora/shared-types'],
  images: {
    remotePatterns: [
      // Solo para imágenes de ejemplo del seed de Fase 1 — se retira al cargar fotos reales.
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'http', hostname: 'localhost', port: '4000', pathname: '/property-media/**' },
    ],
  },
};

export default withNextIntl(nextConfig);
