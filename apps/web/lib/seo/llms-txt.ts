import { categoryLabel, type CategoryEntry } from './categories';
import { ORGANIZATION_INFO } from './organization';

const LOCALE = 'es-CO';

const MAIN_PAGES: readonly { name: string; path: string }[] = [
  { name: 'Inicio', path: '' },
  { name: 'Propiedades', path: '/propiedades' },
  { name: 'Zonas', path: '/ciudades' },
  { name: 'Blog', path: '/blog' },
  { name: 'Nosotros', path: '/nosotros' },
  { name: 'Contacto', path: '/contacto' },
];

/**
 * Plain-text site guide for language models, following the llms.txt convention: an H1 with the
 * name, a blockquote summary, then sections of markdown links. Every fact comes from
 * `ORGANIZATION_INFO` or from the live inventory; links use the Spanish locale URLs.
 */
export function buildLlmsTxt(input: {
  baseUrl: string;
  cities: readonly { slug: string; name: string; department: string }[];
  categories: readonly CategoryEntry[];
}): string {
  const { baseUrl, cities, categories } = input;
  const url = (path: string) => `${baseUrl}/${LOCALE}${path}`;
  const org = ORGANIZATION_INFO;

  const lines: string[] = [
    `# ${org.name}`,
    '',
    `> ${org.description}`,
    '',
    `Razón social: ${org.legalName}`,
    '',
    `Dirección: ${org.streetAddress}, ${org.addressLocality}, ${org.addressRegion}, ${org.addressCountry}`,
    '',
    `Teléfono: ${org.telephone}`,
    '',
    `Correo: ${org.email}`,
    '',
    '## Páginas principales',
    '',
    ...MAIN_PAGES.map((page) => `- [${page.name}](${url(page.path)})`),
  ];

  if (cities.length > 0) {
    lines.push(
      '',
      '## Ciudades',
      '',
      ...cities.map(
        (city) => `- [${city.name}, ${city.department}](${url(`/ciudades/${city.slug}`)})`,
      ),
    );
  }

  if (categories.length > 0) {
    lines.push(
      '',
      '## Categorías de propiedades',
      '',
      ...categories.map(({ city, category }) => {
        const label = categoryLabel(category.typeSlug, category.operationType, LOCALE);
        const count = `${category.count} ${category.count === 1 ? 'propiedad' : 'propiedades'}`;
        return `- [${label} en ${city.name}, ${city.department}](${url(`/ciudades/${city.slug}/${category.slug}`)}): ${count}`;
      }),
    );
  }

  return `${lines.join('\n')}\n`;
}
