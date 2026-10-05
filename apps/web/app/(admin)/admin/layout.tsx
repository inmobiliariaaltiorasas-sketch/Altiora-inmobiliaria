import type { ReactNode } from 'react';
import type { Metadata } from 'next';

/** The admin panel is internal: never indexed, never followed (pages below may be client components). */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}
