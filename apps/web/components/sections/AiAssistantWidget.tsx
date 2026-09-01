'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { SupportedLocale } from '@altiora/shared-types';
import { ChatIcon, CloseIcon } from '@/components/ui/icons';
import styles from './AiAssistantWidget.module.css';

const COPY: Record<
  SupportedLocale,
  {
    name: string;
    online: string;
    greeting: string;
    start: string;
    started: string;
    close: string;
    open: string;
  }
> = {
  'es-CO': {
    name: 'Altiora Asistente',
    online: 'En línea',
    greeting:
      '¡Hola! Soy el asistente virtual de Altiora. Estoy aquí para ayudarte a encontrar tu propiedad ideal.',
    start: 'Iniciar conversación',
    started:
      'Muy pronto vas a poder chatear en vivo con nuestro asistente. Mientras tanto, escribinos por WhatsApp.',
    close: 'Cerrar asistente',
    open: 'Abrir asistente virtual',
  },
  'en-US': {
    name: 'Altiora Assistant',
    online: 'Online',
    greeting: "Hi! I'm Altiora's virtual assistant. I'm here to help you find your ideal property.",
    start: 'Start conversation',
    started: 'Live chat with our assistant is coming soon. In the meantime, reach us on WhatsApp.',
    close: 'Close assistant',
    open: 'Open virtual assistant',
  },
};

/**
 * Solo la cáscara visual — sin lógica de IA real ni simulada. `onStartConversation` es el
 * punto de integración cuando se construya el chat completo contra el módulo `ai-assistant`
 * del backend (hoy solo expone WhatsApp; el widget web todavía no tiene transporte propio).
 */
export function AiAssistantWidget({
  locale,
  onStartConversation,
}: {
  locale: SupportedLocale;
  onStartConversation?: () => void;
}) {
  const copy = COPY[locale];
  const [expanded, setExpanded] = useState(false);
  const [started, setStarted] = useState(false);

  if (!expanded) {
    return (
      <button
        type="button"
        className={styles.bubble}
        aria-label={copy.open}
        onClick={() => setExpanded(true)}
      >
        <ChatIcon className={styles.bubbleIcon} />
      </button>
    );
  }

  return (
    <div className={styles.card} role="dialog" aria-label={copy.name}>
      <div className={styles.header}>
        <Image
          src="/altiora-logo.jpg"
          alt=""
          width={34}
          height={34}
          className={styles.avatar}
          aria-hidden="true"
        />
        <div className={styles.headerText}>
          <span className={styles.name}>{copy.name}</span>
          <span className={styles.status}>
            <span className={styles.statusDot} aria-hidden="true" />
            {copy.online}
          </span>
        </div>
        <button
          type="button"
          className={styles.closeBtn}
          aria-label={copy.close}
          onClick={() => setExpanded(false)}
        >
          <CloseIcon className={styles.closeIcon} />
        </button>
      </div>

      <p className={styles.message}>{copy.greeting}</p>

      {started ? (
        <p className={styles.startedNote}>{copy.started}</p>
      ) : (
        <button
          type="button"
          className={`btn btn-gold ${styles.startBtn}`}
          onClick={() => {
            setStarted(true);
            onStartConversation?.();
          }}
        >
          {copy.start}
        </button>
      )}
    </div>
  );
}
