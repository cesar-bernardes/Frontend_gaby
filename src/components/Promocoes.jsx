// src/components/Promocoes.jsx (Completo)
import React from 'react';
import { MessageCircle, Check } from 'lucide-react';

// Dados dos pacotes baseados na sua tabela
const PACOTES_ALONGAMENTO = [
  {
    nome: 'Premium',
    preco: '199,90',
    subtitulo: '2 manutenções em 30 dias corridos',
    beneficios: [
      'Manutenção completa',
      'Esmaltação em gel tradicional',
      'Francesinha',
      'Todo tipo de nail art',
      'Pedrarias e pingentes',
      'Cutilagem',
      'Baby boomer',
      'Reposição de unhas quebradas'
    ]
  },
  {
    nome: 'Gold',
    preco: '179,90',
    subtitulo: '2 manutenções em 30 dias corridos',
    beneficios: [
      'Manutenção completa',
      'Esmaltação em gel tradicional',
      'Francesinha',
      'Todo tipo de nail art',
      'Cutilagem'
    ]
  },
  {
    nome: 'Star',
    preco: '169,90',
    subtitulo: '2 manutenções em 30 dias corridos',
    beneficios: [
      'Manutenção completa',
      'Esmaltação em gel tradicional',
      'Francesinha',
      'Cutilagem'
    ]
  }
];

const PACOTES_BANHO_GEL = [
  {
    nome: 'Premium',
    preco: '129,90',
    subtitulo: '2 banhos de gel em 30 dias corridos',
    beneficios: [
      'Banho de gel completo',
      'Esmaltação em gel tradicional',
      'Francesinha',
      'Todo tipo de nail art',
      'Cutilagem'
    ]
  },
  {
    nome: 'Gold',
    preco: '119,90',
    subtitulo: '2 banhos de gel em 30 dias corridos',
    beneficios: [
      'Banho de gel completo',
      'Esmaltação em gel tradicional',
      'Francesinha',
      'Cutilagem'
    ]
  }
];

export default function Promocoes() {
  return (
    <div className="bg-[#fcf8f8] min-h-full pb-24 font-sans">
      
      {/* Cabeçalho da Seção (Idêntico ao da imagem) */}
      <div className="pt-8 px-6 pb-6 bg-white rounded-b-[40px] shadow-sm mb-8 relative z-10">
        <h1 className="text-2xl font-extrabold text-[#2C3E50] tracking-tight leading-tight mb-2">
          Planos mensais de alongamento e banho de gel
        </h1>
        <p className="text-gray-500 text-sm flex items-center gap-2">
          Adquira mais informações via WhatsApp
        </p>
      </div>

      {/* SEÇÃO 1: ALONGAMENTO */}
      <div className="mb-10">
        <h2 className="px-6 text-xl font-bold text-[#DB7093] mb-4 tracking-tight" style={{ fontFamily: 'cursive' }}>
          Pacotes Mensais <br/><span className="text-[#2C3E50] font-sans font-black text-2xl uppercase tracking-widest">Alongamento</span>
        </h2>
        
        {/* Contêiner com Rolagem Horizontal (Carrossel) */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar px-6 snap-x snap-mandatory pb-4">
          {PACOTES_ALONGAMENTO.map((plano, index) => (
            <div key={index} className="min-w-[280px] snap-center bg-white p-5 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#FFF0F5] flex flex-col">
              
              {/* Espaço em Branco para a Foto */}
              <div className="w-full h-36 bg-gray-100 rounded-2xl mb-5 flex flex-col items-center justify-center text-gray-300 border-2 border-dashed border-gray-200">
                <span className="text-xs font-semibold uppercase tracking-widest">Espaço para Foto</span>
              </div>
              
              {/* Informações do Plano */}
              <h3 className="text-center text-lg font-serif text-[#D4AF37] mb-1 uppercase tracking-widest font-bold">
                {plano.nome}
              </h3>
              <p className="text-center text-3xl font-extrabold text-[#2C3E50] mb-1">
                {plano.preco}
              </p>
              <p className="text-center text-xs text-gray-500 mb-5 px-2 font-medium">
                {plano.subtitulo}
              </p>
              
              {/* Lista de Benefícios */}
              <ul className="text-xs text-gray-600 space-y-3 mb-6 flex-grow">
                {plano.beneficios.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check size={14} className="text-[#DB7093] shrink-0 mt-[2px]" strokeWidth={3} />
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
              
              {/* Botão de Ação */}
              <button className="w-full bg-[#2C3E50] text-white py-3.5 rounded-xl font-bold mt-auto active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-md">
                <MessageCircle size={18} />
                Eu Quero
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SEÇÃO 2: BANHO DE GEL */}
      <div className="mb-4">
        <h2 className="px-6 text-xl font-bold text-[#DB7093] mb-4 tracking-tight" style={{ fontFamily: 'cursive' }}>
          Pacotes Mensais <br/><span className="text-[#2C3E50] font-sans font-black text-2xl uppercase tracking-widest">Banho de Gel</span>
        </h2>
        
        {/* Contêiner com Rolagem Horizontal (Carrossel) */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar px-6 snap-x snap-mandatory pb-4">
          {PACOTES_BANHO_GEL.map((plano, index) => (
            <div key={index} className="min-w-[280px] snap-center bg-white p-5 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#FFF0F5] flex flex-col">
              
              {/* Espaço em Branco para a Foto */}
              <div className="w-full h-36 bg-gray-100 rounded-2xl mb-5 flex flex-col items-center justify-center text-gray-300 border-2 border-dashed border-gray-200">
                <span className="text-xs font-semibold uppercase tracking-widest">Espaço para Foto</span>
              </div>
              
              {/* Informações do Plano */}
              <h3 className="text-center text-lg font-serif text-[#D4AF37] mb-1 uppercase tracking-widest font-bold">
                {plano.nome}
              </h3>
              <p className="text-center text-3xl font-extrabold text-[#2C3E50] mb-1">
                {plano.preco}
              </p>
              <p className="text-center text-xs text-gray-500 mb-5 px-2 font-medium">
                {plano.subtitulo}
              </p>
              
              {/* Lista de Benefícios */}
              <ul className="text-xs text-gray-600 space-y-3 mb-6 flex-grow">
                {plano.beneficios.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check size={14} className="text-[#DB7093] shrink-0 mt-[2px]" strokeWidth={3} />
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
              
              {/* Botão de Ação */}
              <button className="w-full bg-[#2C3E50] text-white py-3.5 rounded-xl font-bold mt-auto active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-md">
                <MessageCircle size={18} />
                Eu Quero
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}