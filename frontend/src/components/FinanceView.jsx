import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../api_config';
import { useAuth } from '../context/AuthContext';
import { parseAISummary } from '../utils/AIParser';
import DiscoveryVault from './DiscoveryVault';
import NexusAssistant from './NexusAssistant';
import SecureUploader from './SecureUploader';

const FinanceView = () => {
  const { token } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchData = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/v1/data/costs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateAI = async () => {
    setIsGenerating(true);
    if (!token) return;
    try {
      const res = await axios.post(`${API_BASE_URL}/v1/ai/summarize/costs`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAiInsight(res.data?.ai_insight || "AI returned empty summary.");
    } catch (err) {
      setAiInsight("AI analysis failed to connect.");
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Finance Intelligence</h2>
          <p className="text-slate-500 font-medium">Secure Cost Management & Budget Monitoring</p>
        </div>
        <button 
          onClick={generateAI}
          disabled={isGenerating}
          className="group px-6 py-3 bg-finance-main text-white rounded-2xl font-bold hover:bg-finance-dark transition-all disabled:opacity-50 flex items-center gap-3 shadow-xl shadow-finance-main/20 active:scale-95"
        >
          {isGenerating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '✨'}
          {isGenerating ? 'Analyzing Ledger...' : 'Generate AI Summary'}
        </button>
      </div>

      {aiInsight && (
        <div className="relative glass-panel p-8 rounded-[2.5rem] shadow-2xl shadow-finance-main/5 animate-in zoom-in-95 duration-500 max-h-[500px] overflow-y-auto custom-scrollbar">
          <div className="sticky top-0 bg-white/80 backdrop-blur-md pb-4 z-10">
            <div className="absolute top-0 left-0 w-2 h-full bg-finance-main -ml-8"></div>
            <h3 className="text-xs font-black text-finance-main uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-finance-main animate-pulse" />
              Nexus AI Financial Intelligence
            </h3>
          </div>
          
          {(() => {
            const structured = parseAISummary(aiInsight);
            return (
              <div className="space-y-6 mt-4">
                {structured.summary && (
                  <div>
                    <h4 className="text-[10px] font-black text-finance-main uppercase tracking-widest mb-1">Current Security Posture</h4>
                    <p className="text-slate-700 leading-relaxed text-lg font-medium italic">{structured.summary}</p>
                  </div>
                )}

                {structured.insights.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-black text-finance-main uppercase tracking-widest mb-2">Strategic Operational Insights</h4>
                    <ul className="space-y-2">
                      {structured.insights.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-slate-600 font-medium text-sm">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-finance-main/40 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {structured.actions.length > 0 && (
                  <div className="bg-finance-light/20 p-5 rounded-3xl border border-finance-main/10 shadow-inner">
                    <h4 className="text-[10px] font-black text-finance-main uppercase tracking-widest mb-2">Mandatory Fiscal Actions</h4>
                    <ul className="space-y-2">
                      {structured.actions.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-slate-800 font-bold text-sm">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-sm bg-finance-main flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-8 py-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
           <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Enterprise Ledger</span>
           <div className="flex gap-2">
             <div className="w-3 h-3 rounded-full bg-red-400/20 border border-red-400/40"></div>
             <div className="w-3 h-3 rounded-full bg-amber-400/20 border border-amber-400/40"></div>
             <div className="w-3 h-3 rounded-full bg-green-400/20 border border-green-400/40"></div>
           </div>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
              <th 
                className="px-8 py-4 cursor-pointer hover:text-finance-main transition-colors flex items-center gap-2"
                onClick={() => {
                  const sorted = [...data].sort((a, b) => a.content.localeCompare(b.content));
                  setData(sorted);
                }}
              >
                Asset Identification ↕
              </th>
              <th className="px-8 py-4 text-center">Security Clearance</th>
              <th className="px-8 py-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="3" className="px-8 py-20">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-1 bg-slate-100 overflow-hidden rounded-full">
                       <div className="w-full h-full bg-finance-main -translate-x-full animate-[progress_1.5s_infinite]" />
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Decrypting encrypted stream...</span>
                  </div>
                </td>
              </tr>
            ) : (Array.isArray(data) && data.length > 0) ? (
              data.map((item, idx) => (
                <tr key={idx} className="group hover:bg-slate-50/50 transition-all cursor-default">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-finance-light/30 flex items-center justify-center text-finance-main font-bold border border-finance-main/10 group-hover:bg-finance-main group-hover:text-white transition-all shadow-sm">
                        {idx + 1}
                      </div>
                      <span className="font-bold text-slate-800 text-lg tracking-tight">{item.content}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-finance-light/50 text-finance-main rounded-full text-[10px] font-black uppercase ring-1 ring-finance-main/20">
                      SECURED_ROLE_AUTH
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className="flex items-center justify-end gap-2 text-sm font-bold text-green-500 uppercase tracking-tighter">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      Online
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="px-8 py-20 text-center">
                   <div className="max-w-xs mx-auto">
                     <div className="text-4xl mb-4 text-slate-300">🔐</div>
                     <h4 className="font-black text-slate-900 uppercase tracking-tighter text-xl">RLS Isolation Protocol</h4>
                     <p className="text-slate-500 text-sm mt-3 leading-relaxed">Postgres Layer: Your credential set is currently unauthorized to view the financial data segment.</p>
                   </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <SecureUploader category="Finance" onUploadSuccess={fetchData} />
      <DiscoveryVault />
      <NexusAssistant currentCategory="costs" />
    </div>
  );
};

export default FinanceView;
