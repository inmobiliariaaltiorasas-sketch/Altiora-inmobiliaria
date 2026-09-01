import type { Metadata } from 'next';
import type { SupportedLocale } from '@altiora/shared-types';
import { InquiryForm } from '@/components/blocks/InquiryForm';
import { buildWhatsAppLink } from '@/lib/whatsapp';

const COPY: Record<
  SupportedLocale,
  { title: string; subtitle: string; formTitle: string; whatsapp: string }
> = {
  'es-CO': {
    title: 'Hablemos',
    subtitle:
      'Contanos qué estás buscando y un asesor de ALTiora te contacta por el canal que prefieras.',
    formTitle: 'Quiero que me contacten',
    whatsapp: 'Hablar por WhatsApp',
  },
  'en-US': {
    title: "Let's talk",
    subtitle:
      "Tell us what you're looking for and an ALTiora advisor will reach out on your preferred channel.",
    formTitle: 'Have an advisor contact me',
    whatsapp: 'Chat on WhatsApp',
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = (await params) as { locale: SupportedLocale };
  return { title: `${COPY[locale].title} | ALTiora` };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = (await params) as { locale: SupportedLocale };
  const copy = COPY[locale];
  const whatsappLink = buildWhatsAppLink(
    locale === 'es-CO' ? 'Hola, quiero más información' : 'Hi, I want more information',
  );

  return (
    <main className="container" style={{ padding: '2.5rem 1.5rem 3rem', maxWidth: '34rem' }}>
      <h1 style={{ fontSize: '1.9rem' }}>{copy.title}</h1>
      <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>{copy.subtitle}</p>

      {whatsappLink ? (
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-gold"
          style={{ marginTop: '1rem' }}
        >
          {copy.whatsapp}
        </a>
      ) : null}

      <div style={{ marginTop: '1.5rem' }}>
        <InquiryForm inquiryType="GENERAL_INFO" locale={locale} title={copy.formTitle} />
      </div>
    </main>
  );
}
