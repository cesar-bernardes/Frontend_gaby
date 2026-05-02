// src/components/Login.jsx (Completo)
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Login({ onLoginSuccess }) {
  const [phone, setPhone] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    // No futuro: Chamada para o backend que seta o cookie de segurança
    
    // Navega imediatamente para a tela do Feed
    navigate('/feed');
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#FFF0F5] p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-white p-8 rounded-[32px] shadow-xl border border-gray-100"
      >
        <h1 className="text-3xl font-extrabold text-center text-[#DB7093] tracking-tighter mb-2">
          Bem-vinda!
        </h1>
        <p className="text-gray-500 mb-8 text-center text-sm">
          Digite seu WhatsApp para acessar
        </p>
        
        <input 
          type="tel" 
          placeholder="(00) 00000-0000"
          className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl mb-6 focus:border-[#DB7093] focus:bg-white outline-none transition-all text-center text-lg font-semibold tracking-widest text-gray-700"
          onChange={(e) => setPhone(e.target.value)}
        />
        
        <button 
          onClick={handleLogin}
          className="w-full bg-gradient-to-r from-[#DB7093] to-rose-400 text-white p-4 rounded-2xl font-extrabold text-lg shadow-lg shadow-[#DB7093]/30 active:scale-95 transition-all hover:shadow-xl"
        >
          Entrar
        </button>
      </motion.div>
    </div>
  );
}