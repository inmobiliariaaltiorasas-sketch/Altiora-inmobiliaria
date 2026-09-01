'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const response = await fetch('/api/admin/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.get('email'), password: form.get('password') }),
    });

    setSubmitting(false);

    if (!response.ok) {
      setError('Credenciales inválidas.');
      return;
    }

    router.push('/admin');
    router.refresh();
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--navy-900)',
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="card"
        style={{ padding: '2rem', width: '22rem', display: 'grid', gap: '1rem' }}
      >
        <div>
          <div
            style={{
              fontFamily: 'var(--font-fraunces), serif',
              fontSize: '1.3rem',
              color: 'var(--navy-900)',
            }}
          >
            ALTIORA
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Panel administrativo
          </div>
        </div>

        <div className="field">
          <label htmlFor="login-email">Email</label>
          <input id="login-email" name="email" type="email" required autoComplete="username" />
        </div>

        <div className="field">
          <label htmlFor="login-password">Contraseña</label>
          <input
            id="login-password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Ingresando…' : 'Ingresar'}
        </button>

        {error ? <p style={{ color: '#b3261e', fontSize: '0.85rem', margin: 0 }}>{error}</p> : null}
      </form>
    </main>
  );
}
