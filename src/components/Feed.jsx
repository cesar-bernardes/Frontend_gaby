import React, { useEffect, useState } from 'react';
import { MapPin, RefreshCw } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://backend-gaby.vercel.app';

const fallbackPosts = [
  {
    id: 'fallback_tecnicas',
    title: 'TECNICAS',
    subtitle: 'Conheca nossos procedimentos',
    content: [
      { label: 'ALONGAMENTO NO MOLDE F1', desc: 'Acabamento natural e sofisticado, com longa duracao. Durabilidade de 25 a 30 dias.' },
      { label: 'BANHO DE GEL', desc: 'Mantem as unhas naturais resistentes. Uma fina camada de gel em toda a unha natural. Durabilidade de 20 a 30 dias.' },
      { label: 'ESMALTACAO EM GEL', desc: 'Ideal para unhas naturais resistentes, com durabilidade maior que uma esmaltacao tradicional.' },
    ],
    footer: 'A durabilidade depende do cuidado da cliente e saude das unhas.',
  },
  {
    id: 'fallback_politicas',
    title: 'ATRASO E SINAL',
    subtitle: 'Politicas do Estudio',
    content: [
      { label: 'SINAL DE 40%', desc: 'Cobrado no ato do agendamento para confirmacao. Sera abatido do valor final.' },
      { label: 'TOLERANCIA (15 MINUTOS)', desc: 'Depois da tolerancia, decoracoes elaboradas podem ser ajustadas para nao atrasar a proxima cliente.' },
      { label: 'CANCELAMENTOS (< 24H)', desc: 'Sem reembolso do sinal. O valor pode ser usado em um reagendamento, sujeito a disponibilidade.' },
    ],
    footer: 'Amparado pela Lei 10.406, Codigo Civil (Art. 417 a 420) e CDC.',
  },
];

async function api(path) {
  const response = await fetch(`${API_URL}${path}`, { credentials: 'include' });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) throw new Error(data.message || 'Nao foi possivel carregar o inicio');
  return data;
}

function FeedPostCard({ post }) {
  return (
    <article className="w-full rounded-[28px] border border-white bg-gradient-to-br from-[#faf9f7] via-[#FFF0F5] to-[#f4ebe1] shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden">
      {post.imageUrl && (
        <img src={post.imageUrl} alt={post.title} className="h-44 w-full object-cover" />
      )}

      <div className="px-7 py-8">
        <h2 className="text-2xl font-serif text-[#B8860B] text-center tracking-widest mb-1">
          {post.title}
        </h2>
        {post.subtitle && (
          <p className="text-center text-[10px] text-gray-500 uppercase tracking-widest mb-7 font-semibold">
            {post.subtitle}
          </p>
        )}

        <div className="flex flex-col gap-5">
          {(post.content || []).map((item, index) => (
            <div key={`${post.id}-${index}`}>
              {item.label && item.value && (
                <div className="flex justify-between items-end border-b border-[#B8860B]/20 pb-1.5 gap-3">
                  <span className="font-serif text-[#2C3E50] uppercase text-[11px] tracking-wider">{item.label}</span>
                  <span className="font-extrabold text-[#B8860B] text-sm">{item.value}</span>
                </div>
              )}

              {item.label && item.desc && (
                <div>
                  <h3 className="font-serif text-[#B8860B] uppercase text-[11px] tracking-wider mb-1.5 font-bold">{item.label}</h3>
                  <p className="text-[13px] text-gray-700 leading-relaxed font-medium">{item.desc}</p>
                </div>
              )}

              {item.bullet && (
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#B8860B] mt-2 shrink-0" />
                  <p className="text-[13px] text-gray-700 leading-relaxed font-medium">{item.bullet}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {post.footer && (
          <p className="text-[10px] text-gray-500 text-center mt-8 italic font-medium px-2">
            {post.footer}
          </p>
        )}
      </div>
    </article>
  );
}

export default function Feed() {
  const [posts, setPosts] = useState(fallbackPosts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    api('/api/feed/posts')
      .then((data) => {
        if (active && data.length) setPosts(data);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="bg-[#fcfcfc] min-h-full pb-24">
      <div className="text-center pt-8 pb-8 px-4 bg-white border-b border-gray-100 rounded-b-[32px] shadow-sm relative z-10">
        <h1 className="text-2xl font-extrabold text-[#DB7093] mb-3 tracking-tight">
          Gabriely Dias Nail Designer
        </h1>

        <div className="flex flex-col items-center justify-center gap-1 text-[#2C3E50]">
          <p className="text-[15px] font-semibold flex items-center gap-2">
            <MapPin size={18} className="text-[#DB7093]" />
            Rua Oliveira Marques, 5168
          </p>
          <p className="text-sm font-medium text-gray-500">
            Dourados, Mato Grosso do Sul
          </p>
        </div>
      </div>

      {loading && (
        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-gray-400">
          <RefreshCw size={14} className="animate-spin" />
          Carregando inicio
        </div>
      )}

      <div className="flex flex-col gap-6 mt-8 px-5">
        {posts.map((post) => (
          <FeedPostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
