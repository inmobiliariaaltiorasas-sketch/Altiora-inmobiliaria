import type { Metadata } from 'next';
import type { SupportedLocale } from '@altiora/shared-types';

const COPY: Record<SupportedLocale, { title: string; body: string }> = {
  'es-CO': {
    title: 'Calcula tu crédito',
    body: 'Estamos construyendo el simulador de crédito hipotecario. Mientras tanto, un asesor de ALTiora puede ayudarte a estimar tu capacidad de compra.',
  },
  'en-US': {
    title: 'Calculate your loan',
    body: "We're building the mortgage simulator. In the meantime, an ALTiora advisor can help you estimate your buying power.",
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

export default async function CreditCalculatorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = (await params) as { locale: SupportedLocale };
  const copy = COPY[locale];

  return (
    <main className="container" style={{ padding: '3rem 1.5rem 4rem', maxWidth: '34rem' }}>
      <span className="eyebrow">ALTiora</span>
      <h1 style={{ fontSize: '1.9rem', marginTop: '0.5rem' }}>{copy.title}</h1>
      <p style={{ color: 'var(--text-muted)', marginTop: '0.6rem' }}>{copy.body}</p>
    </main>
  );
}
