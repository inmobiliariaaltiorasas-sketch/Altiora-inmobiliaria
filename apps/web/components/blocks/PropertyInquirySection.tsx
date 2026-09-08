'use client';

import { useState } from 'react';
import type { InquiryType, SupportedLocale } from '@altiora/shared-types';
import { InquiryForm } from './InquiryForm';
import { buildWhatsAppLink } from '@/lib/whatsapp';
import { trackEvent } from '@/lib/analytics';

const CTA_COPY: Record<
  SupportedLocale,
  {
    info: string;
    whatsapp: string;
    visit: string;
    formTitle: Record<InquiryType, string>;
  }
> = {
  'es-CO': {
    info: 'Solicitar información',
    whatsapp: 'Hablar por WhatsApp',
    visit: 'Agendar visita',
    formTitle: {
      GENERAL_INFO: 'Solicitar información',
      WHATSAPP_CONTACT: 'Contacto por WhatsApp',
      ADVISOR_REQUEST: 'Que un asesor me contacte',
      VISIT_REQUEST: 'Agendar una visita',
    },
  },
  'en-US': {
    info: 'Request information',
    whatsapp: 'Chat on WhatsApp',
    visit: 'Schedule a visit',
    formTitle: {
      GENERAL_INFO: 'Request information',
      WHATSAPP_CONTACT: 'Contact via WhatsApp',
      ADVISOR_REQUEST: 'Have an advisor contact me',
      VISIT_REQUEST: 'Schedule a visit',
    },
  },
};

export function PropertyInquirySection({
  propertyId,
  propertyTitle,
  propertySlug,
  propertyUrl,
  locale,
}: {
  propertyId: string;
  propertyTitle: string;
  /** Código público de la propiedad — se incluye en el mensaje de WhatsApp para que el asesor
   * identifique la propiedad de inmediato sin tener que buscarla. */
  propertySlug: string;
  propertyUrl: string;
  locale: SupportedLocale;
}) {
  const copy = CTA_COPY[locale];
  const [inquiryType, setInquiryType] = useState<InquiryType>('GENERAL_INFO');

  const whatsappLink = buildWhatsAppLink(
    locale === 'es-CO'
      ? `Hola, estoy interesado en la propiedad "${propertyTitle}", código ${propertySlug}. Quisiera recibir más información. ${propertyUrl}`
      : `Hi, I'm interested in the property "${propertyTitle}", code ${propertySlug}. I'd like more information. ${propertyUrl}`,
  );

  return (
    <div style={{ display: 'grid', gap: '0.9rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setInquiryType('GENERAL_INFO')}
        >
          {copy.info}
        </button>
        {whatsappLink ? (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-gold"
            onClick={() => trackEvent('whatsapp_click', { propertyId })}
          >
            {copy.whatsapp}
          </a>
        ) : null}
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => setInquiryType('VISIT_REQUEST')}
        >
          {copy.visit}
        </button>
      </div>

      <InquiryForm
        propertyId={propertyId}
        inquiryType={inquiryType}
        locale={locale}
        title={copy.formTitle[inquiryType]}
      />
    </div>
  );
}
