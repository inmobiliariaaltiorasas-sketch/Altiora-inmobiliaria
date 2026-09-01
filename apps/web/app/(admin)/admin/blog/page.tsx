import Link from 'next/link';
import { requireAdminSession } from '@/lib/admin-session';
import { AdminShell } from '@/components/sections/AdminShell';
import { listAdminBlogPosts } from '@/lib/api/admin-blog';

export default async function AdminBlogPage() {
  const { user, token } = await requireAdminSession();
  const posts = await listAdminBlogPosts(token);

  return (
    <AdminShell user={user}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.6rem' }}>Blog ({posts.length})</h1>
        <Link href="/admin/blog/nueva" className="btn btn-primary">
          + Nuevo artículo
        </Link>
      </div>

      <div className="card" style={{ marginTop: '1.25rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: 'var(--surface-2)', textAlign: 'left' }}>
              <th style={{ padding: '0.7rem 0.9rem' }}>Título</th>
              <th style={{ padding: '0.7rem 0.9rem' }}>Estado</th>
              <th style={{ padding: '0.7rem 0.9rem' }}>Revisión</th>
              <th style={{ padding: '0.7rem 0.9rem' }} />
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} style={{ borderTop: '1px solid var(--border)' }}>
                <td style={{ padding: '0.7rem 0.9rem' }}>{post.translation.title}</td>
                <td style={{ padding: '0.7rem 0.9rem' }}>
                  <span className="badge">{post.status}</span>
                </td>
                <td style={{ padding: '0.7rem 0.9rem' }}>
                  {post.needsReview ? '⚠ pendiente' : '—'}
                </td>
                <td style={{ padding: '0.7rem 0.9rem' }}>
                  <Link href={`/admin/blog/${post.id}`} style={{ color: 'var(--gold-500)' }}>
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
