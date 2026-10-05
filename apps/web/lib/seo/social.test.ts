import { describe, expect, it } from 'vitest';
import { buildSocialMetadata } from './social';

const base = {
  rawTitle: 'Contacto | ALTiora',
  description: 'Escríbenos',
  url: 'https://example.com/es-CO/contacto',
  fallbackImage: 'https://example.com/logo.png',
};

describe('buildSocialMetadata', () => {
  it('returns the template-ready title and a fully branded social title', () => {
    const result = buildSocialMetadata(base);
    expect(result.title).toBe('Contacto');
    expect(result.openGraph.title).toBe('Contacto | ALTiora Inmobiliaria');
    expect(result.twitter.title).toBe('Contacto | ALTiora Inmobiliaria');
  });

  it('fills Open Graph with url, site name, type and image', () => {
    const { openGraph } = buildSocialMetadata(base);
    expect(openGraph).toMatchObject({
      description: 'Escríbenos',
      url: 'https://example.com/es-CO/contacto',
      siteName: 'ALTiora Inmobiliaria',
      type: 'website',
      images: [{ url: 'https://example.com/logo.png' }],
    });
  });

  it('fills the Twitter card with a large image', () => {
    const { twitter } = buildSocialMetadata(base);
    expect(twitter).toMatchObject({
      card: 'summary_large_image',
      description: 'Escríbenos',
      images: ['https://example.com/logo.png'],
    });
  });

  it('prefers an explicit image and article type when given', () => {
    const result = buildSocialMetadata({
      ...base,
      image: 'https://example.com/photo.jpg',
      type: 'article',
    });
    expect(result.openGraph.type).toBe('article');
    expect(result.openGraph.images).toEqual([{ url: 'https://example.com/photo.jpg' }]);
    expect(result.twitter.images).toEqual(['https://example.com/photo.jpg']);
  });
});
