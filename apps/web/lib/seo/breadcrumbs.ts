export interface BreadcrumbItem {
  name: string;
  url: string;
}

/**
 * Builds a schema.org `BreadcrumbList` from the same ordered list the page renders visibly, so
 * the structured data can never diverge from the on-page breadcrumb.
 */
export function buildBreadcrumbList(items: readonly BreadcrumbItem[]) {
  return {
    '@type': 'BreadcrumbList' as const,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem' as const,
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
