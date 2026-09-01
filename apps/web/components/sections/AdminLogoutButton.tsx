'use client';

import { useRouter } from 'next/navigation';

export function AdminLogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/admin/session', { method: 'DELETE' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="btn btn-outline"
      style={{ borderColor: '#3a4670', color: '#e6e2d2' }}
    >
      Salir
    </button>
  );
}
