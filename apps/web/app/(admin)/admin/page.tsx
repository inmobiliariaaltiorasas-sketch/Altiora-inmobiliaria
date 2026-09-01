import Link from 'next/link';
import { requireAdminSession } from '@/lib/admin-session';
import { AdminShell } from '@/components/sections/AdminShell';

export default async function AdminDashboardPage() {
  const { user } = await requireAdminSession();

  return (
    <AdminShell user={user}>
      <h1 style={{ fontSize: '1.6rem' }}>Panel administrativo</h1>
      <p style={{ color: 'var(--text-muted)', marginTop: '0.4rem' }}>
        Gestión de propiedades, medios, traducciones y leads. El agente IA y WhatsApp llegan en Fase
        2.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))',
          gap: '1rem',
          marginTop: '1.5rem',
        }}
      >
        <Link
          href="/admin/propiedades"
          className="card"
          style={{ padding: '1.25rem', textDecoration: 'none', color: 'inherit' }}
        >
          <h2 style={{ fontSize: '1.1rem' }}>Propiedades</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.4rem' }}>
            Crear, editar, publicar, pausar, marcar vendida y archivar.
          </p>
        </Link>
        <Link
          href="/admin/leads"
          className="card"
          style={{ padding: '1.25rem', textDecoration: 'none', color: 'inherit' }}
        >
          <h2 style={{ fontSize: '1.1rem' }}>Leads</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.4rem' }}>
            Prospectos, fuente, atribución, historial de contacto y estado del funnel.
          </p>
        </Link>
      </div>
    </AdminShell>
  );
}
