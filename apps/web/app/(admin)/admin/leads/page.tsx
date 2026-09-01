import Link from 'next/link';
import { requireAdminSession } from '@/lib/admin-session';
import { AdminShell } from '@/components/sections/AdminShell';
import { listAdminLeads } from '@/lib/api/admin-leads';

export default async function AdminLeadsPage() {
  const { user, token } = await requireAdminSession();
  const leads = await listAdminLeads(token);

  return (
    <AdminShell user={user}>
      <h1 style={{ fontSize: '1.6rem' }}>Leads ({leads.length})</h1>

      <div className="card" style={{ marginTop: '1.25rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: 'var(--surface-2)', textAlign: 'left' }}>
              <th style={{ padding: '0.7rem 0.9rem' }}>Contacto</th>
              <th style={{ padding: '0.7rem 0.9rem' }}>Canal</th>
              <th style={{ padding: '0.7rem 0.9rem' }}>Fuente</th>
              <th style={{ padding: '0.7rem 0.9rem' }}>Etapa</th>
              <th style={{ padding: '0.7rem 0.9rem' }}>Asesor</th>
              <th style={{ padding: '0.7rem 0.9rem' }} />
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} style={{ borderTop: '1px solid var(--border)' }}>
                <td style={{ padding: '0.7rem 0.9rem' }}>{lead.contactName}</td>
                <td style={{ padding: '0.7rem 0.9rem' }}>{lead.preferredChannel}</td>
                <td style={{ padding: '0.7rem 0.9rem' }}>{lead.source}</td>
                <td style={{ padding: '0.7rem 0.9rem' }}>
                  <span className="badge">{lead.funnelStage}</span>
                </td>
                <td style={{ padding: '0.7rem 0.9rem' }}>{lead.assignedAgentName ?? '—'}</td>
                <td style={{ padding: '0.7rem 0.9rem' }}>
                  <Link href={`/admin/leads/${lead.id}`} style={{ color: 'var(--gold-500)' }}>
                    Ver →
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
