import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import { SHORT_LOCALE_REDIRECTS } from './lib/seo/locale-redirects';
import { NOINDEX_HEADER_RULES } from './lib/seo/robots-headers';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  transpilePackages: ['@altiora/shared-types'],
  async headers() {
    return NOINDEX_HEADER_RULES.map((rule) => ({
      source: rule.source,
      headers: [...rule.headers],
    }));
  },
  async redirects() {
    return SHORT_LOCALE_REDIRECTS.map((rule) => ({ ...rule }));
  },
  experimental: {
    serverActions: {
      // El default de 1 MB rechaza cualquier foto de celular. El admin sube de a un archivo por
      // request (ver PropertyMediaUploadForm, tope de 15 MB por archivo) — esto deja margen para
      // el overhead del multipart sin habilitar bodies enormes en el Worker.
      bodySizeLimit: '20mb',
    },
  },
  images: {
    // Techo en 1920: el catálogo no tiene fotos más anchas que eso y evita que Next
    // interpole el Hero (fuente nativa de 1672px) hasta el default de 3840px.
    deviceSizes: [640, 750, 828, 1080, 1200, 1600, 1920],
    // 75 es el default de Next; 100 lo necesita el logo del header (texto fino + degradado,
    // se ve borroso con recompresión con pérdida) — Next 15 rechaza en build cualquier
    // "q" no listado acá con 400, aunque `next dev` no lo valide igual de estricto.
    qualities: [75, 100],
    remotePatterns: [
      // Solo para imágenes de ejemplo del seed de Fase 1 — se retira al cargar fotos reales.
      { protocol: 'https', hostname: 'picsum.photos' },
      // Bucket público de R2 (R2_PUBLIC_URL en apps/api) — fotos reales de propiedades.
      // Si se cambia a un dominio propio, hay que actualizar este host y redeployar.
      { protocol: 'https', hostname: 'pub-7af76bf3a99542dc8b5a9ac27b7f09c8.r2.dev' },
      { protocol: 'http', hostname: 'localhost', port: '4000', pathname: '/property-media/**' },
    ],
  },
};

export default withNextIntl(nextConfig);
