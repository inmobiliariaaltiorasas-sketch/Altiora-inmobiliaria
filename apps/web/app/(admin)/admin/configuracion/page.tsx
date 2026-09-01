import { requireAdminSession } from '@/lib/admin-session';
import { AdminShell } from '@/components/sections/AdminShell';
import { getFxRateUsdCop } from '@/lib/api/settings';
import { updateFxRateAction } from '@/lib/actions/settings';

export default async function AdminSettingsPage() {
  const { user } = await requireAdminSession();
  const rate = await getFxRateUsdCop();

  return (
    <AdminShell user={user}>
      <h1 style={{ fontSize: '1.6rem' }}>Configuración</h1>

      <form
        action={updateFxRateAction}
        className="card"
        style={{ padding: '1.25rem', marginTop: '1.25rem', maxWidth: '28rem' }}
      >
        <h2 style={{ fontSize: '1.05rem' }}>Tasa de referencia USD → COP</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
          El precio real de cada propiedad siempre queda almacenado en COP y nunca se modifica. Esta
          tasa solo se usa para mostrar un estimado informativo en pesos convertidos cuando el
          visitante navega en inglés — no es una tasa oficial ni en tiempo real.
        </p>
        <div className="field" style={{ marginTop: '1rem' }}>
          <label htmlFor="rate">1 USD equivale a (COP)</label>
          <input
            id="rate"
            name="rate"
            type="number"
            min={1}
            step="0.01"
            defaultValue={rate}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary" style={{ marginTop: '0.9rem' }}>
          Guardar
        </button>
      </form>
    </AdminShell>
  );
}
