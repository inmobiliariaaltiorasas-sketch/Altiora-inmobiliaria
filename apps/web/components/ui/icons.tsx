import type { SVGProps } from 'react';

/**
 * Set de iconos propio en SVG inline — el proyecto no tiene una librería de iconos instalada
 * y sumar una (lucide, heroicons, etc.) para esta tarea no está justificado (v1 regla 24).
 * Todos heredan `currentColor` y aceptan las props estándar de SVG (className, aria-hidden, etc.).
 */
type IconProps = SVGProps<SVGSVGElement>;

const base = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function HouseIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5.5 10v9a1 1 0 0 0 1 1H9v-5.5h6V20h2.5a1 1 0 0 0 1-1v-9" />
    </svg>
  );
}

export function ShieldCheckIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.5 5 6v6c0 4.2 3 7.7 7 8.5 4-0.8 7-4.3 7-8.5V6l-7-2.5Z" />
      <path d="M9 12.2 11.2 14.4 15.4 10" />
    </svg>
  );
}

export function UsersIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="9" cy="8.5" r="3" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <path d="M15.5 6a3 3 0 1 1 2.4 4.9" />
      <path d="M16.3 13.2a6.5 6.5 0 0 1 5.2 6.3" />
    </svg>
  );
}

export function BedIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M2.5 19v-8a2 2 0 0 1 2-2h15a2 2 0 0 1 2 2v8" />
      <path d="M2.5 19v2M21.5 19v2" />
      <path d="M2.5 15h19" />
      <path d="M6.5 15v-2.5a1.5 1.5 0 0 1 1.5-1.5h2.5a1.5 1.5 0 0 1 1.5 1.5V15" />
    </svg>
  );
}

export function BathIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 12V6.5A2.5 2.5 0 0 1 6.5 4c1 0 1.9.6 2.3 1.5" />
      <path d="M2.5 12h19v1.5A6.5 6.5 0 0 1 15 20H9a6.5 6.5 0 0 1-6.5-6.5V12Z" />
      <path d="M6 20v1.5M15 20v1.5" />
    </svg>
  );
}

export function CarIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3.5 15.5 5 10a2 2 0 0 1 1.9-1.5h10.2A2 2 0 0 1 19 10l1.5 5.5" />
      <path d="M3 15.5h18v3a1 1 0 0 1-1 1h-1.5a1 1 0 0 1-1-1v-1H6.5v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3Z" />
      <circle cx="7" cy="17.5" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="17" cy="17.5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function RulerIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="8" width="18" height="8" rx="1.2" />
      <path d="M7 8v3M11 8v3M15 8v3M19 8v3" />
    </svg>
  );
}

export function PinIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 21s7-6.1 7-11.6A7 7 0 0 0 5 9.4C5 14.9 12 21 12 21Z" />
      <circle cx="12" cy="9.4" r="2.4" />
    </svg>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 4.5h3.5l1.4 4.3-2 1.6a12.5 12.5 0 0 0 6.7 6.7l1.6-2 4.3 1.4V20a1.5 1.5 0 0 1-1.5 1.5C11 21.5 2.5 13 2.5 6A1.5 1.5 0 0 1 4 4.5Z" />
    </svg>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="2.5" y="5" width="19" height="14" rx="2" />
      <path d="M3 6.5 12 13l9-6.5" />
    </svg>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M15 5 8 12l7 7" />
    </svg>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M9 5l7 7-7 7" />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M20 20 15.3 15.3" />
    </svg>
  );
}

export function HeartIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 20.2s-7.5-4.6-9.7-9.3C.7 7.3 2.6 4 6.1 4c2 0 3.6 1.1 4.4 2.7C11.3 5.1 12.9 4 14.9 4c3.5 0 5.4 3.3 3.8 6.9-2.2 4.7-9.7 9.3-9.7 9.3Z" />
    </svg>
  );
}

export function ChatIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3.5 12a8 8 0 0 1 14.7-4.4M20.5 12a8 8 0 0 1-14.7 4.4" />
      <path d="M3.5 5.5v4h4M20.5 18.5v-4h-4" />
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3.5 6.5h17M3.5 12h17M3.5 17.5h17" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 5l14 14M19 5 5 19" />
    </svg>
  );
}

export function CompassIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9l-2 6-6 2 2-6 6-2Z" />
    </svg>
  );
}

