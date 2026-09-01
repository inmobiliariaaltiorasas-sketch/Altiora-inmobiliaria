import { requireAdminSession } from '@/lib/admin-session';
import { AdminShell } from '@/components/sections/AdminShell';
import { getAdminAnalyticsSummary, getCampaignsSummary } from '@/lib/api/admin-analytics';

export default async function AdminAnalyticsPage() {
  const { user, token } = await requireAdminSession();
  const [summary, campaigns] = await Promise.all([
    getAdminAnalyticsSummary(token),
    getCampaignsSummary(token),
  ]);

  return (
    <AdminShell user={user}>
      <h1 style={{ fontSize: '1.6rem' }}>Analítica</h1>
      <p style={{ color: 'var(--text-muted)', marginTop: '0.3rem' }}>
        Conversión real por etapa, campañas que originan y convierten leads, y propiedades más
        consultadas — datos calculados en vivo, sin terceros de por medio (v1 sección 15).
      </p>

      <div className="card" style={{ padding: '1.25rem', marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '1.05rem' }}>Funnel</h2>
        <div style={{ display: 'grid', gap: '0.4rem', marginTop: '0.75rem' }}>
          {summary.funnel.map((row) => (
            <div
              key={row.stage}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.9rem',
                borderTop: '1px solid var(--border)',
                paddingTop: '0.35rem',
              }}
            >
              <span>{row.stage}</span>
              <strong>{row.count}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: '1.25rem', marginTop: '1.25rem', overflowX: 'auto' }}>
        <h2 style={{ fontSize: '1.05rem' }}>
          Campañas ({campaigns.totalLeads} leads · {campaigns.totalWon} ganados)
        </h2>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.85rem',
            marginTop: '0.75rem',
          }}
        >
          <thead>
            <tr style={{ textAlign: 'left', color: 'var(--text-muted)' }}>
              <th style={{ padding: '0.5rem 0.6rem' }}>Fuente</th>
              <th style={{ padding: '0.5rem 0.6rem' }}>Campaña (último touch)</th>
              <th style={{ padding: '0.5rem 0.6rem' }}>Leads</th>
              <th style={{ padding: '0.5rem 0.6rem' }}>Ganados</th>
              <th style={{ padding: '0.5rem 0.6rem' }}>Propiedades convertidas</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.rows.map((row) => (
              <tr
                key={`${row.source}-${row.utmCampaign}`}
                style={{ borderTop: '1px solid var(--border)' }}
              >
                <td style={{ padding: '0.5rem 0.6rem' }}>{row.source}</td>
                <td style={{ padding: '0.5rem 0.6rem' }}>{row.utmCampaign ?? '—'}</td>
                <td style={{ padding: '0.5rem 0.6rem' }}>{row.leadsCount}</td>
                <td style={{ padding: '0.5rem 0.6rem' }}>{row.wonCount}</td>
                <td style={{ padding: '0.5rem 0.6rem' }}>
                  {row.convertedPropertyTitles.join(', ') || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ padding: '1.25rem', marginTop: '1.25rem', overflowX: 'auto' }}>
        <h2 style={{ fontSize: '1.05rem' }}>Propiedades más consultadas</h2>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.85rem',
            marginTop: '0.75rem',
          }}
        >
          <thead>
            <tr style={{ textAlign: 'left', color: 'var(--text-muted)' }}>
              <th style={{ padding: '0.5rem 0.6rem' }}>Propiedad</th>
              <th style={{ padding: '0.5rem 0.6rem' }}>Vistas</th>
              <th style={{ padding: '0.5rem 0.6rem' }}>Consultas de contacto</th>
            </tr>
          </thead>
          <tbody>
            {summary.topProperties.map((property) => (
              <tr key={property.propertyId} style={{ borderTop: '1px solid var(--border)' }}>
                <td style={{ padding: '0.5rem 0.6rem' }}>{property.title}</td>
                <td style={{ padding: '0.5rem 0.6rem' }}>{property.viewCount}</td>
                <td style={{ padding: '0.5rem 0.6rem' }}>{property.inquiryCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
