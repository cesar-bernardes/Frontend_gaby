import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'https://backend-gaby.vercel.app';

const onlyDigits = (value) => String(value || '').replace(/\D/g, '');

async function apiPost(path, body) {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Nao foi possivel continuar');
    error.data = data;
    error.status = response.status;
    throw error;
  }

  return data;
}

export default function Login() {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [mode, setMode] = useState('phone');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const resetToPhone = () => {
    setMode('phone');
    setName('');
    setMessage('');
  };

  const handlePhoneStep = async () => {
    const normalizedPhone = onlyDigits(phone);

    if (normalizedPhone.length < 10) {
      setMessage('Digite um WhatsApp valido.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const result = await apiPost('/api/auth/check-phone', { phone: normalizedPhone });

      if (!result.exists) {
        setMode('register');
        setMessage('Esse telefone ainda nao tem cadastro.');
        return;
      }

      const login = await apiPost('/api/login', { phone: normalizedPhone });
      navigate(login.user?.role === 'ADM' ? '/admin' : '/feed');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterStep = async () => {
    const normalizedPhone = onlyDigits(phone);
    const trimmedName = name.trim();

    if (trimmedName.length < 2) {
      setMessage('Digite seu nome para concluir o cadastro.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const register = await apiPost('/api/register', {
        phone: normalizedPhone,
        name: trimmedName,
      });
      navigate(register.user?.role === 'ADM' ? '/admin' : '/feed');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (loading) return;
    if (mode === 'register') {
      handleRegisterStep();
      return;
    }
    handlePhoneStep();
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#FFF0F5] p-6">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-white p-8 rounded-[32px] shadow-xl border border-gray-100"
      >
        <h1 className="text-3xl font-extrabold text-center text-[#DB7093] tracking-tighter mb-2">
          Bem-vinda!
        </h1>
        <p className="text-gray-500 mb-8 text-center text-sm">
          {mode === 'register' ? 'Finalize seu cadastro' : 'Digite seu WhatsApp para acessar'}
        </p>

        <input
          type="tel"
          placeholder="(00) 00000-0000"
          value={phone}
          onChange={(event) => {
            setPhone(event.target.value);
            if (mode === 'register') resetToPhone();
          }}
          className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl mb-4 focus:border-[#DB7093] focus:bg-white outline-none transition-all text-center text-lg font-semibold tracking-widest text-gray-700"
        />

        <AnimatePresence>
          {mode === 'register' && (
            <motion.input
              key="name"
              type="text"
              placeholder="Seu nome"
              value={name}
              onChange={(event) => setName(event.target.value)}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl mb-4 focus:border-[#DB7093] focus:bg-white outline-none transition-all text-center text-base font-semibold text-gray-700"
            />
          )}
        </AnimatePresence>

        {message && (
          <p className="text-center text-sm text-gray-500 mb-4">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-[#DB7093] to-rose-400 text-white p-4 rounded-2xl font-extrabold text-lg shadow-lg shadow-[#DB7093]/30 active:scale-95 transition-all hover:shadow-xl disabled:opacity-60 disabled:active:scale-100"
        >
          {loading ? 'Aguarde...' : mode === 'register' ? 'Cadastrar e Entrar' : 'Entrar'}
        </button>
      </motion.form>
    </div>
  );
}
