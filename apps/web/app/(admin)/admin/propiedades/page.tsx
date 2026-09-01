import Link from 'next/link';
import { requireAdminSession } from '@/lib/admin-session';
import { AdminShell } from '@/components/sections/AdminShell';
import { listAdminProperties } from '@/lib/api/admin-properties';
import { formatPrice } from '@/lib/format';

export default async function AdminPropertiesPage() {
  const { user, token } = await requireAdminSession();
  const results = await listAdminProperties(token);

  return (
    <AdminShell user={user}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.6rem' }}>Propiedades ({results.total})</h1>
        <Link href="/admin/propiedades/nueva" className="btn btn-primary">
          + Nueva propiedad
        </Link>
      </div>

      <div className="card" style={{ marginTop: '1.25rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: 'var(--surface-2)', textAlign: 'left' }}>
              <th style={{ padding: '0.7rem 0.9rem' }}>Título</th>
              <th style={{ padding: '0.7rem 0.9rem' }}>Ciudad</th>
              <th style={{ padding: '0.7rem 0.9rem' }}>Precio</th>
              <th style={{ padding: '0.7rem 0.9rem' }}>Estado</th>
              <th style={{ padding: '0.7rem 0.9rem' }} />
            </tr>
          </thead>
          <tbody>
            {results.items.map((property) => (
              <tr key={property.id} style={{ borderTop: '1px solid var(--border)' }}>
                <td style={{ padding: '0.7rem 0.9rem' }}>{property.translation.title}</td>
                <td style={{ padding: '0.7rem 0.9rem' }}>{property.location.city.name}</td>
                <td style={{ padding: '0.7rem 0.9rem' }} className="price">
                  {formatPrice(property.price, property.currency, 'es-CO')}
                </td>
                <td style={{ padding: '0.7rem 0.9rem' }}>
                  <span className="badge">{property.status}</span>
                </td>
                <td style={{ padding: '0.7rem 0.9rem' }}>
                  <Link
                    href={`/admin/propiedades/${property.id}`}
                    style={{ color: 'var(--gold-500)' }}
                  >
                    Editar →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
