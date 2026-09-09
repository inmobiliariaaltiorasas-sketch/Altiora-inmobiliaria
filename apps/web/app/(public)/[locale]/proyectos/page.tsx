import Link from 'next/link';
import type { Metadata } from 'next';
import type { SupportedLocale } from '@altiora/shared-types';
import { buildWhatsAppLink } from '@/lib/whatsapp';
import { WhatsAppIcon } from '@/components/ui/icons';
import styles from './page.module.css';

const COPY: Record<
  SupportedLocale,
  {
    eyebrow: string;
    title: string;
    body: string;
    whatsappCta: string;
    whatsappMessage: string;
    browseCta: string;
    metaDescription: string;
  }
> = {
  'es-CO': {
    eyebrow: 'PROYECTOS ALTIORA',
    title: 'Estamos preparando nuevos proyectos',
    body: 'Todavía no tenemos proyectos de construcción publicados, pero ya estamos trabajando en los próximos. Si quieres ser de los primeros en conocerlos, escríbenos y te avisamos apenas estén disponibles.',
    whatsappCta: 'Avisarme por WhatsApp',
    whatsappMessage: 'Hola, quiero que me avisen cuando tengan nuevos proyectos disponibles.',
    browseCta: 'Ver propiedades disponibles →',
    metaDescription:
      'Los proyectos de construcción de Altiora están en preparación. Déjanos tu contacto por WhatsApp para conocerlos apenas estén disponibles.',
  },
  'en-US': {
    eyebrow: 'ALTIORA PROJECTS',
    title: "We're preparing new projects",
    body: "We don't have published construction projects yet, but we're already working on the next ones. If you want to be among the first to know about them, message us and we'll let you know as soon as they're available.",
    whatsappCta: 'Notify me on WhatsApp',
    whatsappMessage: "Hi, I'd like to be notified when you have new projects available.",
    browseCta: 'View available properties →',
    metaDescription:
      "Altiora's construction projects are in preparation. Leave your contact on WhatsApp to hear about them as soon as they're available.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = (await params) as { locale: SupportedLocale };
  const copy = COPY[locale];
  return {
    title: `${locale === 'es-CO' ? 'Proyectos' : 'Projects'} | ALTiora`,
    description: copy.metaDescription,
  };
}

export default async function ProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = (await params) as { locale: SupportedLocale };
  const copy = COPY[locale];
  const whatsappLink = buildWhatsAppLink(copy.whatsappMessage);

  return (
    <main className={`container ${styles.wrapper}`}>
      <span className="eyebrow">{copy.eyebrow}</span>
      <h1 className={styles.title}>{copy.title}</h1>
      <p className={styles.body}>{copy.body}</p>

      <div className={styles.actions}>
        {whatsappLink ? (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-gold"
          >
            <WhatsAppIcon className={styles.icon} aria-hidden="true" />
            {copy.whatsappCta}
          </a>
        ) : null}
        <Link href={`/${locale}/propiedades`} className="btn btn-outline">
          {copy.browseCta}
        </Link>
      </div>
    </main>
  );
}
