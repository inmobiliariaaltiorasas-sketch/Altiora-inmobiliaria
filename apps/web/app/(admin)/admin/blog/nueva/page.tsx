import { requireAdminSession } from '@/lib/admin-session';
import { AdminShell } from '@/components/sections/AdminShell';
import { createBlogPostAction } from '@/lib/actions/blog';

export default async function NewBlogPostPage() {
  const { user } = await requireAdminSession();

  return (
    <AdminShell user={user}>
      <h1 style={{ fontSize: '1.6rem' }}>Nuevo artículo</h1>
      <p style={{ color: 'var(--text-muted)', marginTop: '0.3rem' }}>
        Se crea como borrador (DRAFT). El slug se genera del título y no vuelve a cambiar.
      </p>

      <form
        action={createBlogPostAction}
        className="card"
        style={{
          padding: '1.5rem',
          marginTop: '1.25rem',
          display: 'grid',
          gap: '1rem',
          maxWidth: '40rem',
        }}
      >
        <div className="field">
          <label htmlFor="title_es">Título (es-CO)</label>
          <input id="title_es" name="title_es" required minLength={3} />
        </div>
        <div className="field">
          <label htmlFor="excerpt_es">Resumen</label>
          <textarea id="excerpt_es" name="excerpt_es" required minLength={10} rows={2} />
        </div>
        <div className="field">
          <label htmlFor="body_es">Contenido</label>
          <textarea id="body_es" name="body_es" required minLength={20} rows={10} />
        </div>
        <label
          style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem' }}
        >
          <input type="checkbox" name="needsReview" />
          Requiere revisión editorial/legal antes de publicar
        </label>

        <button type="submit" className="btn btn-gold">
          Crear artículo
        </button>
      </form>
    </AdminShell>
  );
}
