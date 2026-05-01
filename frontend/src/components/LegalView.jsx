import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../api_config';
import { useAuth } from '../context/AuthContext';
import { parseAISummary } from '../utils/AIParser';
import DiscoveryVault from './DiscoveryVault';
import NexusAssistant from './NexusAssistant';
import SecureUploader from './SecureUploader';

const LegalView = () => {
  const { token } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchData = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/v1/data/compliance`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data?.data || []);
    } catch (err) {
      console.error("Legal Access System Failure:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const generateAI = async () => {
    setIsGenerating(true);
    if (!token) return;
    try {
      const res = await axios.post(`${API_BASE_URL}/v1/ai/summarize/compliance`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAiInsight(res.data?.ai_insight || "AI returned empty summary.");
    } catch (err) {
      setAiInsight("Legal analysis engine disconnected. Simulation active.");
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-700">
      <div className="flex justify-between items-center text-legal-main border-b-2 border-legal-main/20 pb-6">
        <div>
          <h2 className="text-4xl font-black uppercase tracking-tighter italic">Risk Compliance Matrix</h2>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Real-time Legal Exposure Monitoring</p>
        </div>
        <button 
          onClick={generateAI}
          disabled={isGenerating}
          className="px-8 py-3 bg-legal-main text-white rounded-xl font-black hover:bg-legal-dark hover:scale-105 transition-all disabled:opacity-50 shadow-2xl shadow-legal-main/40 flex items-center gap-3"
        >
          {isGenerating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '⚠️'}
          {isGenerating ? 'AUDITING...' : 'RUN AI RISK AUDIT'}
        </button>
      </div>

      {aiInsight && (
        <div className="relative glass-panel p-8 rounded-2xl border-2 border-legal-main shadow-2xl animate-pulse-subtle max-h-[500px] overflow-y-auto custom-scrollbar">
          <div className="sticky top-0 bg-white/80 backdrop-blur-md pb-4 z-10">
             <div className="flex justify-between items-center">
               <h3 className="text-legal-main font-black text-xs uppercase">Internal Counsel Summary</h3>
               <span className="text-[10px] font-black bg-legal-main text-white px-2 py-1 rounded uppercase">Priority 0</span>
             </div>
          </div>
          {(() => {
            const structured = parseAISummary(aiInsight);
            return (
              <div className="space-y-6 border-l-4 border-legal-main pl-6 mt-4">
                {structured.summary && (
                  <div>
                    <h4 className="text-[10px] font-black text-legal-main uppercase tracking-widest mb-1">Current Security Posture</h4>
                    <p className="text-slate-900 font-bold italic text-lg leading-relaxed">{structured.summary}</p>
                  </div>
                )}
                
                {structured.insights.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-black text-legal-main uppercase tracking-widest mb-2">Internal Counsel Insights</h4>
                    <div className="space-y-2">
                      {structured.insights.map((item, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm font-bold text-red-900/70">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-legal-main" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {structured.actions.length > 0 && (
                  <div className="bg-legal-main/5 p-4 rounded-xl border border-legal-main/10">
                    <h4 className="text-[10px] font-black text-legal-main uppercase tracking-widest mb-2">Mandatory Defensive Actions</h4>
                    <div className="space-y-2">
                      {structured.actions.map((item, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm font-black text-legal-dark">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-sm bg-legal-main rotate-45" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.isArray(data) && data.length > 0 ? data.map((item, idx) => (
          <div key={idx} className={`relative overflow-hidden p-8 rounded-3xl border-2 transition-all cursor-pointer group hover:-translate-y-2 ${
            item.severity === 'High' ? 'bg-red-50/50 border-legal-main shadow-xl shadow-legal-main/10' : 
            item.severity === 'Medium' ? 'bg-amber-50/50 border-amber-200 shadow-lg' : 
            'bg-slate-50 border-slate-100 shadow-sm'
          }`}>
            {item.severity === 'High' && (
              <div className="absolute top-0 right-0">
                <div className="bg-legal-main text-white text-[9px] font-black px-4 py-1 rounded-bl-xl uppercase tracking-widest animate-pulse">
                  Immediate Audit Required
                </div>
              </div>
            )}
            
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                 <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all ${
                   item.severity === 'High' ? 'bg-legal-main text-white rotate-3' : 
                   item.severity === 'Medium' ? 'bg-amber-500 text-white' : 
                   'bg-slate-200 text-slate-500'
                 }`}>
                   {item.severity === 'High' ? '☣️' : item.severity === 'Medium' ? '⚠️' : '⚖️'}
                 </div>
                 <div>
                   <h3 className="text-xl font-black text-slate-900 tracking-tighter leading-none">{item.content}</h3>
                   <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 block">Ref: LG-SYS-{202400 + idx}</span>
                 </div>
              </div>
 
              <div className="flex items-center justify-between pt-6 border-t border-slate-200/50">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-slate-400 uppercase">Detection Layer</span>
                  <span className="text-xs font-bold text-slate-600">OPA_POLICY_v4</span>
                </div>
                <div className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                  item.severity === 'High' ? 'bg-legal-main/10 text-legal-main' : 
                  item.severity === 'Medium' ? 'bg-amber-100 text-amber-700' : 
                  'bg-slate-100 text-slate-500'
                }`}>
                  {item.severity} RISK
                </div>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-32 flex flex-col items-center justify-center bg-slate-50 rounded-[4rem] border-4 border-dashed border-slate-100 p-12 text-center">
             <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-4xl mb-6 grayscale opacity-50">⚖️</div>
             <h4 className="text-2xl font-black text-slate-300 uppercase tracking-tighter">Handshake Required</h4>
             <p className="text-slate-400 font-medium max-w-sm mt-3 text-sm">Legal RLS enforcement has fully isolated the compliance stream. Your identity block does not map to the risk matrix segment.</p>
          </div>
        )}
      </div>

      <SecureUploader category="Legal" onUploadSuccess={fetchData} />
      <DiscoveryVault />
      <NexusAssistant currentCategory="compliance" />
    </div>
  );
};

export default LegalView;
