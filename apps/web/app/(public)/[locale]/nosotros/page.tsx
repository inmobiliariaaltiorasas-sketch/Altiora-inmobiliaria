import type { Metadata } from 'next';
import type { SupportedLocale } from '@altiora/shared-types';

const COPY: Record<SupportedLocale, { title: string; body: string; tagline: string }> = {
  'es-CO': {
    title: 'Nosotros',
    tagline: 'Tu patrimonio, nuestra prioridad.',
    body: 'ALTiora Construcciones e Inmobiliaria S.A.S. acompaña a compradores en Cartago, Valle del Cauca, con propiedades verificadas y asesoría real en cada paso. Estamos completando esta página — muy pronto vas a conocer más sobre nuestra historia y nuestro equipo.',
  },
  'en-US': {
    title: 'About us',
    tagline: 'Your legacy, our priority.',
    body: 'ALTiora Construcciones e Inmobiliaria S.A.S. supports buyers in Cartago, Valle del Cauca, with verified properties and real guidance at every step. This page is still being completed — more about our story and team is coming soon.',
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

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = (await params) as { locale: SupportedLocale };
  const copy = COPY[locale];

  return (
    <main className="container" style={{ padding: '3rem 1.5rem 4rem', maxWidth: '38rem' }}>
      <span className="eyebrow">ALTiora</span>
      <h1 style={{ fontSize: '1.9rem', marginTop: '0.5rem' }}>{copy.title}</h1>
      <p
        style={{
          color: 'var(--gold-strong, var(--gold-500))',
          fontWeight: 600,
          marginTop: '0.5rem',
        }}
      >
        {copy.tagline}
      </p>
      <p style={{ color: 'var(--text-muted)', marginTop: '0.6rem' }}>{copy.body}</p>
    </main>
  );
}
