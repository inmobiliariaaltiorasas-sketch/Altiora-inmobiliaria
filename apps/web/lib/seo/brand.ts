/** Brand used in titles, `og:site_name`, breadcrumbs and JSON-LD `name`. */
export const BRAND_NAME = 'ALTiora Inmobiliaria';
/** Short form for running copy where the full brand would be heavy. */
export const BRAND_SHORT_NAME = 'ALTiora';
/** Legal entity name: only for `legalName` / `alternateName`, never as a display brand. */
export const LEGAL_NAME = 'Altiora Construcciones e Inmobiliaria S.A.S.';

export const TITLE_SEPARATOR = ' | ';
/** Title template for the root layout: every public page title ends with the brand once. */
export const TITLE_TEMPLATE = `%s${TITLE_SEPARATOR}${BRAND_NAME}`;

// Trailing "<separator> <brand>" in any of the spellings found in hand-written titles.
const TRAILING_BRAND = /\s*[|\-–—·]\s*(?:altiora\s+inmobiliaria|altiora)\s*$/i;

/**
 * Prepares a raw page title for Next's `title.template`: removes a hand-written brand suffix so
 * the template adds it exactly once. A title that still mentions the full brand elsewhere is
 * returned as `absolute` (template skipped) so the brand is never duplicated.
 */
export function titleForTemplate(rawTitle: string): string | { absolute: string } {
  const stripped = rawTitle
    .replace(TRAILING_BRAND, '')
    .replace(/^\s*[|\-–—·]\s*/, '')
    .trim();
  if (stripped === '' || /^altiora(\s+inmobiliaria)?$/i.test(stripped)) {
    return { absolute: BRAND_NAME };
  }
  if (stripped.toLowerCase().includes(BRAND_NAME.toLowerCase())) {
    return { absolute: stripped };
  }
  return stripped;
}

/** Final title string (what the template would render), for Open Graph and Twitter titles. */
export function fullTitle(rawTitle: string): string {
  const resolved = titleForTemplate(rawTitle);
  return typeof resolved === 'string'
    ? `${resolved}${TITLE_SEPARATOR}${BRAND_NAME}`
    : resolved.absolute;
}
