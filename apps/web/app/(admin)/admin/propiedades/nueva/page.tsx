import { requireAdminSession } from '@/lib/admin-session';
import { AdminShell } from '@/components/sections/AdminShell';
import { getLocationsTree } from '@/lib/api/locations';
import { getPropertyTypes } from '@/lib/api/catalog';
import { createPropertyAction } from '@/lib/actions/properties';
import { SubmitButton } from '@/components/ui/SubmitButton';

export default async function NewPropertyPage() {
  const { user } = await requireAdminSession();
  const [cities, propertyTypes] = await Promise.all([getLocationsTree(), getPropertyTypes()]);

  return (
    <AdminShell user={user}>
      <h1 style={{ fontSize: '1.6rem' }}>Nueva propiedad</h1>
      <p style={{ color: 'var(--text-muted)', marginTop: '0.3rem' }}>
        Se crea como borrador (DRAFT). El slug se genera del título + ciudad y no vuelve a cambiar
        (v1 sección 08).
      </p>

      <form
        action={createPropertyAction}
        className="card"
        style={{
          padding: '1.5rem',
          marginTop: '1.25rem',
          display: 'grid',
          gap: '1rem',
          maxWidth: '38rem',
        }}
      >
        <div className="field">
          <label htmlFor="title_es">Título (es-CO)</label>
          <input id="title_es" name="title_es" required minLength={3} />
        </div>
        <div className="field">
          <label htmlFor="shortDescription_es">Descripción corta</label>
          <textarea
            id="shortDescription_es"
            name="shortDescription_es"
            required
            minLength={10}
            rows={2}
          />
        </div>
        <div className="field">
          <label htmlFor="fullDescription_es">Descripción completa</label>
          <textarea
            id="fullDescription_es"
            name="fullDescription_es"
            required
            minLength={20}
            rows={5}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="field">
            <label htmlFor="operationType">Operación</label>
            <select id="operationType" name="operationType" required>
              <option value="SALE">Venta</option>
              <option value="RENT">Arriendo</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="currency">Moneda</label>
            <select id="currency" name="currency">
              <option value="COP">COP</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>

        <div className="field">
          <label htmlFor="price">Precio</label>
          <input id="price" name="price" type="number" min={0} required />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          <div className="field">
            <label htmlFor="bedrooms">Habitaciones</label>
            <input id="bedrooms" name="bedrooms" type="number" min={0} required />
          </div>
          <div className="field">
            <label htmlFor="bathrooms">Baños</label>
            <input id="bathrooms" name="bathrooms" type="number" min={0} required />
          </div>
          <div className="field">
            <label htmlFor="parkingSpots">Parqueaderos</label>
            <input id="parkingSpots" name="parkingSpots" type="number" min={0} defaultValue={0} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="field">
            <label htmlFor="builtAreaM2">Área construida (m²)</label>
            <input id="builtAreaM2" name="builtAreaM2" type="number" min={0} required />
          </div>
          <div className="field">
            <label htmlFor="landAreaM2">Área del terreno (m²)</label>
            <input id="landAreaM2" name="landAreaM2" type="number" min={0} />
          </div>
        </div>

        <div className="field">
          <label htmlFor="cityId">Ciudad</label>
          <select id="cityId" name="cityId" required>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="propertyTypeId">Tipo de propiedad</label>
          <select id="propertyTypeId" name="propertyTypeId" required>
            {propertyTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        <SubmitButton className="btn btn-gold" pendingLabel="Creando…">
          Crear propiedad
        </SubmitButton>
      </form>
    </AdminShell>
  );
}
