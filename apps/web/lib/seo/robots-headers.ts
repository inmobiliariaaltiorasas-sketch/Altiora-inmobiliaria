/**
 * `X-Robots-Tag` for the private surfaces. Set at the HTTP level so it also covers route
 * handlers and responses that never render a page `<meta>` tag.
 */
export const NOINDEX_HEADER_RULES = [
  {
    source: '/admin/:path*',
    headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
  },
  {
    source: '/api/:path*',
    headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
  },
] as const;
