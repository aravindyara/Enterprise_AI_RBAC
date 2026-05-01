import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  
  // Theme mapping
  const themes = {
    Finance: 'bg-finance-main',
    HR: 'bg-hr-main',
    Engineering: 'bg-indigo-600',
    Legal: 'bg-legal-main',
    Public: 'bg-slate-700'
  };

  const activeTheme = themes[user?.role] || themes.Public;

  // Active state logic
  const isVaultActive = location.pathname === '/' || location.pathname === '/finance' || location.pathname === '/hr' || location.pathname === '/legal' || location.pathname === '/engineering';
  const isAuditActive = location.pathname === '/audit';

  return (
    <aside className="w-72 h-screen bg-[#0a0c10] text-white flex flex-col fixed left-0 top-0 border-r border-slate-800/50 z-30">
      <div className="p-8 border-b border-slate-800/50 flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center font-black text-2xl shadow-lg shadow-white/5 border border-white/10 ${activeTheme}`}>
            N
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tighter uppercase italic">Nexus AI</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Enterprise RBAC</span>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
          <span className="text-[10px] font-black uppercase text-slate-300 tracking-wider">Operational Status: L5</span>
        </div>
      </div>

      <nav className="flex-1 p-6 space-y-4">
        <div className="px-4 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
          Security Modules
        </div>
        <Link 
          to="/" 
          className={`group flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all border ${isVaultActive && !isAuditActive ? 'bg-white/10 border-white/20 text-white shadow-lg' : 'text-slate-500 border-transparent hover:bg-white/5 hover:text-white'}`}
        >
          <span className="text-xl group-hover:scale-125 transition-transform">🏠</span> 
          <span>Vault Overview</span>
        </Link>
        
        {user?.role === 'Engineering' && (
          <Link 
            to="/audit" 
            className={`group flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all border ${isAuditActive ? 'bg-white/10 border-white/20 text-white shadow-lg' : 'text-slate-500 border-transparent hover:bg-white/5 hover:text-white'}`}
          >
            <span className="text-xl group-hover:scale-125 transition-transform">📊</span> 
            <span>Audit Streams</span>
          </Link>
        )}
      </nav>

      <div className="p-6">
        <div className="bg-slate-900/80 backdrop-blur-md p-6 rounded-[2rem] border border-slate-800/50 relative overflow-hidden group">
          <div className={`absolute top-0 right-0 w-24 h-24 blur-3xl opacity-20 -mr-12 -mt-12 transition-all group-hover:scale-150 ${activeTheme}`}></div>
          
          <div className="relative z-10">
            <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Subject Identity</p>
            <p className="font-bold text-base truncate mb-3">{user?.username}</p>
            <div className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${activeTheme} shadow-lg shadow-black/20`}>
              {user?.role}
            </div>
            
            <button 
              onClick={() => {
                logout();
                window.location.href = '/login';
              }}
              className="w-full mt-6 py-3 text-xs font-black bg-white/10 text-white hover:bg-white/20 border border-white/10 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
              SWITCH SECURITY ROLE
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
