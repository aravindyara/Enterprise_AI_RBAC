import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../api_config';
import { useAuth } from '../context/AuthContext';
import SecurePreviewModal from './SecurePreviewModal';

const DiscoveryVault = () => {
  const { token } = useAuth();
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState(null);
  const [deniedId, setDeniedId] = useState(null);

  useEffect(() => {
    const fetchCatalog = async () => {
      if (!token) return;
      try {
        const res = await axios.get(`${API_BASE_URL}/v1/meta/catalog`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCatalog(res.data || []);
      } catch (err) {
        console.error("Discovery Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, [token]);

  const handleCardClick = (item) => {
    if (item.is_restricted) {
      setDeniedId(item.id);
      setTimeout(() => setDeniedId(null), 500);
      return;
    }
    setSelectedResource(item);
  };

  if (loading) return (
    <div className="py-20 text-center space-y-4">
      <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Scanning Enterprise Catalog...</p>
    </div>
  );

  return (
    <div className="mt-16 space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xl">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Nexus Global Discovery</h2>
          <p className="text-sm text-slate-500 font-medium italic">Layer 2: Real-time OPA attribute-based discovery</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {catalog.map((item) => (
          <div 
            key={item.id} 
            onClick={() => handleCardClick(item)}
            className={`relative group rounded-[2.5rem] border transition-all duration-500 overflow-hidden ${
              item.is_restricted 
              ? `bg-slate-100/50 border-slate-200 grayscale cursor-not-allowed ${deniedId === item.id ? 'animate-shake' : ''}` 
              : 'bg-white border-indigo-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 cursor-pointer'
            }`}
          >
...
            {/* Blurring Overlay for Restricted Assets */}
            {item.is_restricted && (
              <div className="absolute inset-0 z-10 backdrop-blur-[6px] bg-slate-200/40 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-12 h-12 bg-white/90 rounded-2xl flex items-center justify-center text-slate-900 shadow-xl mb-4 transform scale-110">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-1">Access Restricted</span>
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest leading-tight">{item.policy_detail}</span>
              </div>
            )}

            <div className={`p-8 space-y-4 ${item.is_restricted ? 'opacity-30' : ''}`}>
              <div className="flex justify-between items-start">
                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                  item.owner === 'Finance' ? 'bg-finance-light text-finance-main' :
                  item.owner === 'HR' ? 'bg-hr-light text-hr-main' : 'bg-legal-light text-legal-main'
                }`}>
                  {item.owner}
                </span>
                {!item.is_restricted && (
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" title="Authorized" />
                )}
              </div>
              
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  {item.description}
                </p>
              </div>

              {!item.is_restricted && (
                <div className="pt-4 flex items-center gap-2 text-indigo-600 text-xs font-black uppercase tracking-widest">
                  View Resource
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-slate-900 text-white/50 p-6 rounded-[2rem] text-[10px] font-black uppercase tracking-widest text-center border border-white/5">
        Global Enterprise Map • Synchronized with Rego Node • {new Date().toLocaleTimeString()}
      </div>

      <SecurePreviewModal 
        resource={selectedResource} 
        onClose={() => setSelectedResource(null)} 
      />
    </div>
  );
};

export default DiscoveryVault;
