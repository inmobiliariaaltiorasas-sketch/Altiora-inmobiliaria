import { requireAdminSession } from '@/lib/admin-session';
import { AdminShell } from '@/components/sections/AdminShell';
import { getLocationsTree } from '@/lib/api/locations';
import { createCityAction } from '@/lib/actions/cities';

export default async function AdminCitiesPage() {
  const { user } = await requireAdminSession();
  const cities = await getLocationsTree();

  return (
    <AdminShell user={user}>
      <h1 style={{ fontSize: '1.6rem' }}>Ciudades ({cities.length})</h1>

      <div className="card" style={{ marginTop: '1.25rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: 'var(--surface-2)', textAlign: 'left' }}>
              <th style={{ padding: '0.7rem 0.9rem' }}>Nombre</th>
              <th style={{ padding: '0.7rem 0.9rem' }}>Departamento</th>
              <th style={{ padding: '0.7rem 0.9rem' }}>Slug</th>
              <th style={{ padding: '0.7rem 0.9rem' }}>Barrios</th>
            </tr>
          </thead>
          <tbody>
            {cities.map((city) => (
              <tr key={city.id} style={{ borderTop: '1px solid var(--border)' }}>
                <td style={{ padding: '0.7rem 0.9rem' }}>{city.name}</td>
                <td style={{ padding: '0.7rem 0.9rem' }}>{city.department}</td>
                <td style={{ padding: '0.7rem 0.9rem' }}>{city.slug}</td>
                <td style={{ padding: '0.7rem 0.9rem' }}>{city.neighborhoods.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form
        action={createCityAction}
        className="card"
        style={{
          padding: '1.25rem',
          marginTop: '1.5rem',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr auto',
          gap: '0.75rem',
          alignItems: 'end',
          maxWidth: '48rem',
        }}
      >
        <div className="field">
          <label htmlFor="name">Nombre</label>
          <input id="name" name="name" required placeholder="Cali" />
        </div>
        <div className="field">
          <label htmlFor="slug">Slug</label>
          <input id="slug" name="slug" required placeholder="cali" />
        </div>
        <div className="field">
          <label htmlFor="department">Departamento</label>
          <input id="department" name="department" required placeholder="Valle del Cauca" />
        </div>
        <button type="submit" className="btn btn-primary">
          + Agregar ciudad
        </button>
      </form>
    </AdminShell>
  );
}
