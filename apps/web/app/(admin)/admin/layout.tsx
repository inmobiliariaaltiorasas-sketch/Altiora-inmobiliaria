import type { ReactNode } from 'react';
import type { Metadata } from 'next';

/** The admin panel is internal: never indexed, never followed (pages below may be client components). */
export const metadata: Metadata = {
  // Overrides the public brand template: admin tabs are labelled as the internal panel.
  title: { default: 'ALTiora Admin', template: '%s | ALTiora Admin' },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}
