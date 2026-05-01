import React from 'react';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user } = useAuth();

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-10 sticky top-0 z-20">
      <div className="flex items-center gap-3 text-sm">
        <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
          <span>Security Center</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        </div>
        <span className="font-black text-slate-900 uppercase tracking-tighter text-lg">{user?.role} NODE</span>
      </div>

      <div className="flex items-center gap-8">
        <div className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-green-50 border border-green-100 text-green-700 rounded-xl text-[10px] font-black tracking-widest">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
          ENCRYPTION ACTIVE
        </div>
        <div className="flex items-center gap-4 border-l border-slate-200 pl-8">
           <div className="text-right flex flex-col justify-center">
             <span className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Authenticated as</span>
             <span className="text-sm font-bold text-slate-900 leading-none">{user?.username}</span>
           </div>
           <div className="w-12 h-12 bg-slate-100 border-2 border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 font-black shadow-inner">
             {user?.username?.[0] || 'U'}
           </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
