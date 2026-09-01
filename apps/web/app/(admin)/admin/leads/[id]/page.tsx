import { notFound } from 'next/navigation';
import { requireAdminSession } from '@/lib/admin-session';
import { AdminShell } from '@/components/sections/AdminShell';
import { getAdminLead } from '@/lib/api/admin-leads';
import {
  cancelAppointmentAction,
  confirmAppointmentAction,
  handoffLeadAction,
  markLeadLostAction,
  proposeAppointmentAction,
  updateLeadAction,
} from '@/lib/actions/leads';

const FUNNEL_STAGES = ['LEAD', 'QUALIFIED', 'APPOINTMENT', 'VISIT', 'NEGOTIATION', 'OFFER', 'WON'];

const LOST_REASONS = [
  'BUDGET',
  'NO_RESPONSE',
  'CHOSE_ANOTHER_PROPERTY',
  'FINANCING',
  'NOT_THE_RIGHT_TIME',
  'PROPERTY_SOLD',
  'OTHER',
];

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, token } = await requireAdminSession();
  const lead = await getAdminLead(token, id);
  if (!lead) notFound();

  const updateLead = updateLeadAction.bind(null, id);
  const markLost = markLeadLostAction.bind(null, id);
  const handoff = handoffLeadAction.bind(null, id);
  const proposeAppointment = proposeAppointmentAction.bind(null, id);

  return (
    <AdminShell user={user}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span className="badge">{lead.funnelStage}</span>
          <h1 style={{ fontSize: '1.6rem', marginTop: '0.5rem' }}>{lead.contact.name}</h1>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '2rem', fontWeight: 700 }}>{lead.score}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>score</div>
        </div>
      </div>

      {lead.scoreBreakdown.length > 0 && (
        <div className="card" style={{ padding: '1.25rem', marginTop: '1rem' }}>
          <h2 style={{ fontSize: '1.05rem' }}>Por qué este score</h2>
          <div style={{ display: 'grid', gap: '0.4rem', marginTop: '0.6rem', fontSize: '0.85rem' }}>
            {lead.scoreBreakdown.map((item) => (
              <div key={item.signal} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{item.detail}</span>
                <strong>+{item.points}</strong>
              </div>
            ))}
          </div>
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1.25rem',
          marginTop: '1.25rem',
        }}
      >
        <div className="card" style={{ padding: '1.25rem' }}>
          <h2 style={{ fontSize: '1.05rem' }}>Contacto</h2>
          <dl style={{ fontSize: '0.9rem', marginTop: '0.6rem', display: 'grid', gap: '0.3rem' }}>
            <div>WhatsApp: {lead.contact.whatsapp ?? '—'}</div>
            <div>Teléfono: {lead.contact.phone ?? '—'}</div>
            <div>Email: {lead.contact.email ?? '—'}</div>
            <div>Canal preferido: {lead.preferredChannel}</div>
            <div>Fuente: {lead.source}</div>
          </dl>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <h2 style={{ fontSize: '1.05rem' }}>Atribución</h2>
          <dl style={{ fontSize: '0.85rem', marginTop: '0.6rem', display: 'grid', gap: '0.3rem' }}>
            <div>
              <strong>Primer contacto:</strong>{' '}
              {lead.firstTouch?.utmSource ?? lead.firstTouch?.referrer ?? 'directo'}
              {lead.firstTouch?.utmCampaign ? ` · ${lead.firstTouch.utmCampaign}` : ''}
            </div>
            <div>
              <strong>Último contacto:</strong>{' '}
              {lead.lastTouch?.utmSource ?? lead.lastTouch?.referrer ?? 'directo'}
              {lead.lastTouch?.utmCampaign ? ` · ${lead.lastTouch.utmCampaign}` : ''}
            </div>
          </dl>
        </div>
      </div>

      <div className="card" style={{ padding: '1.25rem', marginTop: '1.25rem' }}>
        <h2 style={{ fontSize: '1.05rem' }}>Propiedades consultadas</h2>
        <div style={{ display: 'grid', gap: '0.5rem', marginTop: '0.75rem' }}>
          {lead.inquiries.map((inquiry) => (
            <div
              key={inquiry.id}
              style={{
                fontSize: '0.9rem',
                borderTop: '1px solid var(--border)',
                paddingTop: '0.5rem',
              }}
            >
              <strong>{inquiry.propertyTitle}</strong> — {inquiry.inquiryType} · interés{' '}
              {inquiry.interestLevel}
            </div>
          ))}
        </div>
      </div>

      {lead.conversation && (
        <div className="card" style={{ padding: '1.25rem', marginTop: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.05rem' }}>
              Conversación ({lead.conversation.channel === 'WHATSAPP' ? 'WhatsApp' : 'Web'})
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className="badge">
                {lead.conversation.status === 'HUMAN' ? 'con asesor' : 'bot'}
              </span>
              {lead.conversation.status === 'BOT' && (
                <form action={handoff}>
                  <button type="submit" className="btn btn-outline" style={{ fontSize: '0.8rem' }}>
                    Tomar conversación
                  </button>
                </form>
              )}
            </div>
          </div>
          <div
            style={{
              display: 'grid',
              gap: '0.5rem',
              marginTop: '0.75rem',
              maxHeight: '18rem',
              overflowY: 'auto',
            }}
          >
            {lead.conversation.messages.map((message, index) => (
              <div
                key={index}
                style={{
                  fontSize: '0.85rem',
                  alignSelf: message.direction === 'IN' ? 'flex-start' : 'flex-end',
                  maxWidth: '80%',
                  background: message.direction === 'IN' ? 'var(--surface-2)' : '#f3e9c9',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.5rem',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {message.content}
              </div>
            ))}
          </div>
        </div>
      )}

      {lead.activities.length > 0 && (
        <div className="card" style={{ padding: '1.25rem', marginTop: '1.25rem' }}>
          <h2 style={{ fontSize: '1.05rem' }}>Historial de actividad</h2>
          <div
            style={{ display: 'grid', gap: '0.4rem', marginTop: '0.75rem', fontSize: '0.85rem' }}
          >
            {lead.activities.map((activity) => (
              <div key={activity.id} style={{ display: 'flex', gap: '0.75rem' }}>
                <span style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {new Date(activity.occurredAt).toLocaleString('es-CO')}
                </span>
                <span>{activity.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card" style={{ padding: '1.25rem', marginTop: '1.25rem' }}>
        <h2 style={{ fontSize: '1.05rem' }}>Citas</h2>

        {lead.appointments.length > 0 && (
          <div
            style={{ display: 'grid', gap: '0.6rem', marginTop: '0.75rem', fontSize: '0.85rem' }}
          >
            {lead.appointments.map((appointment) => {
              const confirm = confirmAppointmentAction.bind(null, id, appointment.id, user.id);
              const cancel = cancelAppointmentAction.bind(null, id, appointment.id);
              return (
                <div
                  key={appointment.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid var(--border)',
                    paddingTop: '0.5rem',
                  }}
                >
                  <div>
                    <strong>{appointment.propertyTitle}</strong> — {appointment.type} ·{' '}
                    {new Date(appointment.proposedAt).toLocaleString('es-CO')} ·{' '}
                    {appointment.status}
                    {appointment.proposedBySystem ? ' (propuesta por el agente IA)' : ''}
                  </div>
                  {appointment.status === 'PROPOSED' && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <form action={confirm}>
                        <button
                          type="submit"
                          className="btn btn-primary"
                          style={{ fontSize: '0.78rem' }}
                        >
                          Confirmar
                        </button>
                      </form>
                      <form action={cancel}>
                        <button
                          type="submit"
                          className="btn btn-outline"
                          style={{ fontSize: '0.78rem' }}
                        >
                          Cancelar
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {lead.inquiries.length > 0 && (
          <form
            action={proposeAppointment}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr auto',
              gap: '0.6rem',
              alignItems: 'end',
              marginTop: '1rem',
              paddingTop: '0.9rem',
              borderTop: '1px solid var(--border)',
            }}
          >
            <div className="field">
              <label htmlFor="propertyId">Propiedad</label>
              <select
                id="propertyId"
                name="propertyId"
                defaultValue={lead.inquiries[0]?.propertyId}
              >
                {lead.inquiries.map((inquiry) => (
                  <option key={inquiry.propertyId} value={inquiry.propertyId}>
                    {inquiry.propertyTitle}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="type">Tipo</label>
              <select id="type" name="type" defaultValue="VISIT">
                <option value="VISIT">Visita</option>
                <option value="CALL">Llamada</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="proposedAt">Fecha y hora</label>
              <input id="proposedAt" name="proposedAt" type="datetime-local" required />
            </div>
            <button type="submit" className="btn btn-outline" style={{ fontSize: '0.85rem' }}>
              Proponer cita
            </button>
          </form>
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1.25rem',
          marginTop: '1.25rem',
        }}
      >
        <form
          action={updateLead}
          className="card"
          style={{ padding: '1.25rem', display: 'grid', gap: '0.75rem' }}
        >
          <h2 style={{ fontSize: '1.05rem' }}>Actualizar</h2>
          <div className="field">
            <label htmlFor="funnelStage">Etapa</label>
            <select id="funnelStage" name="funnelStage" defaultValue={lead.funnelStage}>
              {FUNNEL_STAGES.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="notes">Notas</label>
            <textarea id="notes" name="notes" rows={3} defaultValue={lead.notes ?? ''} />
          </div>
          <button type="submit" className="btn btn-primary">
            Guardar
          </button>
        </form>

        <form
          action={markLost}
          className="card"
          style={{ padding: '1.25rem', display: 'grid', gap: '0.75rem' }}
        >
          <h2 style={{ fontSize: '1.05rem' }}>Marcar como perdido</h2>
          <div className="field">
            <label htmlFor="reason">Motivo</label>
            <select id="reason" name="reason">
              {LOST_REASONS.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-outline">
            Marcar perdido
          </button>
        </form>
      </div>
    </AdminShell>
  );
}
