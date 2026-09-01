import { notFound } from 'next/navigation';
import Image from 'next/image';
import { requireAdminSession } from '@/lib/admin-session';
import { AdminShell } from '@/components/sections/AdminShell';
import { getAdminProperty } from '@/lib/api/admin-properties';
import { getLocationsTree } from '@/lib/api/locations';
import { getPropertyTypes } from '@/lib/api/catalog';
import { resolveMediaUrl } from '@/lib/api-client';
import { formatPrice } from '@/lib/format';
import { ConfirmSubmitButton, SubmitButton } from '@/components/ui/SubmitButton';
import {
  addPropertyMediaAction,
  archivePropertyAction,
  deletePropertyAction,
  featurePropertyAction,
  markSoldPropertyAction,
  pausePropertyAction,
  publishPropertyAction,
  removePropertyMediaAction,
  setCoverMediaAction,
  unfeaturePropertyAction,
  updatePropertyInfoAction,
  updatePropertyPriceAction,
  updatePropertyStructuralAction,
} from '@/lib/actions/properties';

const MAX_PHOTOS = 10;

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, token } = await requireAdminSession();
  const [property, cities, propertyTypes] = await Promise.all([
    getAdminProperty(token, id),
    getLocationsTree(),
    getPropertyTypes(),
  ]);
  if (!property) notFound();

  const updatePrice = updatePropertyPriceAction.bind(null, id);
  const addMedia = addPropertyMediaAction.bind(null, id);
  const updateInfo = updatePropertyInfoAction.bind(null, id);
  const updateStructural = updatePropertyStructuralAction.bind(null, id);
  const publish = publishPropertyAction.bind(null, id);
  const pause = pausePropertyAction.bind(null, id);
  const markSold = markSoldPropertyAction.bind(null, id);
  const archive = archivePropertyAction.bind(null, id);
  const deleteProperty = deletePropertyAction.bind(null, id);
  const feature = featurePropertyAction.bind(null, id);
  const unfeature = unfeaturePropertyAction.bind(null, id);

  const translationEs =
    property.translations.find((t) => t.locale === 'es-CO') ?? property.translations[0];

  const photoCount = property.media.filter((m) => m.type === 'PHOTO').length;
  const remainingPhotos = Math.max(0, MAX_PHOTOS - photoCount);

  return (
    <AdminShell user={user}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <span className="badge">{property.status}</span>
          {property.isFeatured ? (
            <span className="badge" style={{ marginLeft: '0.4rem' }}>
              Destacada
            </span>
          ) : null}
          <h1 style={{ fontSize: '1.6rem', marginTop: '0.5rem' }}>{translationEs?.title}</h1>
          <p style={{ color: 'var(--text-muted)' }}>/propiedades/{property.slug}</p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <form action={publish}>
            <SubmitButton className="btn btn-gold" disabled={property.status === 'PUBLISHED'}>
              Publicar
            </SubmitButton>
          </form>
          <form action={pause}>
            <SubmitButton className="btn btn-outline" disabled={property.status === 'PAUSED'}>
              Pausar
            </SubmitButton>
          </form>
          <form action={markSold}>
            <SubmitButton className="btn btn-outline" disabled={property.status === 'SOLD'}>
              Marcar vendida
            </SubmitButton>
          </form>
          <form action={archive}>
            <SubmitButton className="btn btn-outline" disabled={property.status === 'ARCHIVED'}>
              Archivar
            </SubmitButton>
          </form>
          {property.isFeatured ? (
            <form action={unfeature}>
              <SubmitButton className="btn btn-outline">Quitar destacada</SubmitButton>
            </form>
          ) : (
            <form action={feature}>
              <SubmitButton className="btn btn-outline">Marcar como destacada</SubmitButton>
            </form>
          )}
        </div>
      </div>

      <div className="card" style={{ padding: '1.25rem', marginTop: '1.25rem' }}>
        <h2 style={{ fontSize: '1.1rem' }}>Información de la propiedad</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
          Texto que ve el comprador en la ficha pública.
        </p>
        <form
          action={updateInfo}
          style={{ display: 'grid', gap: '1rem', marginTop: '1rem', maxWidth: '38rem' }}
        >
          <div className="field">
            <label htmlFor="info-title">Título</label>
            <input
              id="info-title"
              name="title_es"
              required
              minLength={3}
              defaultValue={translationEs?.title}
            />
          </div>
          <div className="field">
            <label htmlFor="info-short">Descripción corta</label>
            <textarea
              id="info-short"
              name="shortDescription_es"
              required
              minLength={10}
              rows={2}
              defaultValue={translationEs?.shortDescription}
            />
          </div>
          <div className="field">
            <label htmlFor="info-full">Descripción completa</label>
            <textarea
              id="info-full"
              name="fullDescription_es"
              required
              minLength={20}
              rows={5}
              defaultValue={translationEs?.fullDescription}
            />
          </div>
          <SubmitButton className="btn btn-primary" style={{ justifySelf: 'start' }}>
            Guardar información
          </SubmitButton>
        </form>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1.25rem',
          marginTop: '1.25rem',
        }}
      >
        <div className="card" style={{ padding: '1.25rem' }}>
          <h2 style={{ fontSize: '1.1rem' }}>Precio actual</h2>
          <p className="price" style={{ fontSize: '1.4rem', marginTop: '0.4rem' }}>
            {formatPrice(property.price, property.currency, 'es-CO')}
          </p>
          <form
            action={updatePrice}
            style={{ display: 'flex', gap: '0.6rem', marginTop: '1rem', alignItems: 'flex-end' }}
          >
            <div className="field" style={{ flex: 1 }}>
              <label htmlFor="price">Nuevo precio</label>
              <input id="price" name="price" type="number" min={0} required />
            </div>
            <SubmitButton className="btn btn-primary">Actualizar</SubmitButton>
          </form>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <h2 style={{ fontSize: '1.1rem' }}>Datos estructurales</h2>
          <form
            action={updateStructural}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem',
              marginTop: '0.75rem',
            }}
          >
            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="struct-city">Ciudad</label>
              <select id="struct-city" name="cityId" defaultValue={property.location.city.id} required>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="struct-type">Tipo de propiedad</label>
              <select
                id="struct-type"
                name="propertyTypeId"
                defaultValue={property.propertyType.id}
                required
              >
                {propertyTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="struct-bedrooms">Habitaciones</label>
              <input
                id="struct-bedrooms"
                name="bedrooms"
                type="number"
                min={0}
                required
                defaultValue={property.bedrooms}
              />
            </div>
            <div className="field">
              <label htmlFor="struct-bathrooms">Baños</label>
              <input
                id="struct-bathrooms"
                name="bathrooms"
                type="number"
                min={0}
                required
                defaultValue={property.bathrooms}
              />
            </div>
            <div className="field">
              <label htmlFor="struct-parking">Parqueaderos</label>
              <input
                id="struct-parking"
                name="parkingSpots"
                type="number"
                min={0}
                defaultValue={property.parkingSpots}
              />
            </div>
            <div className="field">
              <label htmlFor="struct-built">Área construida (m²)</label>
              <input
                id="struct-built"
                name="builtAreaM2"
                type="number"
                min={0}
                required
                defaultValue={property.builtAreaM2}
              />
            </div>
            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="struct-land">Área del terreno (m²)</label>
              <input
                id="struct-land"
                name="landAreaM2"
                type="number"
                min={0}
                defaultValue={property.landAreaM2 ?? undefined}
              />
            </div>
            <SubmitButton
              className="btn btn-primary"
              style={{ gridColumn: '1 / -1', justifySelf: 'start' }}
            >
              Guardar datos estructurales
            </SubmitButton>
          </form>
        </div>
      </div>

      <div className="card" style={{ padding: '1.25rem', marginTop: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h2 style={{ fontSize: '1.1rem' }}>Fotografías</h2>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {photoCount}/{MAX_PHOTOS} fotos
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
          {property.media.map((media, index) => {
            const isCover = media.type === 'PHOTO' && index === 0;
            const setCover = setCoverMediaAction.bind(null, id, media.id);
            const removeMedia = removePropertyMediaAction.bind(null, id, media.id);

            return (
              <div key={media.id} style={{ width: '7rem' }}>
                <div
                  style={{
                    position: 'relative',
                    width: '7rem',
                    height: '5.25rem',
                    borderRadius: '6px',
                    overflow: 'hidden',
                  }}
                >
                  <Image
                    src={resolveMediaUrl(media.url)}
                    alt=""
                    fill
                    sizes="112px"
                    style={{ objectFit: 'cover' }}
                  />
                  {isCover ? (
                    <span
                      className="badge"
                      style={{
                        position: 'absolute',
                        top: '0.3rem',
                        left: '0.3rem',
                        fontSize: '0.65rem',
                      }}
                    >
                      Portada
                    </span>
                  ) : null}
                </div>
                <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.35rem' }}>
                  {media.type === 'PHOTO' && !isCover ? (
                    <form action={setCover}>
                      <SubmitButton
                        className="btn btn-outline"
                        style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}
                        pendingLabel="…"
                      >
                        Portada
                      </SubmitButton>
                    </form>
                  ) : null}
                  <form action={removeMedia}>
                    <SubmitButton
                      className="btn btn-outline"
                      style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}
                      pendingLabel="…"
                    >
                      Eliminar
                    </SubmitButton>
                  </form>
                </div>
              </div>
            );
          })}
        </div>

        {remainingPhotos > 0 ? (
          <form
            action={addMedia}
            encType="multipart/form-data"
            style={{ display: 'flex', gap: '0.6rem', marginTop: '1.25rem', alignItems: 'flex-end' }}
          >
            <div className="field">
              <label htmlFor="media-type">Tipo</label>
              <select id="media-type" name="type" defaultValue="PHOTO">
                <option value="PHOTO">Foto</option>
                <option value="VIDEO">Video</option>
                <option value="TOUR">Tour virtual</option>
                <option value="FLOORPLAN">Plano</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="media-file">Archivos (hasta {remainingPhotos} más)</label>
              <input id="media-file" name="file" type="file" multiple required />
            </div>
            <SubmitButton className="btn btn-primary" pendingLabel="Subiendo…">
              Subir
            </SubmitButton>
          </form>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '1.25rem' }}>
            Llegaste al máximo de {MAX_PHOTOS} fotos. Eliminá alguna para subir otra.
          </p>
        )}
      </div>

      <div
        className="card"
        style={{
          padding: '1.25rem',
          marginTop: '1.25rem',
          borderColor: '#b3261e',
        }}
      >
        <h2 style={{ fontSize: '1.1rem', color: '#b3261e' }}>Eliminar propiedad</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
          Borra la propiedad, su historial y sus fotos para siempre. No se puede deshacer — si
          solo querés quitarla de la web, usá &quot;Archivar&quot; en su lugar.
        </p>
        <form action={deleteProperty} style={{ marginTop: '0.85rem' }}>
          <ConfirmSubmitButton
            className="btn btn-outline"
            style={{ color: '#b3261e', borderColor: '#b3261e' }}
            confirmMessage={`¿Eliminar "${translationEs?.title}" para siempre? Esta acción no se puede deshacer.`}
          >
            Eliminar propiedad
          </ConfirmSubmitButton>
        </form>
      </div>
    </AdminShell>
  );
}
