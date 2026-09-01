'use client';

import { useState } from 'react';
import type { InquiryType, SupportedLocale } from '@altiora/shared-types';
import { InquiryForm } from './InquiryForm';
import { buildWhatsAppLink } from '@/lib/whatsapp';
import { trackEvent } from '@/lib/analytics';

const CTA_COPY: Record<
  SupportedLocale,
  {
    learnMore: string;
    whatsapp: string;
    advisor: string;
    visit: string;
    formTitle: Record<InquiryType, string>;
  }
> = {
  'es-CO': {
    learnMore: 'Quiero conocer esta propiedad',
    whatsapp: 'Hablar por WhatsApp',
    advisor: 'Solicitar asesor',
    visit: 'Agendar visita',
    formTitle: {
      GENERAL_INFO: 'Quiero más información',
      WHATSAPP_CONTACT: 'Contacto por WhatsApp',
      ADVISOR_REQUEST: 'Que un asesor me contacte',
      VISIT_REQUEST: 'Agendar una visita',
    },
  },
  'en-US': {
    learnMore: 'I want to know this property',
    whatsapp: 'Chat on WhatsApp',
    advisor: 'Request an advisor',
    visit: 'Schedule a visit',
    formTitle: {
      GENERAL_INFO: 'I want more information',
      WHATSAPP_CONTACT: 'Contact via WhatsApp',
      ADVISOR_REQUEST: 'Have an advisor contact me',
      VISIT_REQUEST: 'Schedule a visit',
    },
  },
};

export function PropertyInquirySection({
  propertyId,
  propertyTitle,
  locale,
}: {
  propertyId: string;
  propertyTitle: string;
  locale: SupportedLocale;
}) {
  const copy = CTA_COPY[locale];
  const [inquiryType, setInquiryType] = useState<InquiryType>('GENERAL_INFO');

  const whatsappLink = buildWhatsAppLink(
    locale === 'es-CO'
      ? `Hola, quiero información sobre ${propertyTitle}`
      : `Hi, I'd like information about ${propertyTitle}`,
  );

  return (
    <div style={{ display: 'grid', gap: '0.9rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setInquiryType('GENERAL_INFO')}
        >
          {copy.learnMore}
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
          onClick={() => setInquiryType('ADVISOR_REQUEST')}
        >
          {copy.advisor}
        </button>
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
