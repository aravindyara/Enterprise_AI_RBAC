import React from 'react';

const SecurePreviewModal = ({ resource, onClose }) => {
  if (!resource) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-32 bg-slate-50 flex items-center justify-center border-b border-slate-100">
          <div className="absolute top-6 right-6">
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-400 transition-all shadow-sm"
            >
              ✕
            </button>
          </div>
          <div className="text-center">
             <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Confidential Node</div>
             <h2 className="text-2xl font-black text-slate-900 tracking-tight lowercase"># {resource.id}</h2>
          </div>
        </div>

        <div className="p-10 space-y-6">
          <div className="flex items-center gap-4">
            <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
              resource.owner === 'Finance' ? 'bg-finance-light text-finance-main' :
              resource.owner === 'HR' ? 'bg-hr-light text-hr-main' : 'bg-legal-light text-legal-main'
            }`}>
              {resource.owner} Sector
            </span>
            <span className="px-4 py-1.5 rounded-xl bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest border border-green-100">
              Validated by OPA
            </span>
          </div>

          <div className="space-y-2">
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">{resource.title}</h3>
            <p className="text-slate-500 font-medium italic">{resource.description}</p>
          </div>

          <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 relative group">
             <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none text-4xl font-black uppercase tracking-widest -rotate-12">
               Enterprise AI Confidential • Enterprise AI Confidential
             </div>
             <div className="relative z-10 space-y-4">
               <div className="w-12 h-1 bg-indigo-600 rounded-full mb-6"></div>
               <p className="text-slate-700 font-bold leading-relaxed text-lg">
                 "This document has been decrypted successfully at the application layer. No data anomalies were detected during the transfer from the Postgres RLS segment."
               </p>
               <p className="text-slate-500 text-sm leading-relaxed">
                 The following intelligence has been vetted by the Nexus security engine. Identity token verification remains active during this viewing session.
               </p>
             </div>
          </div>
        </div>

        <div className="bg-slate-900 p-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Secure Tunnel Active</span>
          </div>
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-white text-slate-900 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecurePreviewModal;
