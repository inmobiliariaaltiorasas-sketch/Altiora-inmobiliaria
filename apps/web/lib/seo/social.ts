import { BRAND_NAME, fullTitle, titleForTemplate } from './brand';

interface SocialInput {
  /** Page title as written; any hand-written brand suffix is normalised. */
  rawTitle: string;
  description: string;
  url: string;
  /** Used when the page has no image of its own (the site logo). */
  fallbackImage: string;
  image?: string;
  type?: 'website' | 'article';
}

/**
 * Title (template-ready) plus Open Graph and Twitter card metadata. Social titles carry the
 * brand explicitly because Next applies the title template only to `<title>`.
 */
export function buildSocialMetadata(input: SocialInput) {
  const socialTitle = fullTitle(input.rawTitle);
  const image = input.image ?? input.fallbackImage;
  return {
    title: titleForTemplate(input.rawTitle),
    openGraph: {
      title: socialTitle,
      description: input.description,
      url: input.url,
      siteName: BRAND_NAME,
      type: input.type ?? ('website' as const),
      images: [{ url: image }],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: socialTitle,
      description: input.description,
      images: [image],
    },
  };
}
