// src/components/Agendamento.jsx (Completo)
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, Zap, Info, Package, Gem, Users } from 'lucide-react';

const SERVICOS = [
  { id: 1, nome: 'Alongamento Molde F1', preco: 100, duracao: '1h20', icon: Gem },
  { id: 2, nome: 'Manutenção (30 dias)', preco: 90, duracao: '1h00', icon: Clock },
  { id: 3, nome: 'Blindagem', preco: 55, duracao: '40min', icon: Package },
  { id: 4, nome: 'Esmaltação em Gel', preco: 60, duracao: '40min', icon: Zap },
  { id: 5, nome: 'Pedicure em Gel', preco: 65, duracao: '50min', icon: Users },
];

export default function Agendamento() {
  const [servicoSelecionado, setServicoSelecionado] = useState(null);

  // Simulando horários restritos para gerar gatilho de escassez
  const horários = ["09:00", "11:30", "16:00"];

  return (
    <div className="bg-brand-pink-light h-full pt-20 px-6 pb-32 overflow-y-auto no-scrollbar">
      
      {/* Título Organizado */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 border-l-4 border-brand-pink-dark pl-4 py-1">
        <h2 className="text-2xl font-extrabold text-brand-dark tracking-tighter">Escolha seu Momento</h2>
        <p className="text-gray-500 text-sm mt-1">Selecione o serviço para ver horários.</p>
      </motion.div>
      
      {/* Lista de Serviços Organizada em Cartões Elegantes */}
      <section className="mb-8 space-y-4">
        {SERVICOS.map((s, index) => {
          const Icon = s.icon;
          const isSelected = servicoSelecionado?.id === s.id;
          return (
            <motion.div 
              key={s.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setServicoSelecionado(s)}
              className={`p-5 bg-white border-2 rounded-2xl cursor-pointer transition-all flex justify-between items-center group ${isSelected ? 'border-brand-pink-dark bg-brand-pink-light/50 shadow-lg scale-[1.03]' : 'border-gray-100 hover:border-brand-pink hover:bg-white/70 shadow-sm'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl transition-colors ${isSelected ? 'bg-brand-pink-dark text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-brand-pink group-hover:text-white'}`}>
                  <Icon size={24} />
                </div>
                <div>
                  <h3 className={`font-bold text-lg tracking-tight ${isSelected ? 'text-brand-dark' : 'text-gray-700'}`}>{s.nome}</h3>
                  <div className={`flex items-center text-xs mt-1 gap-2 ${isSelected ? 'text-gray-600' : 'text-gray-400'}`}>
                    <Clock size={12} className="text-brand-gold" /> {s.duracao}
                    <Zap size={12} className="text-blue-400" /> Vagas Hoje
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`font-extrabold text-2xl tracking-tighter ${isSelected ? 'text-brand-pink-dark' : 'text-brand-dark group-hover:text-brand-pink-dark'}`}>R$ {s.preco}</span>
                {isSelected && <CheckCircle size={20} className="text-green-500 animate-pulse" />}
              </div>
            </motion.div>
          );
        })}
      </section>

      {/* Passo 2: Horários e Gatilhos (Aparece com Animação Suave) */}
      <AnimatePresence>
        {servicoSelecionado && (
          <motion.div 
            initial={{ opacity: 0, y: 20, height: 0 }} 
            animate={{ opacity: 1, y: 0, height: 'auto' }} 
            exit={{ opacity: 0, y: 20, height: 0 }}
            className="space-y-6 bg-white p-6 rounded-3xl border border-gray-100 shadow-xl overflow-hidden"
          >
            
            {/* Visual de Escassez Organizado (Cores Premium, não vermelhas feias) */}
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex items-start gap-3">
              <Zap size={20} className="text-brand-gold mt-1 animate-pulse" />
              <div>
                <h4 className="font-bold text-amber-900 text-sm">Aproveite!</h4>
                <p className="text-amber-700 text-xs mt-1">Restam apenas {horários.length} horários para hoje. Garanta já a sua vaga e evite a fila de espera!</p>
              </div>
            </div>

            {/* Ícones de Horários Organizados */}
            <div className="grid grid-cols-3 gap-3">
              {horários.map(h => (
                <button key={h} className="p-3 bg-brand-pink-light border border-brand-pink text-brand-dark rounded-xl font-bold text-sm hover:bg-brand-pink-dark hover:text-white hover:border-brand-pink-dark transition-all active:scale-95 shadow-sm">
                  {h}
                </button>
              ))}
            </div>
            
            {/* Informação Legal Organizada */}
            <div className="flex items-center text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
              <Info size={14} className="mr-2 text-blue-400" />
              Máximo de 1 acompanhante permitido no estúdio.
            </div>

            <button className="w-full bg-brand-dark text-white p-5 rounded-2xl font-extrabold text-lg shadow-lg hover:bg-black transition-all active:scale-95">
              Confirmar e Agendar
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}