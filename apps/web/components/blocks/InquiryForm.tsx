'use client';

import { useState, type FormEvent } from 'react';
import type { InquiryType, PreferredChannel, SupportedLocale } from '@altiora/shared-types';
import { getOrCreateSessionId } from '@/lib/session';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

const COPY: Record<
  SupportedLocale,
  {
    name: string;
    channel: string;
    contactWhatsapp: string;
    contactPhone: string;
    contactEmail: string;
    propertyType: string;
    location: string;
    submit: string;
    sending: string;
    sent: string;
    error: string;
  }
> = {
  'es-CO': {
    name: 'Nombre',
    channel: 'Canal preferido',
    contactWhatsapp: 'Número de WhatsApp',
    contactPhone: 'Teléfono',
    contactEmail: 'Correo electrónico',
    propertyType: 'Tipo de inmueble',
    location: 'Ubicación',
    submit: 'Enviar',
    sending: 'Enviando…',
    sent: 'Listo — un asesor te va a contactar pronto.',
    error: 'No pudimos enviar tu solicitud. Intentá de nuevo.',
  },
  'en-US': {
    name: 'Name',
    channel: 'Preferred channel',
    contactWhatsapp: 'WhatsApp number',
    contactPhone: 'Phone number',
    contactEmail: 'Email address',
    propertyType: 'Property type',
    location: 'Location',
    submit: 'Send',
    sending: 'Sending…',
    sent: 'Done — an advisor will reach out soon.',
    error: "We couldn't send your request. Please try again.",
  },
};

interface InquiryFormProps {
  propertyId?: string;
  inquiryType: InquiryType;
  locale: SupportedLocale;
  title: string;
  /** Agrega "Tipo de inmueble"/"Ubicación" — se envían dentro de `note` (el DTO no tiene
   *  campos propios para esto todavía). Pensado para el formulario de "Vende tu propiedad". */
  showPropertyContextFields?: boolean;
}

/**
 * Único backend para el formulario de la ficha de propiedad, la página de contacto general
 * y "Vende tu propiedad" — pide solo nombre + un canal de contacto, más los dos campos
 * opcionales de contexto cuando `showPropertyContextFields` está activo (v1 correcciones
 * secciones 7 y 13).
 */
export function InquiryForm({
  propertyId,
  inquiryType,
  locale,
  title,
  showPropertyContextFields,
}: InquiryFormProps) {
  const copy = COPY[locale];
  const [channel, setChannel] = useState<PreferredChannel>('WHATSAPP');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('sending');

    const form = new FormData(event.currentTarget);
    const contactValue = String(form.get('contact') ?? '');

    const noteParts: string[] = [];
    if (showPropertyContextFields) {
      const propertyType = String(form.get('propertyType') ?? '').trim();
      const location = String(form.get('propertyLocation') ?? '').trim();
      if (propertyType) noteParts.push(`${copy.propertyType}: ${propertyType}`);
      if (location) noteParts.push(`${copy.location}: ${location}`);
    }

    try {
      const response = await fetch(`${API_URL}/leads/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: String(form.get('name') ?? ''),
          whatsapp: channel === 'WHATSAPP' ? contactValue : undefined,
          phone: channel === 'PHONE' ? contactValue : undefined,
          email: channel === 'EMAIL' ? contactValue : undefined,
          preferredChannel: channel,
          inquiryType,
          propertyId,
          note: noteParts.length > 0 ? noteParts.join(' · ') : undefined,
          sessionId: getOrCreateSessionId(),
        }),
      });
      if (!response.ok) throw new Error(`API respondió ${response.status}`);
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <div className="card" style={{ padding: '1.25rem', borderColor: 'var(--gold-500)' }}>
        <p style={{ margin: 0 }}>{copy.sent}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="card"
      style={{ padding: '1.25rem', display: 'grid', gap: '0.9rem' }}
    >
      <h3 style={{ fontSize: '1.05rem' }}>{title}</h3>

      <div className="field">
        <label htmlFor="inquiry-name">{copy.name}</label>
        <input id="inquiry-name" name="name" type="text" required />
      </div>

      <div className="field">
        <label htmlFor="inquiry-channel">{copy.channel}</label>
        <select
          id="inquiry-channel"
          value={channel}
          onChange={(event) => setChannel(event.target.value as PreferredChannel)}
        >
          <option value="WHATSAPP">WhatsApp</option>
          <option value="PHONE">{locale === 'es-CO' ? 'Teléfono' : 'Phone'}</option>
          <option value="EMAIL">Email</option>
        </select>
      </div>

      <div className="field">
        <label htmlFor="inquiry-contact">
          {channel === 'WHATSAPP'
            ? copy.contactWhatsapp
            : channel === 'PHONE'
              ? copy.contactPhone
              : copy.contactEmail}
        </label>
        <input
          id="inquiry-contact"
          name="contact"
          type={channel === 'EMAIL' ? 'email' : 'tel'}
          required
        />
      </div>

      {showPropertyContextFields ? (
        <>
          <div className="field">
            <label htmlFor="inquiry-property-type">{copy.propertyType}</label>
            <input id="inquiry-property-type" name="propertyType" type="text" />
          </div>

          <div className="field">
            <label htmlFor="inquiry-property-location">{copy.location}</label>
            <input id="inquiry-property-location" name="propertyLocation" type="text" />
          </div>
        </>
      ) : null}

      <button type="submit" className="btn btn-gold" disabled={status === 'sending'}>
        {status === 'sending' ? copy.sending : copy.submit}
      </button>

      {status === 'error' && (
        <p style={{ color: '#b3261e', fontSize: '0.85rem', margin: 0 }}>{copy.error}</p>
      )}
    </form>
  );
}
