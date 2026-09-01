'use client';

import { useFormStatus } from 'react-dom';
import type { ButtonHTMLAttributes } from 'react';

/**
 * Sin esto, un click sobre un <button type="submit"> plano durante la revalidación de una
 * Server Action anterior se pierde en silencio (el DOM se reconcilia a mitad del click) — el
 * usuario ve "no pasa nada". `useFormStatus` deshabilita el botón y muestra estado mientras
 * su propio <form> está pendiente, evitando el doble click a ciegas.
 */
export function SubmitButton({
  children,
  pendingLabel,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { pendingLabel?: string }) {
  const { pending } = useFormStatus();

  return (
    <button {...props} type="submit" disabled={pending || props.disabled}>
      {pending ? (pendingLabel ?? 'Guardando…') : children}
    </button>
  );
}

/** Como SubmitButton, pero pide confirmación antes de dejar pasar el submit — para acciones
 * destructivas e irreversibles (ej. borrar una propiedad). */
export function ConfirmSubmitButton({
  children,
  pendingLabel,
  confirmMessage,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { pendingLabel?: string; confirmMessage: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      {...props}
      type="submit"
      disabled={pending || props.disabled}
      onClick={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      {pending ? (pendingLabel ?? 'Eliminando…') : children}
    </button>
  );
}
