import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, CheckCircle, Clock, Info, Package, RefreshCw } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://backend-gaby.vercel.app';
const today = new Date().toISOString().slice(0, 10);

const categoryLabels = {
  monthly: 'Planos mensais',
  moment: 'Escolha seu Momento',
};

const weekdayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

async function api(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Nao foi possivel continuar');
  }

  return data;
}

const formatMoney = (cents = 0) => `R$ ${(Number(cents || 0) / 100).toFixed(2).replace('.', ',')}`;

const addDays = (date, amount) => {
  const [year, month, day] = String(date).split('-').map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + amount));
  return next.toISOString().slice(0, 10);
};

const dateWeekday = (date) => {
  const [year, month, day] = String(date).split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
};

export default function Agendamento() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'moment');
  const [selectedService, setSelectedService] = useState(null);
  const [date, setDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slotsByDate, setSlotsByDate] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingCalendar, setLoadingCalendar] = useState(false);
  const [message, setMessage] = useState('');

  const serviceIdParam = searchParams.get('serviceId');
  const appointmentId = searchParams.get('appointmentId');
  const calendarDays = useMemo(() => Array.from({ length: 30 }, (_, index) => addDays(today, index)), []);
  const selectedDateSlots = date ? slotsByDate[date] || [] : [];
  const availableSlots = selectedDateSlots.filter((slot) => slot.available);

  const categoryTabs = useMemo(() => {
    const serviceCategories = [...new Set(services.map((service) => service.category || 'moment'))];
    return ['monthly', 'moment']
      .filter((category) => serviceCategories.includes(category))
      .concat(serviceCategories.filter((category) => !['monthly', 'moment'].includes(category)));
  }, [services]);

  const filteredServices = useMemo(
    () => services.filter((service) => (service.category || 'moment') === selectedCategory),
    [services, selectedCategory],
  );

  useEffect(() => {
    let active = true;

    api('/api/services')
      .then((data) => {
        if (!active) return;
        const targetService = data.find((service) => service.id === serviceIdParam);
        const initialCategory = targetService?.category || searchParams.get('category') || selectedCategory;

        setServices(data);
        setSelectedCategory(initialCategory);
        setSelectedService(targetService || null);
      })
      .catch((error) => setMessage(error.message))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [serviceIdParam]);

  useEffect(() => {
    if (!selectedService) return;

    let active = true;
    setDate('');
    setSelectedSlot(null);
    setSlotsByDate({});
    setLoadingCalendar(true);
    setMessage('');

    Promise.all(
      calendarDays.map((day) => (
        api(`/api/availability?date=${day}&serviceId=${selectedService.id}`)
          .then((data) => [day, data.slots || []])
          .catch(() => [day, []])
      )),
    )
      .then((entries) => {
        if (active) setSlotsByDate(Object.fromEntries(entries));
      })
      .finally(() => active && setLoadingCalendar(false));

    return () => {
      active = false;
    };
  }, [selectedService, calendarDays]);

  const openCalendar = (service) => {
    setSelectedService(service);
    setSearchParams({
      serviceId: service.id,
      category: service.category || 'moment',
      ...(appointmentId ? { appointmentId } : {}),
    });
  };

  const chooseDate = (day) => {
    const daySlots = slotsByDate[day] || [];
    if (!daySlots.some((slot) => slot.available)) return;
    setDate(day);
    setSelectedSlot(null);
  };

  const confirmAppointment = async () => {
    if (!selectedService || !date || !selectedSlot) {
      setMessage('Escolha um dia e um horario.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      if (appointmentId) {
        await api(`/api/appointments/${appointmentId}/reschedule`, {
          method: 'PATCH',
          body: JSON.stringify({
            serviceId: selectedService.id,
            date,
            time: selectedSlot.time,
          }),
        });
      } else {
        await api('/api/appointments', {
          method: 'POST',
          body: JSON.stringify({
            serviceId: selectedService.id,
            date,
            time: selectedSlot.time,
          }),
        });
      }

      navigate('/usuario');
    } catch (error) {
      setMessage(error.message === 'Nao autorizado' ? 'Entre novamente para confirmar o agendamento.' : error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-brand-pink-light h-full flex items-center justify-center text-sm text-gray-500">
        Carregando agenda...
      </div>
    );
  }

  return (
    <div className="bg-brand-pink-light h-full pt-8 px-5 pb-32 overflow-y-auto no-scrollbar">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 border-l-4 border-brand-pink-dark pl-4 py-1">
        <h2 className="text-2xl font-extrabold text-brand-dark tracking-tighter">
          {selectedService ? 'Escolha o Dia' : 'Escolha seu Momento'}
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          {selectedService ? 'Depois de escolher o dia, selecione um horario livre.' : 'Selecione um servico para abrir o calendario.'}
        </p>
      </motion.div>

      {!selectedService && (
        <>
          {categoryTabs.length > 1 && (
            <div className="flex gap-2 overflow-x-auto mb-4 no-scrollbar">
              {categoryTabs.map((category) => {
                const active = selectedCategory === category;

                return (
                  <button
                    type="button"
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`shrink-0 px-4 py-3 rounded-xl text-xs font-extrabold border transition-all ${active ? 'bg-brand-dark text-white border-brand-dark' : 'bg-white text-gray-500 border-gray-100'}`}
                  >
                    {categoryLabels[category] || category}
                  </button>
                );
              })}
            </div>
          )}

          <section className="space-y-3">
            {filteredServices.map((service, index) => (
              <motion.button
                type="button"
                key={service.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04 }}
                onClick={() => openCalendar(service)}
                className="w-full p-4 bg-white border-2 rounded-2xl text-left transition-all flex justify-between items-center border-gray-100 shadow-sm active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gray-100 text-gray-500">
                    <Package size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-gray-800">{service.name}</h3>
                    <div className="flex items-center text-xs mt-1 gap-2 text-gray-500">
                      <Clock size={12} /> {service.durationMinutes} min
                    </div>
                    {service.description && <p className="text-xs text-gray-400 mt-1">{service.description}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-lg text-brand-dark">{formatMoney(service.priceCents)}</span>
                  <p className="text-[10px] font-bold text-brand-pink-dark mt-1">Abrir agenda</p>
                </div>
              </motion.button>
            ))}

            {!filteredServices.length && (
              <div className="bg-white border border-gray-100 rounded-2xl p-4 text-sm text-gray-500">
                Nenhum servico ativo nesta aba.
              </div>
            )}
          </section>
        </>
      )}

      {selectedService && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <button
              type="button"
              onClick={() => {
                setSelectedService(null);
                setSearchParams({ category: selectedCategory, ...(appointmentId ? { appointmentId } : {}) });
              }}
              className="text-xs font-bold text-gray-500 flex items-center gap-1 mb-3"
            >
              <ArrowLeft size={14} />
              trocar servico
            </button>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-gray-500">{categoryLabels[selectedService.category] || selectedService.category}</p>
                <h3 className="font-extrabold text-brand-dark">{selectedService.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{selectedService.durationMinutes} min</p>
              </div>
              <span className="font-extrabold text-brand-dark">{formatMoney(selectedService.priceCents)}</span>
            </div>
          </div>

          <section className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-extrabold text-brand-dark">Calendario</h3>
                <p className="text-xs text-gray-500">Dias em cinza estao indisponiveis.</p>
              </div>
              {loadingCalendar && <RefreshCw size={18} className="text-gray-400 animate-spin" />}
            </div>

            <div className="grid grid-cols-5 gap-2">
              {calendarDays.map((day) => {
                const slots = slotsByDate[day] || [];
                const available = slots.some((slot) => slot.available);
                const selected = date === day;
                const disabled = loadingCalendar || !available;

                return (
                  <button
                    type="button"
                    key={day}
                    disabled={disabled}
                    onClick={() => chooseDate(day)}
                    className={`rounded-xl border p-2 text-left transition-all ${selected ? 'bg-brand-dark text-white border-brand-dark' : disabled ? 'bg-gray-100 text-gray-400 border-gray-100' : 'bg-brand-pink-light text-brand-dark border-brand-pink'}`}
                  >
                    <span className="block text-[10px] font-bold">{weekdayLabels[dateWeekday(day)]}</span>
                    <span className="block text-sm font-extrabold">{day.slice(8, 10)}</span>
                    <span className="block text-[9px] mt-1">{available ? 'Livre' : 'Indisp.'}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {date && (
            <section className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-4">
              <div>
                <h3 className="font-extrabold text-brand-dark">Horarios de {date}</h3>
                <p className="text-xs text-gray-500">{availableSlots.length} horario(s) disponiveis.</p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {availableSlots.map((slot) => (
                  <button
                    type="button"
                    key={`${slot.startTime}-${slot.endTime}`}
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-3 rounded-xl font-bold text-sm border transition-all ${selectedSlot?.time === slot.time ? 'bg-brand-dark text-white border-brand-dark' : 'bg-brand-pink-light border-brand-pink text-brand-dark'}`}
                  >
                    {slot.startTime}
                  </button>
                ))}
              </div>

              {!availableSlots.length && (
                <div className="flex items-center text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <Info size={14} className="mr-2 text-blue-400" />
                  Nenhum horario disponivel para esta data.
                </div>
              )}

              {selectedSlot && (
                <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                  Horario selecionado: {selectedSlot.startTime} ate {selectedSlot.endTime}
                </p>
              )}
            </section>
          )}

          {message && <p className="text-sm text-center text-gray-600">{message}</p>}

          <button
            type="button"
            onClick={confirmAppointment}
            disabled={loading || !date || !selectedSlot}
            className="w-full bg-brand-dark text-white p-4 rounded-2xl font-extrabold text-base shadow-lg hover:bg-black transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
          >
            {appointmentId ? 'Confirmar Novo Horario' : 'Confirmar e Agendar'}
          </button>
        </div>
      )}
    </div>
  );
}
