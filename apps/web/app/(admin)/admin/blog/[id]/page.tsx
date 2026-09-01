import { notFound } from 'next/navigation';
import { requireAdminSession } from '@/lib/admin-session';
import { AdminShell } from '@/components/sections/AdminShell';
import { getAdminBlogPost } from '@/lib/api/admin-blog';
import {
  publishBlogPostAction,
  unpublishBlogPostAction,
  updateBlogPostAction,
} from '@/lib/actions/blog';

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, token } = await requireAdminSession();
  const post = await getAdminBlogPost(token, id);
  if (!post) notFound();

  const esTranslation = post.translations.find((t) => t.locale === 'es-CO') ?? post.translations[0];
  const updateAction = updateBlogPostAction.bind(null, id);
  const publishAction = publishBlogPostAction.bind(null, id);
  const unpublishAction = unpublishBlogPostAction.bind(null, id);

  return (
    <AdminShell user={user}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span className="badge">{post.status}</span>
          {post.needsReview ? (
            <span className="badge" style={{ marginLeft: '0.5rem', background: '#f3e0c9' }}>
              revisión pendiente
            </span>
          ) : null}
          <h1 style={{ fontSize: '1.6rem', marginTop: '0.5rem' }}>{esTranslation?.title}</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {post.status === 'PUBLISHED' ? (
            <form action={unpublishAction}>
              <button type="submit" className="btn btn-outline">
                Pasar a borrador
              </button>
            </form>
          ) : (
            <form action={publishAction}>
              <button type="submit" className="btn btn-gold">
                Publicar
              </button>
            </form>
          )}
        </div>
      </div>

      <form
        action={updateAction}
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
          <input
            id="title_es"
            name="title_es"
            required
            minLength={3}
            defaultValue={esTranslation?.title}
          />
        </div>
        <div className="field">
          <label htmlFor="excerpt_es">Resumen</label>
          <textarea
            id="excerpt_es"
            name="excerpt_es"
            required
            minLength={10}
            rows={2}
            defaultValue={esTranslation?.excerpt}
          />
        </div>
        <div className="field">
          <label htmlFor="body_es">Contenido</label>
          <textarea
            id="body_es"
            name="body_es"
            required
            minLength={20}
            rows={10}
            defaultValue={esTranslation?.body}
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Guardar
        </button>
      </form>
    </AdminShell>
  );
}
