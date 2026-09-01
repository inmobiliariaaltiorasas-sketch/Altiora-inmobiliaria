import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import { BASE_ROLES } from '@altiora/shared-types';

const prisma = new PrismaClient();

/**
 * Roles y permisos base del v1. Viven como datos, no como enum de código,
 * para poder agregar roles nuevos (ej. un rol de socio inversionista) sin deploy.
 */
const BASE_PERMISSIONS: Array<{ resource: string; action: string }> = [
  { resource: 'properties', action: 'manage' },
  { resource: 'leads', action: 'manage' },
  { resource: 'content', action: 'manage' },
  { resource: 'seo', action: 'manage' },
  { resource: 'users', action: 'manage' },
  { resource: 'settings', action: 'manage' },
  { resource: 'metrics', action: 'view' },
  { resource: 'audit-logs', action: 'view' },
];

const ROLE_PERMISSIONS: Record<
  (typeof BASE_ROLES)[number],
  Array<{ resource: string; action: string }>
> = {
  SUPER_ADMIN: BASE_PERMISSIONS,
  ADMIN: BASE_PERMISSIONS.filter((p) => p.resource !== 'users'),
  AGENT: [
    { resource: 'leads', action: 'manage' },
    { resource: 'metrics', action: 'view' },
  ],
  CONTENT_MANAGER: [
    { resource: 'content', action: 'manage' },
    { resource: 'seo', action: 'manage' },
  ],
  MARKETING: [{ resource: 'metrics', action: 'view' }],
  VIEWER: [{ resource: 'metrics', action: 'view' }],
};

async function main() {
  const permissionByKey = new Map<string, string>();

  for (const permission of BASE_PERMISSIONS) {
    const created = await prisma.permission.upsert({
      where: { resource_action: { resource: permission.resource, action: permission.action } },
      update: {},
      create: permission,
    });
    permissionByKey.set(`${permission.resource}:${permission.action}`, created.id);
  }

  for (const roleName of BASE_ROLES) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });

    for (const permission of ROLE_PERMISSIONS[roleName]) {
      const permissionId = permissionByKey.get(`${permission.resource}:${permission.action}`);
      if (!permissionId) continue;

      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId } },
        update: {},
        create: { roleId: role.id, permissionId },
      });
    }
  }

  const superAdminRole = await prisma.role.findUniqueOrThrow({ where: { name: 'SUPER_ADMIN' } });
  const devEmail = process.env.DEV_SUPER_ADMIN_EMAIL ?? 'admin@altiora.dev';
  const devPassword = process.env.DEV_SUPER_ADMIN_PASSWORD ?? 'ChangeMe123!';

  const superAdminUser = await prisma.user.upsert({
    where: { email: devEmail },
    update: {},
    create: {
      email: devEmail,
      name: 'Super Admin (dev)',
      passwordHash: await argon2.hash(devPassword),
      roleId: superAdminRole.id,
    },
  });

  await seedCatalogFixtures(superAdminUser.id);
  await seedFaqFixtures();
  await seedBlogFixtures(superAdminUser.id);

  console.log(`Seed OK — usuario de desarrollo: ${devEmail} / ${devPassword}`);
}

/**
 * Fase 1: solo Cartago (el mercado de lanzamiento real del v1) y 3 propiedades de EJEMPLO
 * explícitamente marcadas como datos de desarrollo — nunca inventar precios/áreas reales
 * fuera de un seed (v1 corrección sección 26).
 */
