import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarClock, Clock, History, RefreshCw, UserCircle, XCircle } from 'lucide-react';
import { authHeaders } from '../lib/auth';

const API_URL = import.meta.env.VITE_API_URL || 'https://backend-gaby.vercel.app';

const statusLabels = {
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmado',
  DONE: 'Concluido',
  CANCELLED: 'Cancelado',
  NO_SHOW: 'Nao compareceu',
};

const activeStatuses = ['PENDING', 'CONFIRMED'];

async function api(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    ...options,
    headers: authHeaders({ 'Content-Type': 'application/json', ...(options.headers || {}) }),
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Nao foi possivel continuar');
  }

  return data;
}

function AppointmentCard({ appointment, onReschedule, onCancel, compact = false }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-extrabold text-brand-dark">{appointment.serviceName}</p>
          <p className="text-xs text-gray-500 mt-1">{appointment.date} - {appointment.startTime} ate {appointment.endTime}</p>
        </div>
        <span className="rounded-full bg-brand-pink-light px-2 py-1 text-[10px] font-bold text-brand-pink-dark">
          {statusLabels[appointment.status] || appointment.status}
        </span>
      </div>

      {!compact && activeStatuses.includes(appointment.status) && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onReschedule(appointment)}
            className="rounded-xl border border-gray-200 p-3 text-xs font-bold text-gray-600 flex items-center justify-center gap-2"
          >
            <RefreshCw size={14} />
            Alterar horario
          </button>
          <button
            type="button"
            onClick={() => onCancel(appointment)}
            className="rounded-xl border border-red-100 bg-red-50 p-3 text-xs font-bold text-red-600 flex items-center justify-center gap-2"
          >
            <XCircle size={14} />
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}

export default function Usuario() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const loadData = async () => {
    setLoading(true);
    setMessage('');

    try {
      const [me, appointmentData] = await Promise.all([
        api('/api/me'),
        api('/api/appointments'),
      ]);

      setUser(me.user);
      setAppointments(appointmentData);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeAppointments = useMemo(
    () => appointments.filter((appointment) => activeStatuses.includes(appointment.status)),
    [appointments],
  );

  const historyAppointments = useMemo(
    () => appointments.filter((appointment) => !activeStatuses.includes(appointment.status)),
    [appointments],
  );

  const reschedule = (appointment) => {
    navigate(`/agendar?serviceId=${appointment.serviceId}&appointmentId=${appointment.id}`);
  };

  const cancelAppointment = async (appointment) => {
    const confirmed = window.confirm(`Cancelar o agendamento de ${appointment.serviceName} em ${appointment.date} as ${appointment.startTime}?`);
    if (!confirmed) return;

    setMessage('');

    try {
      await api(`/api/appointments/${appointment.id}/cancel`, { method: 'PATCH' });
      await loadData();
      setMessage('Agendamento cancelado.');
    } catch (error) {
      setMessage(error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-full bg-gray-50 p-6 flex items-center justify-center text-sm text-gray-500">
        Carregando usuario...
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50 p-5 pb-28 space-y-5">
      <section className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-brand-pink-light flex items-center justify-center text-brand-pink-dark">
            <UserCircle size={28} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-brand-dark">{user?.name || 'Usuario'}</h1>
            <p className="text-xs text-gray-500">{user?.phone}</p>
          </div>
        </div>
      </section>

      {message && (
        <div className="rounded-xl border border-brand-pink bg-white p-3 text-sm text-gray-600">
          {message}
        </div>
      )}

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <CalendarClock size={18} className="text-brand-pink-dark" />
          <h2 className="font-extrabold text-brand-dark">Meus agendamentos</h2>
        </div>

        {activeAppointments.length ? activeAppointments.map((appointment) => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            onReschedule={reschedule}
            onCancel={cancelAppointment}
          />
        )) : (
          <div className="rounded-2xl border border-gray-100 bg-white p-4 text-sm text-gray-500">
            Nenhum agendamento ativo.
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <History size={18} className="text-brand-pink-dark" />
          <h2 className="font-extrabold text-brand-dark">Historico</h2>
        </div>

        {historyAppointments.length ? historyAppointments.map((appointment) => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            compact
          />
        )) : (
          <div className="rounded-2xl border border-gray-100 bg-white p-4 text-sm text-gray-500">
            Seu historico aparecera aqui.
          </div>
        )}
      </section>

      <section className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
        <div className="flex items-center gap-2 text-gray-500">
          <Clock size={16} />
          <p className="text-xs">
            Esta area esta preparada para futuras atualizacoes, notificacoes, confirmacao de presenca e dados completos do cliente.
          </p>
        </div>
      </section>
    </div>
  );
}