export function FileTextIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6.5 2.5h8L19 7v14a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1v-17a1 1 0 0 1 1-1Z" />
      <path d="M14 2.5V7h4.5" />
      <path d="M8.5 12h7M8.5 15.5h7M8.5 18.5h4" />
    </svg>
  );
}

export function CalculatorIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="4.5" y="2.5" width="15" height="19" rx="1.5" />
      <path d="M7.5 6.5h9" />
      <path d="M7.5 11h1.6M11.2 11h1.6M14.9 11h1.6M7.5 14.5h1.6M11.2 14.5h1.6M14.9 14.5v4.3M7.5 18h1.6M11.2 18h1.6" />
    </svg>
  );
}

export function HeadsetIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 13v-1a8 8 0 0 1 16 0v1" />
      <rect x="2.5" y="13" width="4" height="6" rx="1.3" />
      <rect x="17.5" y="13" width="4" height="6" rx="1.3" />
      <path d="M19.5 19v.5a3 3 0 0 1-3 3H13" />
    </svg>
  );
}

export function HandshakeIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M2.5 11.5 7 8l3 2 2.3-1.8a2 2 0 0 1 2.6.1L18.5 11" />
      <path d="M6 12.5l3.4 3.2a1.8 1.8 0 0 0 2.5-.1l.3-.3a1.6 1.6 0 0 0 2.3.1l.4-.4a1.6 1.6 0 0 0 2.2 0l1.4-1.3" />
      <path d="M2.5 11.5 6 15l1.4-1.3" />
      <path d="M18.5 11l2.9.9-3.6 5.6-2-1.2" />
    </svg>
  );
}

export function AwardIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="8.5" r="5.5" />
      <path d="M8.5 13 7 21l5-2.5L17 21l-1.5-8" />
    </svg>
  );
}

export function WhatsAppIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.03 2.5c-5.25 0-9.5 4.25-9.5 9.5 0 1.68.44 3.26 1.22 4.63L2.5 21.5l5.02-1.22a9.44 9.44 0 0 0 4.51 1.15h.01c5.25 0 9.5-4.25 9.5-9.5s-4.25-9.43-9.51-9.43Zm0 17.29h-.01a7.8 7.8 0 0 1-3.98-1.09l-.29-.17-2.98.73.72-2.9-.19-.3a7.75 7.75 0 0 1-1.19-4.13c0-4.3 3.5-7.8 7.93-7.8 2.12 0 4.1.83 5.6 2.32a7.7 7.7 0 0 1 2.32 5.5c0 4.3-3.5 7.84-7.93 7.84Zm4.32-5.86c-.24-.12-1.4-.69-1.62-.77-.22-.08-.37-.12-.53.12-.16.24-.6.77-.74.93-.14.16-.27.18-.5.06-.24-.12-1-.37-1.92-1.18-.71-.63-1.18-1.4-1.32-1.64-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.53-1.28-.73-1.75-.19-.46-.39-.4-.53-.4h-.45c-.16 0-.42.06-.63.3-.22.24-.83.81-.83 1.98s.85 2.3.97 2.46c.12.16 1.67 2.55 4.05 3.58.57.24 1.01.39 1.36.5.57.18 1.09.16 1.5.1.46-.07 1.4-.57 1.6-1.12.2-.55.2-1.02.14-1.12-.06-.1-.22-.16-.46-.28Z" />
    </svg>
  );
}

export function FacebookIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M14 22v-8.4h2.8l.4-3.3H14V8.1c0-.95.27-1.6 1.63-1.6H17.3V3.5A22 22 0 0 0 14.9 3.4c-2.4 0-4 1.46-4 4.13v2.77H8.1v3.3h2.8V22h3.1Z" />
    </svg>
  );
}

export function InstagramIcon(props: IconProps) {
  return (
    <svg {...base} strokeWidth={1.5} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function YoutubeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M22 8.2a3 3 0 0 0-2.1-2.1C18.1 5.6 12 5.6 12 5.6s-6.1 0-7.9.5A3 3 0 0 0 2 8.2 31 31 0 0 0 1.5 12a31 31 0 0 0 .5 3.8 3 3 0 0 0 2.1 2.1c1.8.5 7.9.5 7.9.5s6.1 0 7.9-.5a3 3 0 0 0 2.1-2.1c.3-1.25.5-2.53.5-3.8a31 31 0 0 0-.5-3.8ZM9.9 15.1V8.9l5.4 3.1-5.4 3.1Z" />
    </svg>
  );
}