async function seedCatalogFixtures(agentId: string): Promise<void> {
  const cartago = await prisma.city.upsert({
    where: { slug: 'cartago-valle-del-cauca' },
    update: {},
    create: { name: 'Cartago', slug: 'cartago-valle-del-cauca', department: 'Valle del Cauca' },
  });

  const propertyTypes = await Promise.all(
    [
      { name: 'Casa', slug: 'casa' },
      { name: 'Apartamento', slug: 'apartamento' },
      { name: 'Lote', slug: 'lote' },
      { name: 'Finca', slug: 'finca' },
      { name: 'Local comercial', slug: 'local-comercial' },
    ].map((type) =>
      prisma.propertyType.upsert({ where: { slug: type.slug }, update: {}, create: type }),
    ),
  );

  const features = await Promise.all(
    [
      { name: 'Piscina', slug: 'piscina' },
      { name: 'Garaje', slug: 'garaje' },
      { name: 'Balcón', slug: 'balcon' },
      { name: 'Zona BBQ', slug: 'zona-bbq' },
      { name: 'Seguridad 24h', slug: 'seguridad-24h' },
      { name: 'Amoblado', slug: 'amoblado' },
    ].map((feature) =>
      prisma.propertyFeature.upsert({ where: { slug: feature.slug }, update: {}, create: feature }),
    ),
  );

  const findType = (slug: string) => propertyTypes.find((t) => t.slug === slug)!.id;
  const findFeature = (slug: string) => features.find((f) => f.slug === slug)!.id;

  const sampleProperties = [
    {
      slug: 'casa-campestre-cartago-example',
      operationType: 'SALE' as const,
      price: 480_000_000,
      bedrooms: 4,
      bathrooms: 3,
      parkingSpots: 2,
      builtAreaM2: 210,
      landAreaM2: 600,
      yearBuilt: 2019,
      propertyTypeId: findType('casa'),
      featureIds: [findFeature('piscina'), findFeature('garaje'), findFeature('zona-bbq')],
      media: [
        'https://picsum.photos/seed/altiora-casa-1/1200/800',
        'https://picsum.photos/seed/altiora-casa-2/1200/800',
      ],
      translations: {
        'es-CO': {
          title: 'Casa campestre en Cartago (EJEMPLO)',
          shortDescription:
            'Casa campestre de 4 habitaciones con piscina y amplio jardín — dato de ejemplo para desarrollo.',
          fullDescription:
            'Propiedad de ejemplo cargada por el seed de Fase 1 para probar el flujo completo del catálogo. No representa una propiedad real en venta.',
        },
        'en-US': {
          title: 'Country house in Cartago (SAMPLE)',
          shortDescription:
            '4-bedroom country house with pool and garden — sample data for development.',
          fullDescription:
            'Sample property loaded by the Fase 1 seed to exercise the full catalog flow. Does not represent a real listing.',
        },
      },
    },
    {
      slug: 'apartamento-centro-cartago-example',
      operationType: 'RENT' as const,
      price: 1_600_000,
      bedrooms: 2,
      bathrooms: 2,
      parkingSpots: 1,
      builtAreaM2: 78,
      yearBuilt: 2021,
      propertyTypeId: findType('apartamento'),
      featureIds: [findFeature('balcon'), findFeature('seguridad-24h')],
      media: ['https://picsum.photos/seed/altiora-apto-1/1200/800'],
      translations: {
        'es-CO': {
          title: 'Apartamento en el centro de Cartago (EJEMPLO)',
          shortDescription:
            'Apartamento de 2 habitaciones en arriendo, cerca del centro — dato de ejemplo.',
          fullDescription:
            'Propiedad de ejemplo cargada por el seed de Fase 1 para probar el flujo completo del catálogo. No representa una propiedad real en arriendo.',
        },
        'en-US': {
          title: 'Downtown Cartago apartment (SAMPLE)',
          shortDescription: '2-bedroom apartment for rent near downtown — sample data.',
          fullDescription:
            'Sample property loaded by the Fase 1 seed. Does not represent a real listing.',
        },
      },
    },
    {
      slug: 'casa-moderna-cartago-example',
      operationType: 'SALE' as const,
      price: 420_000_000,
      bedrooms: 3,
      bathrooms: 3,
      parkingSpots: 2,
      builtAreaM2: 120,
      landAreaM2: 180,
      yearBuilt: 2022,
      propertyTypeId: findType('casa'),
      featureIds: [findFeature('garaje'), findFeature('amoblado')],
      media: ['https://picsum.photos/seed/altiora-casa-moderna-1/1200/800'],
      translations: {
        'es-CO': {
          title: 'Casa moderna en Cartago (EJEMPLO)',
          shortDescription:
            'Casa moderna de 3 habitaciones con acabados de alta gama — dato de ejemplo para desarrollo.',
          fullDescription:
            'Propiedad de ejemplo cargada por el seed de Fase 1 para probar el flujo completo del catálogo. No representa una propiedad real en venta.',
        },
        'en-US': {
          title: 'Modern house in Cartago (SAMPLE)',
          shortDescription: '3-bedroom modern house with high-end finishes — sample data.',
          fullDescription:
            'Sample property loaded by the Fase 1 seed. Does not represent a real listing.',
        },
      },
    },
    {
      slug: 'lote-comercial-cartago-example',
      operationType: 'SALE' as const,
      price: 220_000_000,
      bedrooms: 0,
      bathrooms: 0,
      parkingSpots: 0,
      builtAreaM2: 0,
      landAreaM2: 500,
      propertyTypeId: findType('lote'),
      featureIds: [] as string[],
      media: ['https://picsum.photos/seed/altiora-lote-1/1200/800'],
      translations: {
        'es-CO': {
          title: 'Lote comercial vía Cartago (EJEMPLO)',
          shortDescription: 'Lote de 500 m² con potencial comercial — dato de ejemplo.',
          fullDescription:
            'Propiedad de ejemplo cargada por el seed de Fase 1 para probar el flujo completo del catálogo. No representa una propiedad real en venta.',
        },
        'en-US': {
          title: 'Commercial lot near Cartago (SAMPLE)',
          shortDescription: '500 m² lot with commercial potential — sample data.',
          fullDescription:
            'Sample property loaded by the Fase 1 seed. Does not represent a real listing.',
        },
      },
    },
  ];

  for (const sample of sampleProperties) {
    const existing = await prisma.property.findUnique({ where: { slug: sample.slug } });
    if (existing) continue;

    const property = await prisma.property.create({
      data: {
        slug: sample.slug,
        operationType: sample.operationType,
        price: sample.price,
        bedrooms: sample.bedrooms,
        bathrooms: sample.bathrooms,
        parkingSpots: sample.parkingSpots,
        builtAreaM2: sample.builtAreaM2,
        landAreaM2: sample.landAreaM2,
        yearBuilt: sample.yearBuilt,
        status: 'PUBLISHED',
        publishedAt: new Date(),
        cityId: cartago.id,
        propertyTypeId: sample.propertyTypeId,
        agentId,
        features: { create: sample.featureIds.map((featureId) => ({ featureId })) },
        translations: {
          create: Object.entries(sample.translations).map(([locale, translation]) => ({
            locale,
            ...translation,
          })),
        },
      },
    });

    await prisma.propertyMedia.createMany({
      data: sample.media.map((url, index) => ({
        propertyId: property.id,
        type: 'PHOTO',
        url,
        order: index,
      })),
    });
  }
}

