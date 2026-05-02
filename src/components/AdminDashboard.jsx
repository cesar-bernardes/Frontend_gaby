import React from 'react';
import { TrendingUp, Award, Users } from 'lucide-react';

export default function AdminDashboard() {
  const stats = { totalMes: 4550, servicosRealizados: 42 };
  const ranking = [
    { nome: "Ana Silva", total: 450, visitas: 5 },
    { nome: "Beatriz Oliveira", total: 320, visitas: 3 },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-xl font-bold mb-6">Painel de Gestão</h1>

      {/* Cards Financeiros */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-4 rounded-2xl shadow-sm border-l-4 border-green-500">
          <TrendingUp className="text-green-500 mb-2" />
          <p className="text-xs text-gray-500">Faturamento Mês</p>
          <p className="text-lg font-bold">R$ {stats.totalMes}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border-l-4 border-blue-500">
          <Users className="text-blue-500 mb-2" />
          <p className="text-xs text-gray-500">Atendimentos</p>
          <p className="text-lg font-bold">{stats.servicosRealizados}</p>
        </div>
      </div>

      {/* Ranking de Fidelidade */}
      <div className="bg-white p-5 rounded-3xl shadow-sm">
        <div className="flex items-center mb-4">
          <Award className="text-yellow-500 mr-2" />
          <h2 className="font-bold">Top Clientes Fiéis</h2>
        </div>
        {ranking.map((c, index) => (
          <div key={index} className="flex justify-between items-center py-3 border-b last:border-0">
            <div>
              <p className="font-semibold text-sm">{index + 1}º {c.nome}</p>
              <p className="text-xs text-gray-400">{c.visitas} visitas</p>
            </div>
            <span className="text-pink-500 font-bold">R$ {c.total}</span>
          </div>
        ))}
      </div>
    </div>
  );
}