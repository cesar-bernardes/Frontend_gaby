import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  CheckCircle,
  ClipboardList,
  Image as ImageIcon,
  Package,
  Plus,
  RefreshCw,
  Save,
  Settings,
  ShieldCheck,
  Trash2,
  TrendingUp,
  Upload,
  Users,
} from 'lucide-react';
import { authHeaders, clearAuthToken } from '../lib/auth';

const API_URL = import.meta.env.VITE_API_URL || 'https://backend-gaby.vercel.app';
const today = new Date().toISOString().slice(0, 10);

const emptyService = {
  name: '',
  description: '',
  imageUrl: '',
  price: '',
  durationMinutes: 60,
  category: 'moment',
  active: true,
};

const emptyStudio = {
  name: '',
  address: '',
  city: '',
  state: '',
  whatsapp: '',
  instagram: '',
  slotIntervalMinutes: 30,
};

const categoryLabels = {
  monthly: 'Planos mensais',
  moment: 'Escolha seu Momento',
};

const statusLabels = {
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmado',
  DONE: 'Concluido',
  CANCELLED: 'Cancelado',
  NO_SHOW: 'Nao compareceu',
};

async function api(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    ...options,
    headers: authHeaders({ 'Content-Type': 'application/json', ...(options.headers || {}) }),
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthToken();
      throw new Error('Entre novamente para acessar o painel ADM.');
    }

    throw new Error(data.message || 'Nao foi possivel continuar');
  }

  return data;
}

const money = (cents = 0) => `R$ ${(Number(cents || 0) / 100).toFixed(2).replace('.', ',')}`;
const priceToCents = (value) => Math.round(Number(String(value || '0').replace(',', '.')) * 100);
const dateWeekday = (date) => {
  const [year, month, day] = String(date).split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
};
const addDays = (date, amount) => {
  const [year, month, day] = String(date).split('-').map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + amount));
  return next.toISOString().slice(0, 10);
};
const blockAppliesToDate = (block, date) => (
  block.date === date
  || (
    block.recurrence === 'WEEKLY'
    && Number(block.weekday) === dateWeekday(date)
    && String(block.date || '') <= date
  )
);
const weekdayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
      <Icon size={20} className="text-brand-pink-dark mb-2" />
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-extrabold text-brand-dark">{value}</p>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-[11px] font-bold uppercase tracking-wide text-gray-500">{label}</span>
      {children}
    </label>
  );
}

function TextInput(props) {
  return (
    <input
      {...props}
      className={`mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-pink-dark ${props.className || ''}`}
    />
  );
}