/**
 * Fase 3 — AEO: 2 FAQs dinámicas (se recalculan en vivo desde Property, nunca hardcodeadas)
 * + 1 general estática y prudente, sin inventar condiciones legales/financieras (v1 corrección
 * sección 26 y sección 4 de esta fase).
 */
async function seedFaqFixtures(): Promise<void> {
  const cartago = await prisma.city.findUniqueOrThrow({
    where: { slug: 'cartago-valle-del-cauca' },
  });

  const priceRangeFaq = await prisma.faq.upsert({
    where: { id: 'faq-cartago-price-range' },
    update: {},
    create: {
      id: 'faq-cartago-price-range',
      relatedEntity: 'CITY',
      cityId: cartago.id,
      order: 1,
      isDynamic: true,
      dynamicKey: 'city_price_range',
      translations: {
        create: [
          { locale: 'es-CO', question: '¿Cuánto cuesta una casa en Cartago?' },
          { locale: 'en-US', question: 'How much does a house cost in Cartago?' },
        ],
      },
    },
  });

  const neighborhoodsFaq = await prisma.faq.upsert({
    where: { id: 'faq-cartago-neighborhoods' },
    update: {},
    create: {
      id: 'faq-cartago-neighborhoods',
      relatedEntity: 'CITY',
      cityId: cartago.id,
      order: 2,
      isDynamic: true,
      dynamicKey: 'city_neighborhoods_with_listings',
      translations: {
        create: [
          { locale: 'es-CO', question: '¿Qué barrios tienen casas en venta?' },
          { locale: 'en-US', question: 'Which neighborhoods have houses for sale?' },
        ],
      },
    },
  });

  const documentsFaq = await prisma.faq.upsert({
    where: { id: 'faq-general-documents' },
    update: {},
    create: {
      id: 'faq-general-documents',
      relatedEntity: 'GENERAL',
      order: 3,
      isDynamic: false,
      translations: {
        create: [
          {
            locale: 'es-CO',
            question: '¿Qué documentos necesito para comprar una casa?',
            answer:
              'En general se solicita documento de identidad, soporte de ingresos o capacidad de pago, y los datos del inmueble de interés. Cada compra puede tener particularidades legales o financieras distintas, así que te recomendamos confirmar el detalle exacto con un asesor de ALTiora antes de iniciar el proceso.',
          },
          {
            locale: 'en-US',
            question: 'What documents do I need to buy a house?',
            answer:
              'In general you will need identification, proof of income or payment capacity, and the details of the property you are interested in. Every purchase can have different legal or financial particulars, so we recommend confirming the exact requirements with an ALTiora advisor before starting the process.',
          },
        ],
      },
    },
  });

  void priceRangeFaq;
  void neighborhoodsFaq;
  void documentsFaq;
}

