import Link from 'next/link';
import type { ReactNode } from 'react';
import type { AuthenticatedUserDto } from '@altiora/shared-types';
import { AdminLogoutButton } from './AdminLogoutButton';

export function AdminShell({
  user,
  children,
}: {
  user: AuthenticatedUserDto;
  children: ReactNode;
}) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)' }}>
      <header style={{ background: 'var(--navy-900)', color: '#f6f1de' }}>
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.5rem',
          }}
        >
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <Link
              href="/admin"
              style={{
                fontFamily: 'var(--font-fraunces), serif',
                fontSize: '1.15rem',
                color: '#f6f1de',
                textDecoration: 'none',
              }}
            >
              ALTIORA · Admin
            </Link>
            <Link
              href="/admin/propiedades"
              style={{ color: '#e6e2d2', textDecoration: 'none', fontSize: '0.9rem' }}
            >
              Propiedades
            </Link>
            <Link
              href="/admin/leads"
              style={{ color: '#e6e2d2', textDecoration: 'none', fontSize: '0.9rem' }}
            >
              Leads
            </Link>
            <Link
              href="/admin/blog"
              style={{ color: '#e6e2d2', textDecoration: 'none', fontSize: '0.9rem' }}
            >
              Blog
            </Link>
            <Link
              href="/admin/analytics"
              style={{ color: '#e6e2d2', textDecoration: 'none', fontSize: '0.9rem' }}
            >
              Analítica
            </Link>
            <Link
              href="/admin/ciudades"
              style={{ color: '#e6e2d2', textDecoration: 'none', fontSize: '0.9rem' }}
            >
              Ciudades
            </Link>
            <Link
              href="/admin/configuracion"
              style={{ color: '#e6e2d2', textDecoration: 'none', fontSize: '0.9rem' }}
            >
              Configuración
            </Link>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#9aa3c2' }}>
              {user.name} · {user.roleName}
            </span>
            <AdminLogoutButton />
          </div>
        </div>
      </header>
      <main className="container" style={{ padding: '2rem 1.5rem' }}>
        {children}
      </main>
    </div>
  );
}
