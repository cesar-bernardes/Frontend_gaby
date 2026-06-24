import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { Home, Sparkles, Tag, UserCircle } from 'lucide-react';

import Login from './components/Login';
import Feed from './components/Feed';
import Agendamento from './components/Agendamento';
import AdminDashboard from './components/AdminDashboard';
import Promocoes from './components/Promocoes';
import Usuario from './components/Usuario';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function Header() {
  const location = useLocation();

  if (location.pathname === '/' || location.pathname === '/admin') return null;

  return (
    <header className="bg-white flex justify-between items-center py-3 px-4 shrink-0 border-b border-gray-100 shadow-sm z-20">
      <h1 className="text-xl font-extrabold text-[#2C3E50] tracking-tighter" style={{ fontFamily: 'cursive' }}>
        Gabriely<span className="text-[#DB7093] font-sans">Dias</span>
      </h1>
    </header>
  );
}

function BottomNav() {
  const location = useLocation();
  const [role, setRole] = useState(null);

  useEffect(() => {
    let active = true;

    fetch(`${API_URL}/api/me`, { credentials: 'include' })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (active) setRole(data?.user?.role || null);
      })
      .catch(() => {
        if (active) setRole(null);
      });

    return () => {
      active = false;
    };
  }, [location.pathname]);

  if (location.pathname === '/' || location.pathname === '/admin') return null;

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-t border-gray-200 flex justify-between items-center py-3 px-8 shrink-0 z-20 sm:rounded-b-[32px] pb-safe">
      <Link to="/feed" className={`transition-transform active:scale-90 ${isActive('/feed') ? 'text-black' : 'text-gray-400'}`}>
        <Home size={28} strokeWidth={isActive('/feed') ? 2.5 : 1.5} fill={isActive('/feed') ? 'currentColor' : 'none'} />
      </Link>

      <Link to="/promocoes" className={`transition-transform active:scale-90 ${isActive('/promocoes') ? 'text-black' : 'text-gray-400'}`}>
        <Tag size={28} strokeWidth={isActive('/promocoes') ? 2.5 : 1.5} fill={isActive('/promocoes') ? 'currentColor' : 'none'} />
      </Link>

      <Link to="/agendar" className="relative text-black transition-transform hover:scale-105 active:scale-90">
        <Sparkles size={28} strokeWidth={isActive('/agendar') ? 2.2 : 1.5} />
        <span className="absolute -top-1.5 -right-2 bg-[#ff2040] text-white text-[10px] font-bold px-[5px] py-[1px] rounded-full border-[2px] border-white shadow-sm">
          4
        </span>
      </Link>

      <Link to="/usuario" className={`transition-transform active:scale-90 ${isActive('/usuario') ? 'text-black' : 'text-gray-400'}`}>
        <UserCircle size={28} strokeWidth={isActive('/usuario') ? 2.5 : 1.5} />
      </Link>

      {role === 'ADM' && (
        <Link to="/admin" className={`transition-transform active:scale-90 ${isActive('/admin') ? 'text-black' : 'text-gray-400'}`}>
          <UserCircle size={28} strokeWidth={isActive('/admin') ? 2.5 : 1.5} />
        </Link>
      )}
    </nav>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 sm:bg-[#FFF0F5]/40 flex justify-center items-center sm:p-6">
        <div className="w-full h-[100dvh] sm:h-[850px] max-w-md bg-white sm:rounded-[40px] shadow-xl overflow-hidden flex flex-col sm:border-[8px] sm:border-white font-sans antialiased relative">
          <Header />

          <main className="flex-1 overflow-y-auto bg-white relative no-scrollbar">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/feed" element={<Feed />} />
              <Route path="/agendar" element={<Agendamento />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/promocoes" element={<Promocoes />} />
              <Route path="/usuario" element={<Usuario />} />
              <Route path="*" element={<Navigate to="/feed" />} />
            </Routes>
          </main>

          <BottomNav />
        </div>
      </div>
    </Router>
  );
}