/**
 * Fase 3 — Blog: 2 artículos de EJEMPLO publicados + el borrador en-US sobre compra desde EE.UU.,
 * marcado needsReview y en DRAFT — contenido genérico y prudente, sin asesoría legal/financiera
 * específica inventada (v1 corrección sección 4 de esta fase).
 */
async function seedBlogFixtures(authorId: string): Promise<void> {
  const cartago = await prisma.city.findUniqueOrThrow({
    where: { slug: 'cartago-valle-del-cauca' },
  });

  const posts = [
    {
      slug: 'guia-para-comprar-tu-primera-vivienda-en-cartago-example',
      status: 'PUBLISHED' as const,
      needsReview: false,
      cityId: cartago.id,
      translations: {
        'es-CO': {
          title: 'Guía para comprar tu primera vivienda en Cartago (EJEMPLO)',
          excerpt: 'Pasos generales a tener en cuenta antes de comprar — artículo de ejemplo.',
          body: 'Artículo de ejemplo cargado por el seed de Fase 3 para probar el flujo completo del blog. No representa asesoría legal o financiera real — consultá siempre con un asesor de ALTiora.',
        },
        'en-US': {
          title: 'Guide to buying your first home in Cartago (SAMPLE)',
          excerpt: 'General steps to consider before buying — sample article.',
          body: 'Sample article loaded by the Fase 3 seed to exercise the full blog flow. Does not represent real legal or financial advice — always consult an ALTiora advisor.',
        },
      },
    },
    {
      slug: 'que-mirar-antes-de-invertir-en-finca-raiz-example',
      status: 'PUBLISHED' as const,
      needsReview: false,
      cityId: cartago.id,
      translations: {
        'es-CO': {
          title: 'Qué mirar antes de invertir en finca raíz (EJEMPLO)',
          excerpt: 'Puntos generales de evaluación — artículo de ejemplo.',
          body: 'Artículo de ejemplo cargado por el seed de Fase 3 para probar el flujo completo del blog. No representa asesoría de inversión real.',
        },
        'en-US': {
          title: 'What to look at before investing in real estate (SAMPLE)',
          excerpt: 'General evaluation points — sample article.',
          body: 'Sample article loaded by the Fase 3 seed. Does not represent real investment advice.',
        },
      },
    },
    {
      slug: 'como-comprar-vivienda-en-colombia-desde-estados-unidos',
      status: 'DRAFT' as const,
      needsReview: true,
      cityId: null,
      translations: {
        'es-CO': {
          title: 'Cómo comprar vivienda en Colombia desde Estados Unidos (BORRADOR)',
          excerpt:
            'Guía general del proceso — pendiente de validación legal por ALTiora antes de publicar.',
          body: 'BORRADOR pendiente de revisión legal. Contenido general y no vinculante: normalmente el proceso incluye definir presupuesto y forma de pago, identificar la propiedad de interés, validar la documentación con un abogado o asesor legal en Colombia, y coordinar el cierre con acompañamiento de un asesor de ALTiora. Este artículo no constituye asesoría legal, tributaria o migratoria — cada caso tiene particularidades distintas y debe validarse con un profesional antes de tomar decisiones.',
        },
        'en-US': {
          title: 'How to buy a home in Colombia from the United States (DRAFT)',
          excerpt:
            'General overview of the process — pending ALTiora legal review before publishing.',
          body: 'DRAFT pending legal review. General, non-binding overview: the process typically includes setting a budget and payment method, identifying the property of interest, validating documentation with a lawyer or legal advisor in Colombia, and coordinating closing with support from an ALTiora advisor. This article is not legal, tax, or immigration advice — every case has different particulars and should be validated with a professional before making decisions.',
        },
      },
    },
  ];

  for (const post of posts) {
    const existing = await prisma.blogPost.findUnique({ where: { slug: post.slug } });
    if (existing) continue;

    await prisma.blogPost.create({
      data: {
        slug: post.slug,
        status: post.status,
        needsReview: post.needsReview,
        publishedAt: post.status === 'PUBLISHED' ? new Date() : null,
        cityId: post.cityId,
        authorId,
        translations: {
          create: Object.entries(post.translations).map(([locale, translation]) => ({
            locale,
            ...translation,
          })),
        },
      },
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
