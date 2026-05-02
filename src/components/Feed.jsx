// src/components/Feed.jsx (Completo)
import React from 'react';
import { MapPin } from 'lucide-react';

const POSTS = [
  {
    id: 1,
    title: 'TÉCNICAS',
    subtitle: 'Conheça nossos procedimentos',
    content: [
      { label: 'ALONGAMENTO NO MOLDE F1', desc: 'Acabamento natural e sofisticado, com longa duração. Durabilidade de 25 a 30 dias.' },
      { label: 'BANHO DE GEL', desc: 'Mantém as unhas naturais resistentes. Uma fina camada de gel em toda a unha natural. Durabilidade de 20 a 30 dias.' },
      { label: 'ESMALTAÇÃO EM GEL', desc: 'Ideal para unhas naturais resistentes porém se incomoda com a durabilidade de uma esmaltação tradicional. Durabilidade de 15 a 20 dias.' },
    ],
    footer: 'A durabilidade depende do cuidado da cliente e saúde das unhas.',
  },
  {
    id: 2,
    title: 'ADICIONAIS',
    subtitle: 'Personalize suas unhas',
    content: [
      { label: 'PAR DE ENCAPSULADA', value: 'R$ 10,00' },
      { label: 'AUMENTO DE TAMANHO (MANUT.)', value: 'R$ 10,00' },
      { label: 'TROCA DE FORMATO (MANUT.)', value: 'R$ 10,00' },
      { label: 'DECORAÇÃO A MÃO / NAIL ART', value: 'R$ 10,00' },
      { label: 'PINGENTE', value: 'R$ 10,00' },
    ],
    footer: 'Exemplos: Laços, pérolas, francesinha, blooming nails e muito mais!',
  },
  {
    id: 3,
    title: 'TEMPO & FORMATOS',
    subtitle: 'Planeje seu horário',
    content: [
      { label: 'ALONGAMENTO / BANHO / MANUT.', desc: 'De 1h a 1h30 (Varia conforme tamanho/arte)' },
      { label: 'ESMALTAÇÃO EM GEL', desc: 'De 40min a 1h10 (Varia conforme tamanho/arte)' },
      { label: 'REMOÇÃO', desc: 'De 15 a 20minutos' },
      { label: 'FORMATOS DISPONÍVEIS', desc: 'Amendoado • Bailarina • Stiletto • Quadrada' },
    ],
  },
  {
    id: 4,
    title: 'LEMBRETES',
    subtitle: 'Preparo para o Atendimento',
    content: [
      { bullet: 'Não fazer a cutilagem pelo menos uma semana antes;' },
      { bullet: 'Não vir com bases ou esmaltes nas unhas naturais;' },
      { bullet: 'Se possível vir sem acompanhantes;' },
      { bullet: 'Vir com disponibilidade de horário;' },
      { bullet: 'Tolerância de atraso de 15 minutos.' },
    ],
  },
  {
    id: 5,
    title: 'ATRASO E SINAL',
    subtitle: 'Políticas do Estúdio',
    content: [
      { label: 'SINAL DE 40%', desc: 'Cobrado no ato do agendamento para confirmação. Será abatido do valor final.' },
      { label: 'TOLERÂNCIA (15 MINUTOS)', desc: 'Após 10min, decorações elaboradas não poderão ser feitas para não atrasar a próxima cliente.' },
      { label: 'CANCELAMENTOS (< 24H)', desc: 'Sem reembolso do sinal. O valor poderá ser usado para UM reagendamento (sujeito à nova taxa de segurança).' },
    ],
    footer: 'Amparado pela Lei 10.406, Código Civil (Art. 417 a 420) e CDC.',
  }
];

export default function Feed() {
  return (
    <div className="bg-[#fcfcfc] min-h-full pb-24">
      
      {/* Cabeçalho do Estúdio (Bio) */}
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

      {/* Cartões Informativos Limpos */}
      <div className="flex flex-col gap-6 mt-8 px-5">
        {POSTS.map(post => (
          <div key={post.id} className="w-full bg-gradient-to-br from-[#faf9f7] via-[#FFF0F5] to-[#f4ebe1] rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white flex flex-col justify-center px-8 py-10 relative overflow-hidden">
            
            {/* Efeito sutil de brilho no fundo */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/60 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>

            <h2 className="text-3xl font-serif text-[#B8860B] text-center tracking-widest drop-shadow-sm mb-1 relative z-10">
              {post.title}
            </h2>
            {post.subtitle && (
              <p className="text-center text-[10px] text-gray-500 uppercase tracking-widest mb-8 font-semibold relative z-10">
                {post.subtitle}
              </p>
            )}

            <div className="flex flex-col gap-5 relative z-10">
              {post.content.map((item, idx) => (
                <div key={idx}>
                  {/* Estilo: Tabela de Preços (Adicionais) */}
                  {item.label && item.value && (
                    <div className="flex justify-between items-end border-b border-[#B8860B]/20 pb-1.5">
                      <span className="font-serif text-[#2C3E50] uppercase text-[11px] tracking-wider">{item.label}</span>
                      <span className="font-extrabold text-[#B8860B] text-sm">{item.value}</span>
                    </div>
                  )}
                  
                  {/* Estilo: Título + Descrição (Técnicas, Tempos) */}
                  {item.label && item.desc && (
                    <div className="mb-1">
                      <h3 className="font-serif text-[#B8860B] uppercase text-[11px] tracking-wider mb-1.5 font-bold">{item.label}</h3>
                      <p className="text-[13px] text-gray-700 leading-relaxed font-medium">{item.desc}</p>
                    </div>
                  )}

                  {/* Estilo: Marcadores / Lembretes */}
                  {item.bullet && (
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#B8860B] mt-2 shrink-0"></div>
                      <p className="text-[13px] text-gray-700 leading-relaxed font-medium">{item.bullet}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {post.footer && (
              <p className="text-[10px] text-gray-500 text-center mt-8 italic relative z-10 font-medium px-2">
                {post.footer}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}