import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  transpilePackages: ['@altiora/shared-types'],
  images: {
    // Techo en 1920: el catálogo no tiene fotos más anchas que eso y evita que Next
    // interpole el Hero (fuente nativa de 1672px) hasta el default de 3840px.
    deviceSizes: [640, 750, 828, 1080, 1200, 1600, 1920],
    remotePatterns: [
      // Solo para imágenes de ejemplo del seed de Fase 1 — se retira al cargar fotos reales.
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'http', hostname: 'localhost', port: '4000', pathname: '/property-media/**' },
    ],
  },
};

export default withNextIntl(nextConfig);
