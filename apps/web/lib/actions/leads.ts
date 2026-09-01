'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getAdminAccessToken } from '@/lib/admin-session';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function authedFetch(path: string, init: RequestInit): Promise<Response> {
  const token = await getAdminAccessToken();
  if (!token) redirect('/admin/login');

  return fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...init.headers,
    },
  });
}

export async function updateLeadAction(leadId: string, formData: FormData): Promise<void> {
  const response = await authedFetch(`/admin/leads/${leadId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      funnelStage: formData.get('funnelStage') || undefined,
      notes: formData.get('notes') || undefined,
    }),
  });
  if (!response.ok) throw new Error(`No se pudo actualizar el lead (${response.status})`);
  revalidatePath(`/admin/leads/${leadId}`);
}

export async function markLeadLostAction(leadId: string, formData: FormData): Promise<void> {
  const response = await authedFetch(`/admin/leads/${leadId}/lost`, {
    method: 'PATCH',
    body: JSON.stringify({ reason: formData.get('reason') }),
  });
  if (!response.ok) throw new Error(`No se pudo marcar el lead como perdido (${response.status})`);
  revalidatePath(`/admin/leads/${leadId}`);
}

export async function handoffLeadAction(leadId: string, _formData: FormData): Promise<void> {
  const response = await authedFetch(`/admin/leads/${leadId}/handoff`, { method: 'PATCH' });
  if (!response.ok) throw new Error(`No se pudo tomar la conversación (${response.status})`);
  revalidatePath(`/admin/leads/${leadId}`);
}

export async function proposeAppointmentAction(leadId: string, formData: FormData): Promise<void> {
  const response = await authedFetch(`/admin/leads/${leadId}/appointments`, {
    method: 'POST',
    body: JSON.stringify({
      propertyId: formData.get('propertyId'),
      type: formData.get('type'),
      proposedAt: new Date(String(formData.get('proposedAt'))).toISOString(),
    }),
  });
  if (!response.ok) throw new Error(`No se pudo proponer la cita (${response.status})`);
  revalidatePath(`/admin/leads/${leadId}`);
}

export async function confirmAppointmentAction(
  leadId: string,
  appointmentId: string,
  agentId: string,
): Promise<void> {
  const response = await authedFetch(`/admin/appointments/${appointmentId}/confirm`, {
    method: 'PATCH',
    body: JSON.stringify({ agentId, confirmedAt: new Date().toISOString() }),
  });
  if (!response.ok) throw new Error(`No se pudo confirmar la cita (${response.status})`);
  revalidatePath(`/admin/leads/${leadId}`);
}

export async function cancelAppointmentAction(
  leadId: string,
  appointmentId: string,
): Promise<void> {
  const response = await authedFetch(`/admin/appointments/${appointmentId}/cancel`, {
    method: 'PATCH',
  });
  if (!response.ok) throw new Error(`No se pudo cancelar la cita (${response.status})`);
  revalidatePath(`/admin/leads/${leadId}`);
}