const imageFileToDataUrl = (file) => new Promise((resolve, reject) => {
  if (!file) return resolve('');
  if (!file.type.startsWith('image/')) return reject(new Error('Escolha uma imagem valida.'));
  if (file.size > 8 * 1024 * 1024) return reject(new Error('Use uma imagem com ate 8 MB.'));

  const reader = new FileReader();
  reader.onerror = () => reject(new Error('Nao foi possivel carregar a imagem.'));
  reader.onload = () => {
    const image = new window.Image();
    image.onerror = () => resolve(String(reader.result || ''));
    image.onload = () => {
      const maxSize = 1000;
      const scale = Math.min(1, maxSize / image.width, maxSize / image.height);
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      if (!context) return resolve(String(reader.result || ''));
      context.drawImage(image, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    image.src = String(reader.result || '');
  };
  reader.readAsDataURL(file);
});

function Section({ title, icon: Icon, children }) {
  return (
    <section className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <Icon size={18} className="text-brand-pink-dark" />
        <h2 className="font-extrabold text-brand-dark">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const serviceFormRef = useRef(null);
  const [user, setUser] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [studio, setStudio] = useState(null);
  const [studioForm, setStudioForm] = useState(emptyStudio);
  const [services, setServices] = useState([]);
  const [users, setUsers] = useState([]);
  const [availability, setAvailability] = useState({
    dates: [],
    blocks: [],
    defaultSchedule: {
      workDays: [1, 2, 3, 4, 5, 6],
      startTime: '07:00',
      endTime: '17:00',
      sundayEnabled: false,
      slotIntervalMinutes: 30,
    },
  });
  const [appointments, setAppointments] = useState([]);
  const [serviceForm, setServiceForm] = useState(emptyService);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [availabilityForm, setAvailabilityForm] = useState({
    date: today,
  });
  const [blockForm, setBlockForm] = useState({
    date: today,
    startTime: '11:00',
    endTime: '13:00',
    fullDay: false,
    repeatWeekly: false,
    reason: 'Almoco',
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const selectedDateBlocks = useMemo(
    () => availability.blocks.filter((block) => blockAppliesToDate(block, availabilityForm.date)),
    [availability.blocks, availabilityForm.date],
  );

  const selectedDateAppointments = useMemo(
    () => appointments.filter((appointment) => appointment.date === availabilityForm.date),
    [appointments, availabilityForm.date],
  );
  const calendarDays = useMemo(() => Array.from({ length: 30 }, (_, index) => addDays(today, index)), []);

  const loadAdminData = async () => {
    setLoading(true);
    setMessage('');

    try {
      const me = await api('/api/me');
      const currentUser = me.user;

      if (!currentUser || currentUser.role !== 'ADM') {
        setUser(currentUser || null);
        setMessage('Acesso restrito para administradores.');
        return;
      }

      const [dashboardData, studioData, serviceData, userData, availabilityData, appointmentData] = await Promise.all([
        api('/api/admin/dashboard'),
        api('/api/studio'),
        api('/api/admin/services'),
        api('/api/admin/users'),
        api('/api/admin/availability'),
        api('/api/admin/appointments'),
      ]);

      setUser(currentUser);
      setDashboard(dashboardData);
      setStudio(studioData);
      setStudioForm({
        name: studioData.name || '',
        address: studioData.address || '',
        city: studioData.city || '',
        state: studioData.state || '',
        whatsapp: studioData.whatsapp || '',
        instagram: studioData.instagram || '',
        slotIntervalMinutes: studioData.policy?.slotIntervalMinutes || 30,
      });
      setServices(serviceData);
      setUsers(userData);
      setAvailability({
        dates: availabilityData.dates || [],
        blocks: availabilityData.blocks || [],
        defaultSchedule: availabilityData.defaultSchedule || {
          workDays: [1, 2, 3, 4, 5, 6],
          startTime: '07:00',
          endTime: '17:00',
          sundayEnabled: false,
          slotIntervalMinutes: 30,
        },
      });
      setAppointments(appointmentData);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const saveStudio = async (event) => {
    event.preventDefault();
    setMessage('');

    try {
      const updated = await api('/api/studio', {
        method: 'PUT',
        body: JSON.stringify({
          name: studioForm.name,
          address: studioForm.address,
          city: studioForm.city,
          state: studioForm.state,
          whatsapp: studioForm.whatsapp,
          instagram: studioForm.instagram,
          policy: {
            ...(studio?.policy || {}),
            defaultWorkDays: availability.defaultSchedule.workDays,
            defaultStartTime: availability.defaultSchedule.startTime,
            defaultEndTime: availability.defaultSchedule.endTime,
            sundayEnabled: availability.defaultSchedule.sundayEnabled,
            slotIntervalMinutes: Number(studioForm.slotIntervalMinutes || 30),
          },
        }),
      });

      setStudio(updated);
      setMessage('Dados do estudio salvos.');
    } catch (error) {
      setMessage(error.message);
    }
  };

  const saveService = async (event) => {
    event.preventDefault();
    setMessage('');

    try {
      const payload = {
        name: serviceForm.name,
        description: serviceForm.description,
        imageUrl: serviceForm.imageUrl,
        priceCents: priceToCents(serviceForm.price),
        durationMinutes: Number(serviceForm.durationMinutes),
        category: serviceForm.category,
        active: serviceForm.active,
      };

      await api(editingServiceId ? `/api/admin/services/${editingServiceId}` : '/api/admin/services', {
        method: editingServiceId ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      });

      setServiceForm(emptyService);
      setEditingServiceId(null);
      await loadAdminData();
      setActiveTab('services');
      setMessage('Servico salvo.');
    } catch (error) {
      setMessage(error.message);
    }
  };

  const editService = (service) => {
    setEditingServiceId(service.id);
    setServiceForm({
      name: service.name,
      description: service.description || '',
      imageUrl: service.imageUrl || '',
      price: (Number(service.priceCents || 0) / 100).toFixed(2),
      durationMinutes: service.durationMinutes || 60,
      category: service.category || 'moment',
      active: service.active !== false,
    });
    window.requestAnimationFrame(() => {
      serviceFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const updateServicePhoto = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      const imageUrl = await imageFileToDataUrl(file);
      setServiceForm((current) => ({ ...current, imageUrl }));
      setMessage('Foto carregada. Clique em Salvar para aplicar.');
    } catch (error) {
      setMessage(error.message);
    }
  };

  const toggleService = async (service) => {
    setMessage('');

    try {
      if (service.active) {
        await api(`/api/admin/services/${service.id}`, { method: 'DELETE' });
      } else {
        await api(`/api/admin/services/${service.id}`, {
          method: 'PUT',
          body: JSON.stringify({ active: true }),
        });
      }

      await loadAdminData();
      setActiveTab('services');
    } catch (error) {
      setMessage(error.message);
    }
  };

  const saveBlock = async (event) => {
    event.preventDefault();
    setMessage('');

    try {
      await api('/api/admin/availability-blocks', {
        method: 'POST',
        body: JSON.stringify({
          ...blockForm,
          date: availabilityForm.date,
        }),
      });

      await loadAdminData();
      setActiveTab('calendar');
      setMessage('Bloqueio criado.');
    } catch (error) {
      setMessage(error.message);
    }
  };

  const removeBlock = async (id) => {
    setMessage('');

    try {
      await api(`/api/admin/availability-blocks/${id}`, { method: 'DELETE' });
      await loadAdminData();
      setActiveTab('calendar');
    } catch (error) {
      setMessage(error.message);
    }
  };

  const changeRole = async (targetUser) => {
    setMessage('');
    const nextRole = targetUser.role === 'ADM' ? 'CLIENT' : 'ADM';

    try {
      await api(`/api/admin/users/${targetUser.id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: nextRole }),
      });

      await loadAdminData();
      setActiveTab('users');
    } catch (error) {
      setMessage(error.message);
    }
  };

  const changeAppointmentStatus = async (appointmentId, status) => {
    setMessage('');

    try {
      await api(`/api/admin/appointments/${appointmentId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });

      await loadAdminData();
      setActiveTab('appointments');
    } catch (error) {
      setMessage(error.message);
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Resumo', icon: TrendingUp },
    { id: 'studio', label: 'Studio', icon: Settings },
    { id: 'services', label: 'Servicos', icon: Package },
    { id: 'calendar', label: 'Agenda', icon: CalendarDays },
    { id: 'appointments', label: 'Marcacoes', icon: ClipboardList },
    { id: 'users', label: 'Clientes', icon: Users },
  ];

  if (loading) {
    return (
      <div className="min-h-full bg-gray-50 p-6 flex items-center justify-center text-sm text-gray-500">
        Carregando painel...
      </div>
    );
  }

  if (message && user?.role !== 'ADM') {
    return (
      <div className="min-h-full bg-gray-50 p-6 flex items-center justify-center">
        <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm">
          <ShieldCheck className="mx-auto text-brand-pink-dark mb-3" />
          <h1 className="font-extrabold text-brand-dark">Acesso ADM</h1>
          <p className="text-sm text-gray-500 mt-2">{message}</p>
          <button
            type="button"
            onClick={() => {
              clearAuthToken();
              navigate('/');
            }}
            className="mt-5 w-full rounded-xl bg-brand-pink-dark px-4 py-3 text-sm font-bold text-white active:scale-95 transition-transform"
          >
            Entrar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50 p-4 pb-24 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-brand-dark">Painel ADM</h1>
          <p className="text-xs text-gray-500">{user?.name} conectado como ADM</p>
        </div>
        <button
          type="button"
          onClick={loadAdminData}
          className="h-10 w-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-600 shadow-sm"
          title="Atualizar"
        >
          <RefreshCw size={17} />
        </button>
      </div>

      {message && (
        <div className="rounded-xl border border-brand-pink bg-white p-3 text-sm text-gray-600">
          {message}
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;

          return (
            <button
              type="button"
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 rounded-xl border px-3 py-2 text-xs font-bold flex items-center gap-2 ${active ? 'bg-brand-dark text-white border-brand-dark' : 'bg-white text-gray-500 border-gray-100'}`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'dashboard' && dashboard && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={TrendingUp} label="Faturamento mes" value={money(dashboard.totalMonthCents)} />
            <StatCard icon={CalendarDays} label="Agendamentos mes" value={dashboard.appointmentsMonth} />
            <StatCard icon={CheckCircle} label="Servicos concluidos" value={dashboard.servicesDone} />
            <StatCard icon={ClipboardList} label="Pendentes" value={dashboard.pendingAppointments} />
          </div>

          <Section title="Top clientes" icon={Users}>
            {dashboard.ranking?.length ? dashboard.ranking.map((client) => (
              <div key={client.phone} className="flex items-center justify-between border-b border-gray-100 py-2 last:border-0">
                <div>
                  <p className="text-sm font-bold text-gray-800">{client.name}</p>
                  <p className="text-xs text-gray-500">{client.visits} visita(s)</p>
                </div>
                <span className="text-sm font-extrabold text-brand-pink-dark">{money(client.totalCents)}</span>
              </div>
            )) : (
              <p className="text-sm text-gray-500">Ainda nao ha clientes no ranking.</p>
            )}
          </Section>
        </div>
      )}

      {activeTab === 'studio' && (
        <Section title="Dados do Studio" icon={Settings}>
          <form onSubmit={saveStudio} className="space-y-3">
            <Field label="Nome">
              <TextInput value={studioForm.name} onChange={(event) => setStudioForm({ ...studioForm, name: event.target.value })} />
            </Field>
            <Field label="Endereco">
              <TextInput value={studioForm.address} onChange={(event) => setStudioForm({ ...studioForm, address: event.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Cidade">
                <TextInput value={studioForm.city} onChange={(event) => setStudioForm({ ...studioForm, city: event.target.value })} />
              </Field>
              <Field label="Estado">
                <TextInput value={studioForm.state} onChange={(event) => setStudioForm({ ...studioForm, state: event.target.value })} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="WhatsApp">
                <TextInput value={studioForm.whatsapp} onChange={(event) => setStudioForm({ ...studioForm, whatsapp: event.target.value })} />
              </Field>
              <Field label="Instagram">
                <TextInput value={studioForm.instagram} onChange={(event) => setStudioForm({ ...studioForm, instagram: event.target.value })} />
              </Field>
            </div>
            <Field label="Intervalo de horarios (min)">
              <TextInput
                type="number"
                min="5"
                step="5"
                value={studioForm.slotIntervalMinutes}
                onChange={(event) => setStudioForm({ ...studioForm, slotIntervalMinutes: event.target.value })}
              />
            </Field>
            <button type="submit" className="w-full rounded-xl bg-brand-dark p-3 text-sm font-extrabold text-white flex items-center justify-center gap-2">
              <Save size={16} />
              Salvar studio
            </button>
          </form>
        </Section>
      )}

      {activeTab === 'services' && (
        <div className="space-y-4">
          <div ref={serviceFormRef}>
          <Section title={editingServiceId ? 'Editar servico ou combo' : 'Novo servico ou combo'} icon={Package}>
            <form onSubmit={saveService} className="space-y-3">
              <Field label="Nome">
                <TextInput value={serviceForm.name} onChange={(event) => setServiceForm({ ...serviceForm, name: event.target.value })} required />
              </Field>
              <Field label="Descricao opcional">
                <TextInput value={serviceForm.description} onChange={(event) => setServiceForm({ ...serviceForm, description: event.target.value })} />
              </Field>
              <Field label="Foto">
                <div className="mt-1 rounded-xl border border-gray-200 bg-white p-3">
                  {serviceForm.imageUrl ? (
                    <img src={serviceForm.imageUrl} alt={serviceForm.name || 'Foto do servico'} className="h-36 w-full rounded-lg object-cover" />
                  ) : (
                    <div className="flex h-36 w-full flex-col items-center justify-center rounded-lg bg-gray-50 text-gray-400">
                      <ImageIcon size={24} />
                      <span className="mt-2 text-xs font-bold">Sem foto</span>
                    </div>
                  )}
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 p-3 text-xs font-bold text-gray-600">
                      <Upload size={14} />
                      {serviceForm.imageUrl ? 'Trocar foto' : 'Adicionar foto'}
                      <input type="file" accept="image/*" onChange={updateServicePhoto} className="hidden" />
                    </label>
                    <button
                      type="button"
                      onClick={() => setServiceForm({ ...serviceForm, imageUrl: '' })}
                      disabled={!serviceForm.imageUrl}
                      className="rounded-xl border border-gray-200 p-3 text-xs font-bold text-gray-600 disabled:opacity-40"
                    >
                      Remover foto
                    </button>
                  </div>
                  <TextInput
                    value={serviceForm.imageUrl}
                    onChange={(event) => setServiceForm({ ...serviceForm, imageUrl: event.target.value })}
                    placeholder="Ou cole a URL da foto"
                    className="text-xs"
                  />
                </div>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Valor">
                  <TextInput value={serviceForm.price} onChange={(event) => setServiceForm({ ...serviceForm, price: event.target.value })} placeholder="100,00" required />
                </Field>
                <Field label="Duracao min">
                  <TextInput
                    type="number"
                    min="5"
                    value={serviceForm.durationMinutes}
                    onChange={(event) => setServiceForm({ ...serviceForm, durationMinutes: event.target.value })}
                    required
                  />
                </Field>
              </div>
              <Field label="Aba onde aparece">
                <select
                  value={serviceForm.category}
                  onChange={(event) => setServiceForm({ ...serviceForm, category: event.target.value })}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-pink-dark"
                >
                  <option value="monthly">Planos mensais de alongamento e banho de gel</option>
                  <option value="moment">Escolha seu Momento</option>
                </select>
              </Field>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-600">
                <input
                  type="checkbox"
                  checked={serviceForm.active}
                  onChange={(event) => setServiceForm({ ...serviceForm, active: event.target.checked })}
                />
                Ativo para clientes
              </label>
              <div className="grid grid-cols-2 gap-2">
                {editingServiceId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingServiceId(null);
                      setServiceForm(emptyService);
                    }}
                    className="rounded-xl border border-gray-200 p-3 text-sm font-bold text-gray-500"
                  >
                    Cancelar
                  </button>
                )}
                <button type="submit" className={`rounded-xl bg-brand-dark p-3 text-sm font-extrabold text-white flex items-center justify-center gap-2 ${editingServiceId ? 'col-span-1' : 'col-span-2'}`}>
                  <Save size={16} />
                  Salvar
                </button>
              </div>
            </form>
          </Section>
          </div>

          <Section title="Servicos cadastrados" icon={Package}>
            <div className="space-y-2">
              {services.map((service) => (
                <div key={service.id} className="rounded-xl border border-gray-100 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 gap-3">
                      {service.imageUrl ? (
                        <img src={service.imageUrl} alt={service.name} className="h-14 w-14 shrink-0 rounded-xl object-cover" />
                      ) : (
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-gray-300">
                          <ImageIcon size={20} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-extrabold text-gray-800">{service.name}</p>
                        <p className="text-xs text-gray-500">
                          {categoryLabels[service.category] || service.category} - {service.durationMinutes} min - {money(service.priceCents)}
                        </p>
                        {service.description && <p className="text-xs text-gray-400 mt-1">{service.description}</p>}
                      </div>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${service.active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {service.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => editService(service)} className="rounded-xl border border-gray-200 p-2 text-xs font-bold text-gray-600">
                      Editar
                    </button>
                    <button type="button" onClick={() => toggleService(service)} className="rounded-xl border border-gray-200 p-2 text-xs font-bold text-gray-600 flex items-center justify-center gap-1">
                      <Trash2 size={13} />
                      {service.active ? 'Desativar' : 'Ativar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>
      )}

      {activeTab === 'calendar' && (
        <div className="space-y-4">
          <Section title="Agenda padrao" icon={CalendarDays}>
            <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
              <p className="text-sm font-extrabold text-brand-dark">
                Segunda a sabado, {availability.defaultSchedule.startTime} ate {availability.defaultSchedule.endTime}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Domingo fica indisponivel por padrao. Use bloqueios apenas para excecoes.
              </p>
            </div>
            <Field label="Data selecionada">
              <TextInput
                type="date"
                value={availabilityForm.date}
                onChange={(event) => {
                  setAvailabilityForm({ date: event.target.value });
                  setBlockForm({ ...blockForm, date: event.target.value });
                }}
                required
              />
            </Field>
            <div className="grid grid-cols-5 gap-2">
              {calendarDays.map((date) => {
                const weekday = dateWeekday(date);
                const dayBlocks = availability.blocks.filter((block) => blockAppliesToDate(block, date));
                const fullDayBlocked = dayBlocks.some((block) => block.fullDay);
                const isClosed = weekday === 0 && !availability.defaultSchedule.sundayEnabled;
                const selected = availabilityForm.date === date;

                return (
                  <button
                    type="button"
                    key={date}
                    onClick={() => {
                      setAvailabilityForm({ date });
                      setBlockForm({ ...blockForm, date });
                    }}
                    className={`rounded-xl border p-2 text-left ${selected ? 'bg-brand-dark text-white border-brand-dark' : 'bg-white border-gray-100 text-gray-700'}`}
                  >
                    <span className="block text-[10px] font-bold">{weekdayLabels[weekday]}</span>
                    <span className="block text-sm font-extrabold">{date.slice(8, 10)}</span>
                    <span className={`block text-[9px] mt-1 ${selected ? 'text-white/80' : 'text-gray-400'}`}>
                      {fullDayBlocked ? 'Bloq.' : isClosed ? 'Fechado' : dayBlocks.length ? 'Parcial' : 'Livre'}
                    </span>
                  </button>
                );
              })}
            </div>
          </Section>

          <Section title="Novo bloqueio" icon={Plus}>
            <form onSubmit={saveBlock} className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-600">
                <input
                  type="checkbox"
                  checked={blockForm.fullDay}
                  onChange={(event) => setBlockForm({ ...blockForm, fullDay: event.target.checked })}
                />
                Bloquear o dia inteiro
              </label>
              {!blockForm.fullDay && (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Inicio">
                    <TextInput type="time" value={blockForm.startTime} onChange={(event) => setBlockForm({ ...blockForm, startTime: event.target.value })} required />
                  </Field>
                  <Field label="Fim">
                    <TextInput type="time" value={blockForm.endTime} onChange={(event) => setBlockForm({ ...blockForm, endTime: event.target.value })} required />
                  </Field>
                </div>
              )}
              <label className="flex items-center gap-2 text-sm font-bold text-gray-600">
                <input
                  type="checkbox"
                  checked={blockForm.repeatWeekly}
                  onChange={(event) => setBlockForm({ ...blockForm, repeatWeekly: event.target.checked })}
                />
                Repetir toda semana neste dia
              </label>
              <Field label="Motivo">
                <TextInput value={blockForm.reason} onChange={(event) => setBlockForm({ ...blockForm, reason: event.target.value })} />
              </Field>
              <button type="submit" className="w-full rounded-xl bg-brand-pink-dark p-3 text-sm font-extrabold text-white flex items-center justify-center gap-2">
                <Plus size={16} />
                Criar bloqueio
              </button>
            </form>
          </Section>

          <Section title={`Bloqueios em ${availabilityForm.date}`} icon={Trash2}>
            <div className="space-y-2">
              {selectedDateBlocks.map((block) => (
                <div key={block.id} className="rounded-xl border border-gray-100 p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-extrabold text-gray-800">
                      {block.fullDay ? 'Dia inteiro' : `${block.startTime} ate ${block.endTime}`}
                    </p>
                    <p className="text-xs text-gray-500">
                      {block.reason || 'Sem motivo informado'}
                      {block.recurrence === 'WEEKLY' ? ' - semanal' : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeBlock(block.id)}
                    className="h-9 w-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500"
                    title="Remover bloqueio"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
              {!selectedDateBlocks.length && <p className="text-sm text-gray-500">Sem bloqueios nesta data.</p>}
            </div>
          </Section>

          <Section title={`Agendamentos em ${availabilityForm.date}`} icon={ClipboardList}>
            <div className="space-y-2">
              {selectedDateAppointments.map((appointment) => (
                <div key={appointment.id} className="rounded-xl border border-gray-100 p-3">
                  <p className="text-sm font-extrabold text-gray-800">{appointment.startTime} ate {appointment.endTime}</p>
                  <p className="text-xs text-gray-500">{appointment.clientName} - {appointment.serviceName}</p>
                  <p className="text-xs font-bold text-brand-pink-dark mt-1">{statusLabels[appointment.status] || appointment.status}</p>
                </div>
              ))}
              {!selectedDateAppointments.length && <p className="text-sm text-gray-500">Nenhum agendamento nesta data.</p>}
            </div>
          </Section>
        </div>
      )}

      {activeTab === 'appointments' && (
        <Section title="Lista de agendamentos" icon={ClipboardList}>
          <div className="space-y-2">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="rounded-xl border border-gray-100 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-extrabold text-gray-800">{appointment.clientName}</p>
                    <p className="text-xs text-gray-500">{appointment.serviceName}</p>
                    <p className="text-xs text-gray-500">{appointment.date} - {appointment.startTime} ate {appointment.endTime}</p>
                  </div>
                  <span className="text-xs font-extrabold text-brand-pink-dark">{money(appointment.totalCents)}</span>
                </div>
                <select
                  value={appointment.status}
                  onChange={(event) => changeAppointmentStatus(appointment.id, event.target.value)}
                  className="mt-3 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-pink-dark"
                >
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            ))}
            {!appointments.length && <p className="text-sm text-gray-500">Nenhum agendamento encontrado.</p>}
          </div>
        </Section>
      )}

      {activeTab === 'users' && (
        <Section title="Clientes e permissoes" icon={Users}>
          <div className="space-y-2">
            {users.map((item) => (
              <div key={item.id} className="rounded-xl border border-gray-100 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-extrabold text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.phone}</p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${item.role === 'ADM' ? 'bg-brand-pink-light text-brand-pink-dark' : 'bg-gray-100 text-gray-500'}`}>
                    {item.role}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => changeRole(item)}
                  className="mt-3 w-full rounded-xl border border-gray-200 p-2 text-xs font-bold text-gray-600 flex items-center justify-center gap-2"
                >
                  <ShieldCheck size={14} />
                  {item.role === 'ADM' ? 'Voltar para CLIENT' : 'Transformar em ADM'}
                </button>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
