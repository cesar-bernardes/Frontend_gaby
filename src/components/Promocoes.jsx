import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, MessageCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://backend-gaby.vercel.app';

const fallbackBenefits = {
  premium: ['Manutencao completa', 'Esmaltacao em gel tradicional', 'Francesinha', 'Todo tipo de nail art', 'Cutilagem'],
  gold: ['Manutencao completa', 'Esmaltacao em gel tradicional', 'Francesinha', 'Cutilagem'],
  star: ['Manutencao completa', 'Esmaltacao em gel tradicional', 'Francesinha', 'Cutilagem'],
};

async function api(path) {
  const response = await fetch(`${API_URL}${path}`, { credentials: 'include' });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Nao foi possivel carregar os planos');
  }

  return data;
}

const money = (cents = 0) => `R$ ${(Number(cents || 0) / 100).toFixed(2).replace('.', ',')}`;
const planKey = (name = '') => {
  const lower = name.toLowerCase();
  if (lower.includes('premium')) return 'premium';
  if (lower.includes('gold')) return 'gold';
  return 'star';
};

function PlanCard({ service, onSelect }) {
  const benefits = fallbackBenefits[planKey(service.name)] || fallbackBenefits.gold;

  return (
    <div className="min-w-[280px] snap-center bg-white p-5 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#FFF0F5] flex flex-col">
      <div className="w-full h-36 bg-gray-100 rounded-2xl mb-5 flex flex-col items-center justify-center text-gray-300 border-2 border-dashed border-gray-200">
        <span className="text-xs font-semibold uppercase tracking-widest">Espaco para Foto</span>
      </div>

      <h3 className="text-center text-lg font-serif text-[#D4AF37] mb-1 uppercase tracking-widest font-bold">
        {service.name.replace(/^Plano\s+/i, '')}
      </h3>
      <p className="text-center text-3xl font-extrabold text-[#2C3E50] mb-1">
        {money(service.priceCents)}
      </p>
      <p className="text-center text-xs text-gray-500 mb-5 px-2 font-medium">
        {service.durationMinutes} minutos de atendimento
      </p>

      <ul className="text-xs text-gray-600 space-y-3 mb-6 flex-grow">
        {benefits.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <Check size={14} className="text-[#DB7093] shrink-0 mt-[2px]" strokeWidth={3} />
            <span className="font-medium">{item}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => onSelect(service)}
        className="w-full bg-[#2C3E50] text-white py-3.5 rounded-xl font-bold mt-auto active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-md"
      >
        <MessageCircle size={18} />
        Eu Quero
      </button>
    </div>
  );
}

export default function Promocoes() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;

    api('/api/services')
      .then((data) => {
        if (active) setServices(data.filter((service) => service.category === 'monthly'));
      })
      .catch((error) => setMessage(error.message));

    return () => {
      active = false;
    };
  }, []);

  const alongamentoPlans = useMemo(
    () => services.filter((service) => !service.name.toLowerCase().includes('banho')),
    [services],
  );

  const banhoGelPlans = useMemo(
    () => services.filter((service) => service.name.toLowerCase().includes('banho')),
    [services],
  );

  const openCalendar = (service) => {
    navigate(`/agendar?serviceId=${service.id}&category=monthly`);
  };

  const openMonthlySelection = () => {
    navigate('/agendar?category=monthly');
  };

  return (
    <div className="bg-[#fcf8f8] min-h-full pb-24 font-sans">
      <div className="pt-8 px-6 pb-6 bg-white rounded-b-[40px] shadow-sm mb-8 relative z-10">
        <h1 className="text-2xl font-extrabold text-[#2C3E50] tracking-tight leading-tight mb-2">
          Planos mensais de alongamento e banho de gel
        </h1>
        <p className="text-gray-500 text-sm">
          Toque em Eu Quero para abrir o calendario.
        </p>
      </div>

      {message && (
        <div className="mx-6 mb-5 rounded-2xl bg-white border border-[#FFF0F5] p-4 text-sm text-gray-500">
          {message}
        </div>
      )}

      {!services.length && (
        <div className="mx-6 mb-5 rounded-2xl bg-white border border-[#FFF0F5] p-4 text-sm text-gray-500">
          Nenhum plano mensal ativo no momento.
          <button type="button" onClick={openMonthlySelection} className="block mt-3 w-full bg-[#2C3E50] text-white py-3 rounded-xl font-bold">
            Ver opcoes de agendamento
          </button>
        </div>
      )}

      {!!alongamentoPlans.length && (
        <div className="mb-10">
          <h2 className="px-6 text-xl font-bold text-[#DB7093] mb-4 tracking-tight" style={{ fontFamily: 'cursive' }}>
            Pacotes Mensais <br /><span className="text-[#2C3E50] font-sans font-black text-2xl uppercase tracking-widest">Alongamento</span>
          </h2>

          <div className="flex gap-4 overflow-x-auto no-scrollbar px-6 snap-x snap-mandatory pb-4">
            {alongamentoPlans.map((service) => (
              <PlanCard key={service.id} service={service} onSelect={openCalendar} />
            ))}
          </div>
        </div>
      )}

      {!!banhoGelPlans.length && (
        <div className="mb-4">
          <h2 className="px-6 text-xl font-bold text-[#DB7093] mb-4 tracking-tight" style={{ fontFamily: 'cursive' }}>
            Pacotes Mensais <br /><span className="text-[#2C3E50] font-sans font-black text-2xl uppercase tracking-widest">Banho de Gel</span>
          </h2>

          <div className="flex gap-4 overflow-x-auto no-scrollbar px-6 snap-x snap-mandatory pb-4">
            {banhoGelPlans.map((service) => (
              <PlanCard key={service.id} service={service} onSelect={openCalendar} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
